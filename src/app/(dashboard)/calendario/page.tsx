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
  Trash2,
  Mail,
  Send,
  Share2,
  Users,
  Search,
  CheckSquare,
  Square,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { notifyCalendarEventCreatedAction } from '@/app/actions/notifications'
import {
  sendEventInvitationsAction,
  getSelectableRecipientsAction,
  SelectableRecipient,
} from '@/app/actions/event-invitations'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  category: 'task' | 'consulting' | 'course' | 'call' | 'notice'
  description?: string
  meet_url?: string
}

const PRESET_MEET_ROOMS = [
  {
    id: 'masterclass',
    label: '🎓 Masterclass Corsisti',
    desc: 'Dirette live e Q&A del giovedì',
    url: 'https://meet.google.com/wsv-bqxm-bvr',
  },
  {
    id: 'clients',
    label: '🤝 Clienti & Briefing B2B',
    desc: 'Audit e consulenze riservate PMI',
    url: 'https://meet.google.com/yme-pyws-osa',
  },
  {
    id: 'team',
    label: '👥 Riunione Soci & Team',
    desc: 'Allineamento interno protetto',
    url: 'https://meet.google.com/mth-rqxp-bdf',
  },
  {
    id: 'lab',
    label: '🛠️ Lab Agenti AI Pro',
    desc: 'Laboratorio tecnico avanzato',
    url: 'https://meet.google.com/dwe-rczj-uxz',
  },
]

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('09:00')
  const [eventCategory, setEventCategory] = useState<'task' | 'consulting' | 'course' | 'call' | 'notice'>('call')
  const [eventMeetUrl, setEventMeetUrl] = useState('https://meet.google.com/wsv-bqxm-bvr')
  const [eventDesc, setEventDesc] = useState('')
  const [recipientType, setRecipientType] = useState<'single' | 'ai-start' | 'ai-pro' | 'all' | 'pending'>('single')
  const [recipientCategories, setRecipientCategories] = useState<string[]>(['single'])
  const [studentCohort, setStudentCohort] = useState<'new' | 'all'>('new')
  const [customEmails, setCustomEmails] = useState('')
  const [senderProfile, setSenderProfile] = useState<'campus' | 'impresa'>('campus')
  const [customSenderName, setCustomSenderName] = useState('')
  const [sendEmailInvite, setSendEmailInvite] = useState(true)
  const [emailTiming, setEmailTiming] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  })
  const [scheduledTime, setScheduledTime] = useState('08:30')
  const [isSendingInvitations, setIsSendingInvitations] = useState(false)
  const [sendingEventId, setSendingEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Selezione puntuale contatti dal Database
  const [isDbPickerOpen, setIsDbPickerOpen] = useState(false)
  const [dbContacts, setDbContacts] = useState<SelectableRecipient[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [dbSearchQuery, setDbSearchQuery] = useState('')
  const [selectedDbEmails, setSelectedDbEmails] = useState<string[]>([])
  const [dbSourceFilter, setDbSourceFilter] = useState<'all' | 'student' | 'client' | 'lead'>('all')

  const loadDatabaseContacts = async () => {
    if (dbContacts.length > 0) {
      setIsDbPickerOpen(true)
      return
    }
    setLoadingContacts(true)
    setIsDbPickerOpen(true)
    const res = await getSelectableRecipientsAction()
    if (res.success && res.recipients) {
      setDbContacts(res.recipients)
    }
    setLoadingContacts(false)
  }

  const toggleSelectContact = (email: string) => {
    setSelectedDbEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  const applySelectedDbContacts = () => {
    if (selectedDbEmails.length === 0) {
      setIsDbPickerOpen(false)
      return
    }
    // Aggiungi a customEmails senza duplicare
    const existing = customEmails
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
    const merged = Array.from(new Set([...existing, ...selectedDbEmails]))
    setCustomEmails(merged.join(', '))
    if (!recipientCategories.includes('single')) {
      setRecipientCategories((prev) => [...prev, 'single'])
    }
    setIsDbPickerOpen(false)
  }

  const supabase = createClient()

  useEffect(() => {
    fetchTasksForCalendar()
  }, [])

  const fetchTasksForCalendar = async () => {
    setLoading(true)
    try {
      // 1. Carica i task reali dal Kanban
      const { data: tasksData } = await supabase.from('tasks').select('*')
      const taskEvents: CalendarEvent[] = (tasksData || []).map((t: any) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.due_date ? t.due_date.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        time: '12:00',
        category: 'task',
        description: t.description || 'Task dal Kanban',
      }))

      // 2. Carica gli eventi reali del calendario da Supabase
      const { data: calData } = await (supabase as any)
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true })

      const dbCalEvents: CalendarEvent[] = (calData || []).map((ev: any) => {
        // Estrai meet_url se memorizzato in descrizione con prefisso [MEET: ...]
        let meetUrl = ''
        let cleanDesc = ev.description || ''
        const match = cleanDesc.match(/\[MEET:\s*([^\]]+)\]/)
        if (match) {
          meetUrl = match[1].trim()
          cleanDesc = cleanDesc.replace(/\[MEET:\s*[^\]]+\]/, '').trim()
        }

        return {
          id: ev.id,
          title: ev.title,
          date: ev.event_date,
          time: ev.event_time || '09:00',
          category: ev.category as any,
          description: cleanDesc,
          meet_url: meetUrl,
        }
      })

      setEvents([...dbCalEvents, ...taskEvents])
    } catch (err) {
      console.error('Errore caricamento eventi calendario:', err)
    } finally {
      setLoading(false)
    }
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) return

    try {
      const { data: userData } = await supabase.auth.getUser()

      // Componi la descrizione includendo meet_url se presente
      let finalDesc = eventDesc.trim()
      if (eventMeetUrl.trim()) {
        finalDesc = `${finalDesc} [MEET: ${eventMeetUrl.trim()}]`.trim()
      }

      const { data: newRow, error } = await (supabase as any)
        .from('calendar_events')
        .insert({
          title: eventTitle.trim(),
          description: finalDesc,
          event_date: selectedDateStr,
          event_time: eventTime,
          category: eventCategory,
          created_by: userData.user?.id || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Errore salvataggio evento su DB:', error.message)
        alert(`Attenzione: Impossibile salvare l'evento sul database: ${error.message}`)
        return
      }

      if (newRow) {
        const createdEvent: CalendarEvent = {
          id: newRow.id,
          title: newRow.title,
          date: newRow.event_date,
          time: newRow.event_time,
          category: newRow.category as any,
          description: eventDesc.trim(),
          meet_url: eventMeetUrl.trim(),
        }
        setEvents([createdEvent, ...events])
      }

      playNotificationSound('chat')
      
      // Invia notifica Telegram asincrona al gruppo
      notifyCalendarEventCreatedAction({
        title: eventTitle.trim(),
        date: selectedDateStr,
        time: eventTime,
        category: eventCategory,
      }).catch((e) => console.error('Errore notifica Telegram evento calendario:', e))

      // Invia inviti o programma email tramite Resend se abilitato
      let emailReportMsg = ''
      const hasSelectedCategories = recipientCategories.length > 0 && (recipientCategories.some(c => c !== 'single') || customEmails.trim().length > 0)
      if (sendEmailInvite && hasSelectedCategories) {
        setIsSendingInvitations(true)
        
        let scheduledIsoString: string | undefined = undefined
        if (emailTiming === 'scheduled') {
          // Calcola data e ora esatta in formato ISO 8601 per Resend
          const [sYear, sMonth, sDay] = scheduledDate.split('-').map(Number)
          const [sHour, sMin] = scheduledTime.split(':').map(Number)
          const targetDateObj = new Date(sYear, sMonth - 1, sDay, sHour, sMin, 0)
          scheduledIsoString = targetDateObj.toISOString()
        }

        const resEmail = await sendEventInvitationsAction({
          eventTitle: eventTitle.trim(),
          eventDate: selectedDateStr,
          eventTime,
          meetUrl: eventMeetUrl.trim(),
          description: eventDesc.trim(),
          recipientCategories: recipientCategories as any,
          studentCohort,
          customEmails: customEmails.trim(),
          scheduledAt: scheduledIsoString,
          senderProfile,
          customSenderName: customSenderName.trim() || undefined,
        })
        setIsSendingInvitations(false)

        if (resEmail.success) {
          if (emailTiming === 'scheduled') {
            emailReportMsg = `\n⏰ Invio programmato con successo per il ${scheduledDate} alle ore ${scheduledTime} (${resEmail.sentCount} destinatari via Resend).`
          } else {
            emailReportMsg = `\n✉️ Inviti inviati subito con successo a ${resEmail.sentCount} destinatari via Resend!`
          }
        } else {
          emailReportMsg = `\n⚠️ Attenzione invio email: ${resEmail.error}`
        }
      }

      alert(`Evento "${eventTitle}" aggiunto al Calendario!${emailReportMsg}`)

      setIsEventModalOpen(false)
      setEventTitle('')
      setEventMeetUrl('https://meet.google.com/wsv-bqxm-bvr')
      setEventDesc('')
      setCustomEmails('')
      setRecipientType('single')
      setEmailTiming('now')
    } catch (err: any) {
      alert(`Errore: ${err.message}`)
    }
  }

  const handleSendManualInvites = async (ev: CalendarEvent) => {
    const isNotice = !ev.meet_url?.trim()
    const actionLabel = isNotice ? 'la comunicazione' : 'gli inviti con link Meet'
    const confirmMsg = `Vuoi inviare ora ${actionLabel} via email per:\n\n"${ev.title}" (${ev.date} ore ${ev.time || '10:00'})?\n\nVerranno inviate agli studenti della Nuova Edizione.`
    if (!confirm(confirmMsg)) return

    try {
      setSendingEventId(ev.id)
      const res = await sendEventInvitationsAction({
        eventTitle: ev.title,
        eventDate: ev.date,
        eventTime: ev.time || '10:00',
        meetUrl: ev.meet_url?.trim() || '',
        description: ev.description,
        recipientCategories: ['ai-start', 'ai-pro'],
        studentCohort: 'new',
      })
      setSendingEventId(null)

      if (res.success) {
        alert(`✉️ Invii completati con successo a ${res.sentCount} destinatari via Resend!`)
      } else {
        alert(`Errore invio: ${res.error}`)
      }
    } catch (err: any) {
      setSendingEventId(null)
      alert(`Errore imprevisto: ${err.message}`)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento dal calendario?')) return

    try {
      if (eventId.startsWith('task-')) {
        const taskId = eventId.replace('task-', '')
        await supabase.from('tasks').delete().eq('id', taskId)
      } else {
        await (supabase as any).from('calendar_events').delete().eq('id', eventId)
      }

      setEvents(events.filter((e) => e.id !== eventId))
    } catch (err: any) {
      alert(`Errore eliminazione: ${err.message}`)
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'consulting':
        return <Badge variant="info" className="text-[9px] px-1.5">Consulenza</Badge>
      case 'course':
        return <Badge variant="purple" className="text-[9px] px-1.5">Corso</Badge>
      case 'call':
        return <Badge variant="warning" className="text-[9px] px-1.5">Videocall</Badge>
      case 'notice':
        return <Badge className="text-[9px] px-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">Avviso</Badge>
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
      case 'notice':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
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
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const todayObj = new Date()
              const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`
              const isToday = dateStr === todayStr
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
                  Eventi per il {(() => {
                    const [y, m, d] = selectedDateStr.split('-').map(Number)
                    return new Date(y, m - 1, d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                  })()}
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
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{ev.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {getCategoryBadge(ev.category)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="h-6 w-6 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Elimina Evento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    {/* Pulsanti Azione: Disponibili sia con Meet che per soli Avvisi/Comunicazioni */}
                    <div className="pt-1.5 space-y-1.5">
                      {ev.meet_url && (
                        <Button
                          size="sm"
                          onClick={() => window.open(ev.meet_url, '_blank')}
                          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-xs justify-center"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Partecipa su Google Meet
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const meetText = ev.meet_url ? `\nEcco il link Google Meet: ${ev.meet_url}` : ''
                            const text = encodeURIComponent(
                              `Ciao! Ti confermo: "${ev.title}" per il ${ev.date} alle ${ev.time || '10:00'}.${meetText}\n\n${ev.description || ''}`
                            )
                            window.open(`https://wa.me/?text=${text}`, '_blank')
                          }}
                          className="h-7 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-[11px] font-semibold gap-1 justify-center"
                          title="Invia promemoria su WhatsApp"
                        >
                          <Share2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={sendingEventId === ev.id}
                          onClick={() => handleSendManualInvites(ev)}
                          className="h-7 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-[11px] font-semibold gap-1 justify-center"
                          title="Invia adesso l'email a tutti gli iscritti via Resend"
                        >
                          {sendingEventId === ev.id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500 shrink-0" />
                          ) : (
                            <Send className="h-3 w-3 text-blue-500 shrink-0" />
                          )}
                          Invia Email
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {ev.time || '10:00'}
                      </span>
                      {ev.meet_url ? (
                        <span className="text-sky-500 font-sans font-medium flex items-center gap-1 truncate max-w-[180px]">
                          📹 {ev.meet_url.replace('https://', '')}
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-sans font-medium flex items-center gap-1">
                          📢 Comunicazione Email
                        </span>
                      )}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEventModalOpen(false)
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header fisso con X sempre visibile */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuovo Evento a Calendario</h3>
                  <p className="text-[11px] text-slate-400">Pianifica videoconferenza o invia convocazioni via email</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEventModalOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                title="Chiudi (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Corpo form con scrollbar fluida interna */}
            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs overflow-y-auto flex-1 overscroll-contain">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {eventCategory === 'notice' ? 'Oggetto della Comunicazione *' : 'Titolo Evento / Appuntamento *'}
                </label>
                <Input
                  autoFocus
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={eventCategory === 'notice' ? "Es. Aggiornamento Importante per i Corsisti, Guida Laboratorio..." : "Es. Sessione Consulenza AlfaCorp, Videocall Team..."}
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {eventCategory !== 'notice' && (
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
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Orario Riunione</label>
                    <Input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="text-xs dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Categoria Evento / Azione</label>
                <select
                  value={eventCategory}
                  onChange={(e: any) => {
                    const val = e.target.value
                    setEventCategory(val)
                    if (val === 'task') {
                      setSendEmailInvite(false)
                    } else if (val === 'notice') {
                      setSendEmailInvite(true)
                      setEventMeetUrl('')
                    } else {
                      setSendEmailInvite(true)
                      if (!eventMeetUrl) setEventMeetUrl('https://meet.google.com/wsv-bqxm-bvr')
                    }
                  }}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-background dark:bg-slate-800 px-3 text-xs"
                >
                  <option value="call">📹 Riunione Videocall / Live Meet (con Link)</option>
                  <option value="course">🎓 Lezione Corso Formativo (con Link)</option>
                  <option value="notice">📢 Comunicazione / Avviso Studenti (Senza Link Video)</option>
                  <option value="consulting">🤝 Appuntamento / Consulenza Di Persona</option>
                  <option value="task">📌 Promemoria / Scadenza Interna</option>
                </select>
              </div>

              {/* Sezione Link Videocall (Opzionale o Modificabile) */}
              <div className="space-y-2 bg-sky-500/5 dark:bg-sky-500/10 p-3.5 rounded-xl border border-sky-500/20">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5 text-xs">
                    <Video className="h-3.5 w-3.5 text-sky-500" />
                    Stanza & Link Riunione (Opzionale)
                  </label>
                  {eventMeetUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setEventMeetUrl('')}
                      className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold cursor-pointer flex items-center gap-0.5"
                    >
                      <X className="h-3 w-3" />
                      Rimuovi Link (Solo Comunicazione)
                    </button>
                  )}
                </div>

                {/* Chips Stanze Separate Dedicate */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {PRESET_MEET_ROOMS.map((room) => {
                    const isSelected = eventMeetUrl.trim().toLowerCase() === room.url.toLowerCase()
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setEventMeetUrl(room.url)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                        }`}
                      >
                        <span className="font-bold text-[11px] truncate">{room.label}</span>
                        <span className={`text-[9px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                          {room.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-1">
                  <div className="relative flex items-center">
                    <Input
                      value={eventMeetUrl}
                      onChange={(e) => setEventMeetUrl(e.target.value)}
                      placeholder="Nessun link (es. solo avviso/comunicazione) o incolla Google Meet/Zoom..."
                      className="text-xs bg-white dark:bg-slate-900 border-sky-500/30 text-sky-600 dark:text-sky-300 font-mono h-8 pr-7"
                    />
                    {eventMeetUrl.trim() && (
                      <button
                        type="button"
                        onClick={() => setEventMeetUrl('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Cancella link"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Lascia il campo vuoto se vuoi inviare solo una comunicazione scritta senza pulsante di videochiamata.
                  </p>
                </div>
              </div>

                  {/* Sezione Destinatari & Notifiche Email */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        Destinatari Invito & Notifiche
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        <input
                          type="checkbox"
                          checked={sendEmailInvite}
                          onChange={(e) => setSendEmailInvite(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        Invia Email Automatica (Resend)
                      </label>
                    </div>

                    {sendEmailInvite && (
                      <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            Seleziona Categorie Destinatari (Multiscelta):
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const allCats = ['pending', 'ai-start', 'ai-pro', 'waitlist', 'single']
                              if (recipientCategories.length === allCats.length) {
                                setRecipientCategories([])
                              } else {
                                setRecipientCategories(allCats)
                              }
                            }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            {recipientCategories.length === 5 ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
                          </button>
                        </div>

                        {/* Grid Checkbox Multiscelta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* 1. Registrati in Attesa di Pagamento */}
                          <label className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            recipientCategories.includes('pending')
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={recipientCategories.includes('pending')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecipientCategories([...recipientCategories, 'pending'])
                                } else {
                                  setRecipientCategories(recipientCategories.filter(c => c !== 'pending'))
                                }
                              }}
                              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold block text-[11px]">⏳ Registrati in Attesa</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">Partecipanti call di vendita / non pagati</span>
                            </div>
                          </label>

                          {/* 2. Studenti Base (AI Start) */}
                          <label className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            recipientCategories.includes('ai-start')
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={recipientCategories.includes('ai-start')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecipientCategories([...recipientCategories, 'ai-start'])
                                } else {
                                  setRecipientCategories(recipientCategories.filter(c => c !== 'ai-start'))
                                }
                              }}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold block text-[11px]">🎓 Studenti AI Start</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">Accreditati con codice attivo</span>
                            </div>
                          </label>

                          {/* 3. Studenti Avanzato (AI Pro) */}
                          <label className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            recipientCategories.includes('ai-pro')
                              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={recipientCategories.includes('ai-pro')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecipientCategories([...recipientCategories, 'ai-pro'])
                                } else {
                                  setRecipientCategories(recipientCategories.filter(c => c !== 'ai-pro'))
                                }
                              }}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold block text-[11px]">🚀 Studenti AI Pro B2B</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">Iscritti corso agenti</span>
                            </div>
                          </label>

                          {/* 4. Lista d'Attesa Leads */}
                          <label className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            recipientCategories.includes('waitlist')
                              ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-200 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={recipientCategories.includes('waitlist')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecipientCategories([...recipientCategories, 'waitlist'])
                                } else {
                                  setRecipientCategories(recipientCategories.filter(c => c !== 'waitlist'))
                                }
                              }}
                              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold block text-[11px]">📋 Lista d'Attesa AI Pro</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">Lead registrati al lancio</span>
                            </div>
                          </label>
                        </div>

                        {/* Filtro Target Coorte Edizione Studenti */}
                        {(recipientCategories.includes('ai-start') || recipientCategories.includes('ai-pro')) && (
                          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-xl p-2.5 space-y-1.5 animate-fadeIn">
                            <label className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                              <span>🎯 Target Edizione Studenti:</span>
                              <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400">Filtro automatico anti-spam vecchi corsisti</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setStudentCohort('new')}
                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                  studentCohort === 'new'
                                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs ring-2 ring-blue-400/40'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                              >
                                <span className="block font-bold text-[11px] flex items-center gap-1">
                                  ✨ Solo Nuova Edizione
                                </span>
                                <span className={`block text-[10px] ${studentCohort === 'new' ? 'text-blue-100' : 'text-slate-500'}`}>
                                  Iscritti Settembre - Ottobre (12 Nuovi)
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentCohort('all')}
                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                  studentCohort === 'all'
                                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs ring-2 ring-blue-400/40'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                              >
                                <span className="block font-bold text-[11px]">
                                  📚 Tutti gli Studenti
                                </span>
                                <span className={`block text-[10px] ${studentCohort === 'all' ? 'text-blue-100' : 'text-slate-500'}`}>
                                  Inclusi i 28 storici di Maggio
                                </span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 5. Inserimento manuale email aggiuntive / Selezione dal Database */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={recipientCategories.includes('single')}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRecipientCategories([...recipientCategories, 'single'])
                                  } else {
                                    setRecipientCategories(recipientCategories.filter(c => c !== 'single'))
                                  }
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                              />
                              <span>➕ Destinatari Specifici (Database / Singoli):</span>
                            </label>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={loadDatabaseContacts}
                              className="h-6 text-[10px] gap-1 px-2 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold"
                            >
                              <Database className="h-3 w-3 text-blue-500" />
                              <span>Scegli dal Database</span>
                            </Button>
                          </div>

                          {recipientCategories.includes('single') && (
                            <div className="space-y-1">
                              <Input
                                value={customEmails}
                                onChange={(e) => setCustomEmails(e.target.value)}
                                placeholder="gianni@azienda.it, francesco@gmail.com..."
                                className="text-xs dark:bg-slate-900 dark:border-slate-700"
                              />
                              <p className="text-[10px] text-slate-400">
                                💡 Clicca su <strong>"Scegli dal Database"</strong> per spuntare direttamente studenti, clienti o soci con un clic.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 5.bis Selezione Profilo Mittente (Campus vs Impresa) & Nome Mittente Visibile */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>📮 Profilo Mittente & Indirizzo di Risposta:</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Personalizzabile per Business / Corsi</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Campus Option */}
                            <button
                              type="button"
                              onClick={() => setSenderProfile('campus')}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                senderProfile === 'campus'
                                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-400/40 shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] flex items-center gap-1">
                                  🎓 aiutiamoci Campus
                                </span>
                                {senderProfile === 'campus' && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">✓ Attivo</span>}
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                                Da: info@aiutiamoci.cloud
                              </span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                Risposte a: info@aiutiamoci.cloud
                              </span>
                            </button>

                            {/* Impresa Option */}
                            <button
                              type="button"
                              onClick={() => setSenderProfile('impresa')}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                senderProfile === 'impresa'
                                  ? 'bg-sky-500/15 border-sky-500/60 text-sky-950 dark:text-sky-200 ring-2 ring-sky-400/40 shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] flex items-center gap-1">
                                  💼 aiutiamoci Impresa
                                </span>
                                {senderProfile === 'impresa' && <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">✓ Attivo</span>}
                              </div>
                              <span className="text-[10px] text-sky-600 dark:text-sky-400 block mt-0.5 font-mono">
                                Da: impresa@aiutiamoci.cloud
                              </span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                Risposte a: <strong className="text-slate-700 dark:text-slate-200">info@mark2.cloud</strong>
                              </span>
                            </button>
                          </div>

                          {/* Personalizzazione Nome Visualizzato (Display Name) */}
                          <div className="pt-1.5 flex items-center gap-2">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                              Nome che vedrà il cliente:
                            </label>
                            <Input
                              value={customSenderName}
                              onChange={(e) => setCustomSenderName(e.target.value)}
                              placeholder={senderProfile === 'impresa' ? 'aiutiamoci Impresa' : 'aiutiamoci'}
                              className="text-xs h-7 dark:bg-slate-900 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        {/* 6. Selettore Modalità Invio (Subito vs Programmato con Data e Ora) */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              Tempistica di Spedizione:
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Gestito da Resend Scheduler</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEmailTiming('now')}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                emailTiming === 'now'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-400/30'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                              }`}
                            >
                              <span className="block font-bold text-[11px]">⚡ Invia Subito</span>
                              <span className={`block text-[10px] ${emailTiming === 'now' ? 'text-blue-100' : 'text-slate-400'}`}>
                                Al salvataggio
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmailTiming('scheduled')}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                emailTiming === 'scheduled'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs ring-2 ring-blue-400/30'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                              }`}
                            >
                              <span className="block font-bold text-[11px]">⏰ Programma Invio</span>
                              <span className={`block text-[10px] ${emailTiming === 'scheduled' ? 'text-blue-100' : 'text-slate-400'}`}>
                                Scegli giorno e ora
                              </span>
                            </button>
                          </div>

                          {/* Date & Time Picker per invio programmato */}
                          {emailTiming === 'scheduled' && (
                            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-800/60 space-y-2 animate-fadeIn">
                              <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200">
                                📅 Quando vuoi che parta la spedizione automatica?
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Giorno Spedizione:</label>
                                  <Input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="text-xs bg-white dark:bg-slate-900 h-8 dark:border-slate-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Orario Partenza:</label>
                                  <Input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="text-xs bg-white dark:bg-slate-900 h-8 dark:border-slate-700"
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                                ✨ L'email verrà inviata automaticamente all'orario indicato anche a piattaforma chiusa e computer spento.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>📝 Testo del Messaggio / Comunicazione</span>
                    {!eventMeetUrl.trim() && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Corpo Email
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {!eventMeetUrl.trim() ? 'Questo testo sarà il corpo principale dell\'email' : 'Opzionale'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Scrivi qui il messaggio per gli studenti (es. Benvenuti nel nuovo percorso formativo, vi informiamo che il materiale didattico è ora disponibile...)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[90px] leading-relaxed shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Tasto rapido WhatsApp per condividere al volo */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Ciao! Ti confermo la riunione "${eventTitle || 'Videocall'}" per il ${selectedDateStr} alle ${eventTime}.\nEcco il link Google Meet per collegarci: ${eventMeetUrl || 'https://meet.google.com/wsv-bqxm-bvr'}\nA presto!`
                    )
                    window.open(`https://wa.me/?text=${text}`, '_blank')
                  }}
                  className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold gap-1.5 h-9"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                  Invia su WhatsApp
                </Button>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEventModalOpen(false)}>
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSendingInvitations}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSendingInvitations ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Programmazione in corso...
                      </>
                    ) : emailTiming === 'scheduled' ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        Salva e Programma Invio
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Salva e Invia Subito
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Selettore Contatti dal Database */}
      {isDbPickerOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDbPickerOpen(false)
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Scegli Destinatari dal Database
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Spunta le persone a cui inviare la comunicazione
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDbPickerOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Barra di Ricerca & Filtri Sorgente */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  placeholder="Cerca per nome, email o azienda..."
                  className="pl-8 text-xs h-8 bg-white dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDbSourceFilter('all')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      dbSourceFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Tutti ({dbContacts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbSourceFilter('student')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      dbSourceFilter === 'student'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    🎓 Studenti ({dbContacts.filter((c) => c.source === 'student').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbSourceFilter('client')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      dbSourceFilter === 'client'
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    💼 Clienti ({dbContacts.filter((c) => c.source === 'client').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbSourceFilter('lead')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      dbSourceFilter === 'lead'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    📋 Lead ({dbContacts.filter((c) => c.source === 'lead').length})
                  </button>
                </div>

                {selectedDbEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDbEmails([])}
                    className="text-[10px] text-red-500 hover:underline font-semibold"
                  >
                    Azzera ({selectedDbEmails.length})
                  </button>
                )}
              </div>
            </div>

            {/* Lista Contatti Selezionabili */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[420px]">
              {loadingContacts ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-xs">Caricamento contatti dal database...</span>
                </div>
              ) : (() => {
                const filtered = dbContacts.filter((c) => {
                  const matchFilter = dbSourceFilter === 'all' || c.source === dbSourceFilter
                  const q = dbSearchQuery.trim().toLowerCase()
                  const matchQuery =
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    (c.detail && c.detail.toLowerCase().includes(q))
                  return matchFilter && matchQuery
                })

                if (filtered.length === 0) {
                  return (
                    <div className="py-10 text-center text-xs text-slate-400">
                      Nessun contatto trovato con questi criteri.
                    </div>
                  )
                }

                return filtered.map((c) => {
                  const isChecked = selectedDbEmails.includes(c.email)
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleSelectContact(c.email)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500/50 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 text-blue-600 dark:text-blue-400">
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate">{c.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                                c.source === 'student'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : c.source === 'client'
                                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                  : 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                              }`}
                            >
                              {c.source === 'student' ? 'Studente' : c.source === 'client' ? 'Cliente' : 'Lead'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-mono">
                            {c.email}
                          </span>
                          {c.detail && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {c.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Footer con conferma e contatore */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                {selectedDbEmails.length} {selectedDbEmails.length === 1 ? 'persona selezionata' : 'persone selezionate'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDbPickerOpen(false)}
                  className="h-8 text-xs"
                >
                  Annulla
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applySelectedDbContacts}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4"
                >
                  Conferma Selezione ({selectedDbEmails.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
