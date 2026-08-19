'use client'

import { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  Video,
  Layers,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  category: 'task' | 'consulting' | 'course' | 'call'
  description?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'e-1',
      title: 'Sessione Consulenza B2B AlfaCorp',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      category: 'consulting',
      description: 'Revisione deliverable ed allineamento contrattuale',
    },
    {
      id: 'e-2',
      title: 'Riunione Videocall di Allineamento Team',
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      category: 'call',
      description: 'Stanza WebRTC Jitsi Meet',
    },
  ])

  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('09:00')
  const [eventCategory, setEventCategory] = useState<'task' | 'consulting' | 'course' | 'call'>('task')
  const [eventDesc, setEventDesc] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchTasksForCalendar()
  }, [])

  const fetchTasksForCalendar = async () => {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*')

    if (data) {
      const taskEvents: CalendarEvent[] = data.map((t: any) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        time: '12:00',
        category: 'task',
        description: t.description || 'Task dal Kanban',
      }))

      setEvents((prev) => {
        const customEvents = prev.filter((e) => !e.id.startsWith('task-'))
        return [...customEvents, ...taskEvents]
      })
    }
    setLoading(false)
  }

  // Navigazione Mese
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Calcolo Giorni del Mese
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Lunedì = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) return

    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: eventTitle.trim(),
      date: selectedDateStr,
      time: eventTime,
      category: eventCategory,
      description: eventDesc,
    }

    setEvents([newEvent, ...events])
    playNotificationSound('chat')
    alert(`Evento "${eventTitle}" aggiunto con successo al Calendario!`)

    setIsEventModalOpen(false)
    setEventTitle('')
    setEventDesc('')
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'consulting':
        return <Badge variant="info" className="text-[9px] px-1.5">Consulenza</Badge>
      case 'course':
        return <Badge variant="purple" className="text-[9px] px-1.5">Corso</Badge>
      case 'call':
        return <Badge variant="warning" className="text-[9px] px-1.5">Videocall</Badge>
      default:
        return <Badge variant="secondary" className="text-[9px] px-1.5">Task Kanban</Badge>
    }
  }

  const getCategoryColorClass = (cat: string) => {
    switch (cat) {
      case 'consulting':
        return 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30'
      case 'course':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
      case 'call':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
      default:
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
    }
  }

  // Eventi della data selezionata
  const dayEvents = events.filter((e) => e.date === selectedDateStr)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Calendario Condiviso & Scadenze
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pianificazione di task, appuntamenti di consulenza, corsi e riunioni di team.
          </p>
        </div>

        <Button
          onClick={() => setIsEventModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-10 px-4 rounded-xl"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nuovo Evento</span>
        </Button>
      </div>

      {/* Grid Calendario + Sidebar Eventi del Giorno */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Viewport */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          {/* Controls Navigation Mese */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {monthName}
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentDate(new Date())
                  setSelectedDateStr(new Date().toISOString().split('T')[0])
                }}
                className="text-xs h-8 px-3"
              >
                Oggi
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Intestazione Giorni della Settimana */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Gio</span>
            <span>Ven</span>
            <span>Sab</span>
            <span>Dom</span>
          </div>

          {/* Griglia Giorni Mese */}
          <div className="grid grid-cols-7 gap-1">
            {/* Caselle Vuote di Inizio Mese */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl" />
            ))}

            {/* Giorni Effettivi */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dateObj = new Date(year, month, dayNum)
              const dateStr = dateObj.toISOString().split('T')[0]
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              const isSelected = dateStr === selectedDateStr
              const dayEvs = events.filter((e) => e.date === dateStr)

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                      : isToday
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center'
                          : isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvs.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvs.length}
                      </span>
                    )}
                  </div>

                  {/* Indicatori Eventi del Giorno */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate border ${getCategoryColorClass(
                          ev.category
                        )}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold px-1">
                        +{dayEvs.length - 2} altri
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar: Dettaglio Eventi della Data Selezionata */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Eventi per il {new Date(selectedDateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dayEvents.length} {dayEvents.length === 1 ? 'evento in programma' : 'eventi in programma'}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEventModalOpen(true)}
                className="h-8 text-xs gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Aggiungi
              </Button>
            </div>

            {/* Lista Eventi del Giorno */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {dayEvents.length > 0 ? (
                dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{ev.title}</span>
                      {getCategoryBadge(ev.category)}
                    </div>

                    {ev.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {ev.time || '10:00'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-6">
                  Nessun evento in programma per questa data. Clicca "Aggiungi" per creare un appuntamento!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Creazione Nuovo Evento */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuovo Evento a Calendario</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEventModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Evento / Appuntamento *</label>
                <Input
                  autoFocus
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Es. Sessione Consulenza AlfaCorp, Videocall Team..."
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Data Evento</label>
                  <Input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Orario</label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                <select
                  value={eventCategory}
                  onChange={(e: any) => setEventCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-background dark:bg-slate-800 px-3 text-xs"
                >
                  <option value="task">Scadenza Task Kanban</option>
                  <option value="consulting">Sessione Consulenza B2B</option>
                  <option value="course">Lezione Corso Formativo</option>
                  <option value="call">Riunione Videocall</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione (Opzionale)</label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Dettagli aggiuntivi per i partecipanti..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Aggiungi al Calendario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
