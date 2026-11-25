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
  Link2,
  Copy,
  Check,
  ExternalLink,
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
    label: 'Masterclass Corsisti',
    desc: 'Dirette live e Q&A del giovedì',
    url: 'https://meet.google.com/wsv-bqxm-bvr',
  },
  {
    id: 'clients',
    label: 'Clienti & Briefing B2B',
    desc: 'Audit e consulenze riservate PMI',
    url: 'https://meet.google.com/yme-pyws-osa',
  },
  {
    id: 'team',
    label: 'Riunione Soci & Team',
    desc: 'Allineamento interno protetto',
    url: 'https://meet.google.com/mth-rqxp-bdf',
  },
  {
    id: 'lab',
    label: 'Lab Agenti AI Pro',
    desc: 'Laboratorio tecnico avanzato',
    url: 'https://meet.google.com/dwe-rczj-uxz',
  },
]

function getDaysFromToday(dateStr: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 0
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

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
  const [recurrenceFreq, setRecurrenceFreq] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('none')
  const [recurrenceCount, setRecurrenceCount] = useState<number>(4)
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
  const [copiedPrenotaLink, setCopiedPrenotaLink] = useState(false)

  const handleCopyPrenotaLink = () => {
    navigator.clipboard.writeText('https://aiutiamoci.cloud/prenota')
    setCopiedPrenotaLink(true)
    setTimeout(() => setCopiedPrenotaLink(false), 2500)
  }

  // Selezione puntuale contatti dal Database
  const [isDbPickerOpen, setIsDbPickerOpen] = useState(false)
  const [dbContacts, setDbContacts] = useState<SelectableRecipient[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [dbSearchQuery, setDbSearchQuery] = useState('')
  const [selectedDbEmails, setSelectedDbEmails] = useState<string[]>([])
  const [dbSourceFilter, setDbSourceFilter] = useState<'all' | 'student' | 'client' | 'partner' | 'lead'>('all')

  const loadDatabaseContacts = async () => {
    // Inizializza i contatti già selezionati se presenti in customEmails
    const current = customEmails
      .split(/[,;\n]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
    setSelectedDbEmails(current)
    setIsDbPickerOpen(true)

    if (dbContacts.length === 0) {
      setLoadingContacts(true)
      try {
        const res = await getSelectableRecipientsAction()
        if (res.success && res.recipients) {
          setDbContacts(res.recipients)
        } else if (res.error) {
          console.error('Errore getSelectableRecipientsAction:', res.error)
        }
      } catch (err) {
        console.error('Eccezione caricamento contatti:', err)
      } finally {
        setLoadingContacts(false)
      }
    }
  }

  const toggleSelectContact = (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    setSelectedDbEmails((prev) =>
      prev.includes(cleanEmail)
        ? prev.filter((e) => e !== cleanEmail)
        : [...prev, cleanEmail]
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
    const existingLower = existing.map((e) => e.toLowerCase())
    const newItems = selectedDbEmails.filter((e) => !existingLower.includes(e))
    const merged = [...existing, ...newItems]
    
    setCustomEmails(merged.join(', '))
    if (!recipientCategories.includes('single')) {
      setRecipientCategories((prev) => [...prev, 'single'])
    }
    setIsDbPickerOpen(false)
  }

  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTasksForCalendar()
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .single()
        const role = profile?.role || user.user_metadata?.role
        setIsAdmin(role === 'admin' || role === 'dev')
      } catch {}
    }
    checkRole()
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

    if (eventCategory !== 'notice') {
      const diffDays = getDaysFromToday(selectedDateStr)
      if (diffDays > 30) {
        const ok = window.confirm(
          `Attenzione: stai creando l'evento "${eventTitle.trim()}" per la data ${selectedDateStr} (tra ${diffDays} giorni)${sendEmailInvite ? ' con INVIO EMAIL attivo ai destinatari' : ''}.\n\nConfermi che la data ${selectedDateStr} è corretta?`
        )
        if (!ok) return
      } else if (diffDays < 0) {
        const ok = window.confirm(
          `Attenzione: stai creando l'evento "${eventTitle.trim()}" per la data ${selectedDateStr} (${Math.abs(diffDays)} giorni fa)${sendEmailInvite ? ' con INVIO EMAIL attivo ai destinatari' : ''}.\n\nConfermi che la data ${selectedDateStr} è corretta?`
        )
        if (!ok) return
      }
    }

    try {
      const { data: userData } = await supabase.auth.getUser()

      // Componi la descrizione includendo meet_url se presente
      let finalDesc = eventDesc.trim()
      if (eventMeetUrl.trim()) {
        finalDesc = `${finalDesc} [MEET: ${eventMeetUrl.trim()}]`.trim()
      }

      // Calcola le date degli eventi (singolo o ricorrenti)
      let datesToInsert: string[] = [selectedDateStr]
      if (eventCategory !== 'notice' && recurrenceFreq !== 'none') {
        const count = Math.max(2, Math.min(24, recurrenceCount))
        datesToInsert = []
        const [baseY, baseM, baseD] = selectedDateStr.split('-').map(Number)
        for (let i = 0; i < count; i++) {
          if (recurrenceFreq === 'daily') {
            const d = new Date(baseY, baseM - 1, baseD + i)
            datesToInsert.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
          } else if (recurrenceFreq === 'weekly') {
            const d = new Date(baseY, baseM - 1, baseD + i * 7)
            datesToInsert.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
          } else if (recurrenceFreq === 'biweekly') {
            const d = new Date(baseY, baseM - 1, baseD + i * 14)
            datesToInsert.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
          } else if (recurrenceFreq === 'monthly') {
            const targetYear = baseY + Math.floor((baseM - 1 + i) / 12)
            const targetMonth = (baseM - 1 + i) % 12
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
            const clampedDay = Math.min(baseD, daysInMonth)
            datesToInsert.push(`${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`)
          }
        }
      }

      const rowsToInsert = datesToInsert.map((dStr) => ({
        title: eventTitle.trim(),
        description: finalDesc,
        event_date: dStr,
        event_time: eventTime,
        category: eventCategory,
        created_by: userData.user?.id || null,
      }))

      const { data: newRows, error } = await (supabase as any)
        .from('calendar_events')
        .insert(rowsToInsert)
        .select()

      if (error) {
        console.error('Errore salvataggio evento su DB:', error.message)
        alert(`Attenzione: Impossibile salvare l'evento sul database: ${error.message}`)
        return
      }

      const createdEvents: CalendarEvent[] = (newRows || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: row.event_date,
        time: row.event_time,
        category: row.category as any,
        description: eventDesc.trim(),
        meet_url: eventMeetUrl.trim(),
      }))

      if (createdEvents.length > 0) {
        setEvents((prev) => [...createdEvents, ...prev])
      }

      playNotificationSound('chat')
      
      // Invia notifica Telegram asincrona al gruppo (singola notifica per evitare spam)
      notifyCalendarEventCreatedAction({
        title: eventTitle.trim(),
        date: selectedDateStr,
        time: eventTime,
        category: eventCategory,
      }).catch((e) => console.error('Errore notifica Telegram evento calendario:', e))

      // Invia inviti o programma email tramite Resend se abilitato (singolo invito per la prima data)
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

      if (createdEvents.length > 1) {
        alert(`Aggiunti ${createdEvents.length} appuntamenti ricorrenti "${eventTitle}" al Calendario!${emailReportMsg}`)
      } else {
        alert(`Evento "${eventTitle}" aggiunto al Calendario!${emailReportMsg}`)
      }

      setIsEventModalOpen(false)
      setEventTitle('')
      setEventMeetUrl('https://meet.google.com/wsv-bqxm-bvr')
      setEventDesc('')
      setCustomEmails('')
      setRecipientType('single')
      setEmailTiming('now')
      setRecurrenceFreq('none')
      setRecurrenceCount(4)
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
  const trailingEmptyDays = (7 - ((startingDay + daysInMonth) % 7)) % 7

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* A) COMMAND BAR */}
      <div className="min-h-[52px] px-4 sm:px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h1
            className="text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5] capitalize truncate"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            {monthName}
          </h1>

          {/* Stepper Hairline < Oggi > */}
          <div className="inline-flex items-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] divide-x divide-[#e5e3dc] dark:divide-white/[0.08] overflow-hidden shrink-0">
            <button
              type="button"
              onClick={prevMonth}
              className="h-7 w-7 inline-flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-white dark:hover:bg-[#1f1f24] transition-colors cursor-pointer"
              title="Mese precedente"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                setCurrentDate(now)
                setSelectedDateStr(
                  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                )
              }}
              className="h-7 px-2.5 text-[11px] font-semibold text-[#111113] dark:text-[#f4f4f5] hover:bg-white dark:hover:bg-[#1f1f24] transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="h-7 w-7 inline-flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-white dark:hover:bg-[#1f1f24] transition-colors cursor-pointer"
              title="Mese successivo"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Copia Link Prenotazione */}
          <div className="inline-flex items-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] divide-x divide-[#e5e3dc] dark:divide-white/[0.08] overflow-hidden">
            <button
              type="button"
              onClick={handleCopyPrenotaLink}
              className="h-8 px-2.5 text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] hover:text-[#6366f1] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copia link pubblico di prenotazione (https://aiutiamoci.cloud/prenota)"
            >
              {copiedPrenotaLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10b981]" />
                  <span className="text-emerald-600 dark:text-[#10b981]">Link Copiato</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-[#6366f1]" />
                  <span className="hidden sm:inline">Copia Link Prenotazione</span>
                  <span className="sm:hidden">Prenota</span>
                </>
              )}
            </button>
            <a
              href="/prenota"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-white dark:hover:bg-[#1f1f24] inline-flex items-center justify-center transition-colors cursor-pointer"
              title="Apri pagina /prenota in una nuova scheda"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              const now = new Date()
              setCurrentDate(now)
              setSelectedDateStr(
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
              )
              setIsEventModalOpen(true)
            }}
            className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Nuovo Evento</span>
          </button>
        </div>
      </div>

      {/* B) SPLIT FULL-HEIGHT (GRIGLIA CALENDARIO + PANNELLO AGENDA GIORNO DESTRO) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Griglia Calendario Mensile Edge-to-Edge */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto bg-white dark:bg-[#0d0d0f]">
          {/* Intestazione Giorni della Settimana */}
          <div
            className="h-8 grid grid-cols-7 divide-x divide-[#e5e3dc] dark:divide-white/[0.08] border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#111114] text-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shrink-0 items-center"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Gio</span>
            <span>Ven</span>
            <span>Sab</span>
            <span>Dom</span>
          </div>

          {/* Matrice Giorni 7 Colonne Hairline */}
          <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(88px,1fr)] bg-[#e5e3dc] dark:bg-white/[0.08] gap-px border-b border-[#e5e3dc] dark:border-white/[0.08]">
            {/* Caselle Vuote Inizio Mese */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div
                key={`empty-start-${i}`}
                className="bg-[#fafaf8] dark:bg-[#0d0d0f]/75 p-2 min-h-[88px]"
              />
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
                  className={`p-2 min-h-[88px] transition-colors cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-[#f7f6f3] dark:bg-[#18181f] ring-1 ring-inset ring-[#6366f1]/70'
                      : 'bg-white dark:bg-[#0d0d0f] hover:bg-[#fafaf8] dark:hover:bg-[#141418]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        isToday
                          ? 'h-5 w-5 rounded-full bg-[#6366f1] text-white flex items-center justify-center'
                          : isSelected
                            ? 'text-[#6366f1]'
                            : 'text-[#111113] dark:text-[#f4f4f5]'
                      }`}
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {dayNum}
                    </span>

                    {dayEvs.length > 0 && (
                      <span
                        className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {dayEvs.length}
                      </span>
                    )}
                  </div>

                  {/* Chip Eventi Compatti */}
                  <div className="space-y-1 overflow-hidden mt-1">
                    {dayEvs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-xs truncate border ${getCategoryColorClass(
                          ev.category
                        )}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length > 2 && (
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold px-1 block">
                        +{dayEvs.length - 2} altri
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Caselle Vuote Fine Mese */}
            {Array.from({ length: trailingEmptyDays }).map((_, i) => (
              <div
                key={`empty-end-${i}`}
                className="bg-[#fafaf8] dark:bg-[#0d0d0f]/75 p-2 min-h-[88px]"
              />
            ))}
          </div>
        </div>

        {/* Pannello Agenda Giorno Destro */}
        <aside className="w-full lg:w-[360px] xl:w-[390px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#e5e3dc] dark:border-white/[0.08] bg-[#fafaf8] dark:bg-[#111114] flex flex-col overflow-hidden max-h-[42dvh] lg:max-h-none">
          {/* Header Sticky */}
          <div className="px-4 py-3 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <h2
                className="font-bold text-xs text-[#111113] dark:text-[#f4f4f5] truncate"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                {(() => {
                  const [y, m, d] = selectedDateStr.split('-').map(Number)
                  return new Date(y, m - 1, d).toLocaleDateString('it-IT', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                })()}
              </h2>
              <p
                className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {dayEvents.length}{' '}
                {dayEvents.length === 1 ? 'evento in programma' : 'eventi in programma'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="h-7 px-2.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#18181c] hover:border-[#6366f1] text-[#111113] dark:text-[#f4f4f5] text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Aggiungi evento in questa data"
            >
              <PlusCircle className="h-3 w-3 text-[#6366f1]" />
              <span>Aggiungi</span>
            </button>
          </div>

          {/* Lista Eventi Piatta divide-y */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#e5e3dc] dark:divide-white/[0.08]">
            {loading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-[#6366f1]" />
                <span>Caricamento eventi...</span>
              </div>
            ) : dayEvents.length > 0 ? (
              dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="px-4 py-3.5 space-y-2.5 text-xs hover:bg-white dark:hover:bg-[#16161b] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[13px] text-[#111113] dark:text-[#f4f4f5] leading-snug">
                      {ev.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {getCategoryBadge(ev.category)}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="h-6 w-6 rounded-sm text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 inline-flex items-center justify-center cursor-pointer"
                          title="Elimina Evento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {ev.description && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  {/* Azioni Evento */}
                  <div className="space-y-1.5">
                    {ev.meet_url && (
                      <button
                        type="button"
                        onClick={() => window.open(ev.meet_url, '_blank')}
                        className="w-full h-7 px-2.5 rounded-sm bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Partecipa su Google Meet</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const meetText = ev.meet_url
                            ? `\nEcco il link Google Meet: ${ev.meet_url}`
                            : ''
                          const text = encodeURIComponent(
                            `Ciao! Ti confermo: "${ev.title}" per il ${ev.date} alle ${ev.time || '10:00'}.${meetText}\n\n${ev.description || ''}`
                          )
                          window.open(`https://wa.me/?text=${text}`, '_blank')
                        }}
                        className="h-7 rounded-sm border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Invia promemoria su WhatsApp"
                      >
                        <Share2 className="h-3 w-3 text-[#10b981] shrink-0" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        disabled={sendingEventId === ev.id}
                        onClick={() => handleSendManualInvites(ev)}
                        className="h-7 rounded-sm border border-[#e5e3dc] dark:border-white/[0.1] text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] hover:text-[#6366f1] text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                        title="Invia adesso l'email a tutti gli iscritti via Resend"
                      >
                        {sendingEventId === ev.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-[#6366f1] shrink-0" />
                        ) : (
                          <Send className="h-3 w-3 text-[#6366f1] shrink-0" />
                        )}
                        <span>Invia Email</span>
                      </button>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-500 pt-1"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ev.time || '10:00'}
                    </span>
                    {ev.meet_url ? (
                      <span className="text-[#6366f1] font-sans font-medium inline-flex items-center gap-1 truncate max-w-[200px]">
                        <Video className="h-3 w-3 shrink-0" />
                        {ev.meet_url.replace('https://', '')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-[#10b981] font-sans font-medium inline-flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        Comunicazione Email
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Nessun evento in programma per questa data. Clicca &ldquo;Aggiungi&rdquo; per
                creare un appuntamento.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal Creazione Nuovo Evento */}
      {isEventModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEventModalOpen(false)
          }}
        >
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-xl border border-[#e5e3dc] dark:border-white/[0.1] flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header fisso con X sempre visibile */}
            <div className="px-5 py-3.5 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-[#6366f1]/15 text-[#6366f1] flex items-center justify-center font-bold">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Nuovo Evento a Calendario
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Pianifica videoconferenza o invia convocazioni via email
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEventModalOpen(false)}
                className="h-8 w-8 rounded-md text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
                title="Chiudi (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Corpo form con scrollbar fluida interna */}
            <form
              onSubmit={handleCreateEvent}
              className="p-5 space-y-4 text-xs overflow-y-auto flex-1 overscroll-contain"
            >
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                  {eventCategory === 'notice'
                    ? 'Oggetto della Comunicazione *'
                    : 'Titolo Evento / Appuntamento *'}
                </label>
                <Input
                  autoFocus
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={
                    eventCategory === 'notice'
                      ? 'Es. Aggiornamento Importante per i Corsisti, Guida Laboratorio...'
                      : 'Es. Sessione Consulenza AlfaCorp, Videocall Team...'
                  }
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                />
              </div>

              {eventCategory !== 'notice' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                      Data Evento
                    </label>
                    <Input
                      type="date"
                      value={selectedDateStr}
                      onChange={(e) => setSelectedDateStr(e.target.value)}
                      className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                    />
                    {(() => {
                      const diffDays = getDaysFromToday(selectedDateStr)
                      if (diffDays > 30) {
                        return (
                          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md px-2 py-1">
                            Data lontana: verifica l&apos;anno e il mese prima di inviare gli inviti
                          </p>
                        )
                      }
                      if (diffDays < 0) {
                        return (
                          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md px-2 py-1">
                            Data nel passato ({Math.abs(diffDays)} giorni fa): verifica prima di
                            procedere
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                      Orario Riunione
                    </label>
                    <Input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                    />
                  </div>
                </div>
              )}

              {eventCategory !== 'notice' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                      Ricorrenza
                    </label>
                    <select
                      value={recurrenceFreq}
                      onChange={(e: any) => setRecurrenceFreq(e.target.value)}
                      className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                    >
                      <option value="none">Non si ripete (Solo questa data)</option>
                      <option value="weekly">Ogni settimana</option>
                      <option value="biweekly">Ogni 2 settimane</option>
                      <option value="daily">Ogni giorno</option>
                      <option value="monthly">Ogni mese</option>
                    </select>
                  </div>

                  {recurrenceFreq !== 'none' && (
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                        Numero di incontri
                      </label>
                      <Input
                        type="number"
                        min={2}
                        max={24}
                        value={recurrenceCount}
                        onChange={(e) =>
                          setRecurrenceCount(Math.max(2, Math.min(24, Number(e.target.value) || 2)))
                        }
                        className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1] rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5]">
                  Categoria Evento / Azione
                </label>
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
                  className="w-full h-9 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3 text-xs text-[#111113] dark:text-[#f4f4f5]"
                >
                  <option value="call">Riunione Videocall / Live Meet (con Link)</option>
                  <option value="course">Lezione Corso Formativo (con Link)</option>
                  <option value="notice">
                    Comunicazione / Avviso Studenti (Senza Link Video)
                  </option>
                  <option value="consulting">Appuntamento / Consulenza Di Persona</option>
                  <option value="task">Promemoria / Scadenza Interna</option>
                </select>
              </div>

              {/* Sezione Link Videocall */}
              <div className="space-y-2 bg-[#f7f6f3] dark:bg-[#0d0d0f] p-3.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5 text-xs">
                    <Video className="h-3.5 w-3.5 text-[#6366f1]" />
                    Stanza &amp; Link Riunione (Opzionale)
                  </label>
                  {eventMeetUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setEventMeetUrl('')}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-0.5"
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
                        className={`px-2.5 py-1.5 rounded-md border text-left transition-colors cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'bg-[#6366f1] border-[#6366f1] text-white'
                            : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-700 dark:text-[#f4f4f5] hover:border-[#6366f1]/50'
                        }`}
                      >
                        <span className="font-bold text-[11px] truncate">{room.label}</span>
                        <span
                          className={`text-[9px] truncate ${
                            isSelected ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
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
                      className="text-xs bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] font-mono h-8 pr-7 rounded-md"
                    />
                    {eventMeetUrl.trim() && (
                      <button
                        type="button"
                        onClick={() => setEventMeetUrl('')}
                        className="absolute right-2 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
                        title="Cancella link"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Lascia il campo vuoto se vuoi inviare solo una comunicazione scritta senza
                    pulsante di videochiamata.
                  </p>
                </div>
              </div>

              {/* Sezione Destinatari & Notifiche Email */}
              <div className="space-y-3 bg-[#f7f6f3] dark:bg-[#0d0d0f] p-3.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5 text-[#6366f1]" />
                    Destinatari Invito &amp; Notifiche
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                    <input
                      type="checkbox"
                      checked={sendEmailInvite}
                      onChange={(e) => setSendEmailInvite(e.target.checked)}
                      className="rounded text-[#6366f1] focus:ring-[#6366f1] h-3.5 w-3.5"
                    />
                    Invia Email Automatica (Resend)
                  </label>
                </div>

                {sendEmailInvite && (
                  <div className="space-y-3 pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5] text-[11px]">
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
                        className="text-[10px] text-[#6366f1] hover:underline font-semibold cursor-pointer"
                      >
                        {recipientCategories.length === 5 ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
                      </button>
                    </div>

                    {/* Grid Checkbox Multiscelta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`flex items-start gap-2 p-2.5 rounded-md border transition-colors cursor-pointer ${
                          recipientCategories.includes('pending')
                            ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                            : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={recipientCategories.includes('pending')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecipientCategories([...recipientCategories, 'pending'])
                            } else {
                              setRecipientCategories(
                                recipientCategories.filter((c) => c !== 'pending')
                              )
                            }
                          }}
                          className="mt-0.5 rounded text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block text-[11px]">Registrati in Attesa</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                            Partecipanti call di vendita / non pagati
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2 p-2.5 rounded-md border transition-colors cursor-pointer ${
                          recipientCategories.includes('ai-start')
                            ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                            : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={recipientCategories.includes('ai-start')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecipientCategories([...recipientCategories, 'ai-start'])
                            } else {
                              setRecipientCategories(
                                recipientCategories.filter((c) => c !== 'ai-start')
                              )
                            }
                          }}
                          className="mt-0.5 rounded text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block text-[11px]">Studenti AI Start</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                            Accreditati con codice attivo
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2 p-2.5 rounded-md border transition-colors cursor-pointer ${
                          recipientCategories.includes('ai-pro')
                            ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                            : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={recipientCategories.includes('ai-pro')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecipientCategories([...recipientCategories, 'ai-pro'])
                            } else {
                              setRecipientCategories(
                                recipientCategories.filter((c) => c !== 'ai-pro')
                              )
                            }
                          }}
                          className="mt-0.5 rounded text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block text-[11px]">Studenti AI Pro B2B</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                            Iscritti corso agenti
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2 p-2.5 rounded-md border transition-colors cursor-pointer ${
                          recipientCategories.includes('waitlist')
                            ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                            : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={recipientCategories.includes('waitlist')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRecipientCategories([...recipientCategories, 'waitlist'])
                            } else {
                              setRecipientCategories(
                                recipientCategories.filter((c) => c !== 'waitlist')
                              )
                            }
                          }}
                          className="mt-0.5 rounded text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block text-[11px]">
                            Lista d&apos;Attesa AI Pro
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                            Lead registrati al lancio
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Filtro Target Coorte Edizione Studenti */}
                    {(recipientCategories.includes('ai-start') ||
                      recipientCategories.includes('ai-pro')) && (
                      <div className="bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md p-2.5 space-y-1.5">
                        <label className="text-[11px] font-bold text-[#111113] dark:text-[#f4f4f5] flex items-center justify-between">
                          <span>Target Edizione Studenti:</span>
                          <span className="text-[10px] font-normal text-[#6366f1]">
                            Filtro automatico anti-spam vecchi corsisti
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setStudentCohort('new')}
                            className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                              studentCohort === 'new'
                                ? 'bg-[#6366f1] text-white font-semibold border-[#6366f1]'
                                : 'bg-[#f7f6f3] dark:bg-[#0d0d0f] text-zinc-700 dark:text-[#f4f4f5] border-[#e5e3dc] dark:border-white/[0.08] hover:border-[#6366f1]/50'
                            }`}
                          >
                            <span className="block font-bold text-[11px]">Solo Nuova Edizione</span>
                            <span
                              className={`block text-[10px] ${
                                studentCohort === 'new'
                                  ? 'text-white/80'
                                  : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              Iscritti Settembre - Ottobre (12 Nuovi)
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentCohort('all')}
                            className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                              studentCohort === 'all'
                                ? 'bg-[#6366f1] text-white font-semibold border-[#6366f1]'
                                : 'bg-[#f7f6f3] dark:bg-[#0d0d0f] text-zinc-700 dark:text-[#f4f4f5] border-[#e5e3dc] dark:border-white/[0.08] hover:border-[#6366f1]/50'
                            }`}
                          >
                            <span className="block font-bold text-[11px]">Tutti gli Studenti</span>
                            <span
                              className={`block text-[10px] ${
                                studentCohort === 'all'
                                  ? 'text-white/80'
                                  : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              Inclusi i 28 storici di Maggio
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Destinatari Specifici */}
                    <div className="pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-[#f4f4f5] text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={recipientCategories.includes('single')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRecipientCategories([...recipientCategories, 'single'])
                              } else {
                                setRecipientCategories(
                                  recipientCategories.filter((c) => c !== 'single')
                                )
                              }
                            }}
                            className="rounded text-[#6366f1] focus:ring-[#6366f1] h-3.5 w-3.5"
                          />
                          <span>Destinatari Specifici (Database / Singoli):</span>
                        </label>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={loadDatabaseContacts}
                          className="h-6 text-[10px] gap-1 px-2 rounded-md border-[#6366f1]/40 text-[#6366f1] dark:text-[#f4f4f5] hover:bg-[#6366f1]/10 font-semibold"
                        >
                          <Database className="h-3 w-3 text-[#6366f1]" />
                          <span>Scegli dal Database</span>
                        </Button>
                      </div>

                      {recipientCategories.includes('single') && (
                        <div className="space-y-1">
                          <Input
                            value={customEmails}
                            onChange={(e) => setCustomEmails(e.target.value)}
                            placeholder="gianni@azienda.it, francesco@gmail.com..."
                            className="text-xs bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
                          />
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            Clicca su <strong>&ldquo;Scegli dal Database&rdquo;</strong> per spuntare
                            direttamente studenti, clienti o soci con un clic.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selezione Profilo Mittente */}
                    <div className="pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                      <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5] text-[11px] flex items-center justify-between">
                        <span>Profilo Mittente &amp; Indirizzo di Risposta:</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                          Personalizzabile per Business / Corsi
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSenderProfile('campus')}
                          className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                            senderProfile === 'campus'
                              ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                              : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-[#6366f1]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">AIutiamoci Campus</span>
                            {senderProfile === 'campus' && (
                              <span className="text-[10px] text-[#6366f1] font-bold">Attivo</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5 font-mono">
                            Da: info@aiutiamoci.cloud
                          </span>
                          <span className="text-[9px] text-zinc-400 block mt-0.5">
                            Risposte a: info@aiutiamoci.cloud
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSenderProfile('impresa')}
                          className={`p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                            senderProfile === 'impresa'
                              ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                              : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-[#6366f1]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">AIutiamoci Impresa</span>
                            {senderProfile === 'impresa' && (
                              <span className="text-[10px] text-[#6366f1] font-bold">Attivo</span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6366f1] block mt-0.5 font-mono">
                            Da: impresa@aiutiamoci.cloud
                          </span>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                            Risposte a:{' '}
                            <strong className="text-[#111113] dark:text-[#f4f4f5]">
                              impresa@aiutiamoci.cloud
                            </strong>
                          </span>
                        </button>
                      </div>

                      <div className="pt-1.5 flex items-center gap-2">
                        <label className="text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap font-medium">
                          Nome che vedrà il cliente:
                        </label>
                        <Input
                          value={customSenderName}
                          onChange={(e) => setCustomSenderName(e.target.value)}
                          placeholder={
                            senderProfile === 'impresa' ? 'AIutiamoci Impresa' : 'AIutiamoci'
                          }
                          className="text-xs h-7 bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
                        />
                      </div>
                    </div>

                    {/* Modalità Invio */}
                    <div className="pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                      <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5] text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#6366f1]" />
                          Tempistica di Spedizione:
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                          Gestito da Resend Scheduler
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEmailTiming('now')}
                          className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                            emailTiming === 'now'
                              ? 'bg-[#6366f1] border-[#6366f1] text-white'
                              : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-700 dark:text-[#f4f4f5] hover:border-[#6366f1]/50'
                          }`}
                        >
                          <span className="block font-bold text-[11px]">Invia Subito</span>
                          <span
                            className={`block text-[10px] ${
                              emailTiming === 'now'
                                ? 'text-white/80'
                                : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                          >
                            Al salvataggio
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailTiming('scheduled')}
                          className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                            emailTiming === 'scheduled'
                              ? 'bg-[#6366f1] border-[#6366f1] text-white'
                              : 'bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-700 dark:text-[#f4f4f5] hover:border-[#6366f1]/50'
                          }`}
                        >
                          <span className="block font-bold text-[11px]">Programma Invio</span>
                          <span
                            className={`block text-[10px] ${
                              emailTiming === 'scheduled'
                                ? 'text-white/80'
                                : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                          >
                            Scegli giorno e ora
                          </span>
                        </button>
                      </div>

                      {emailTiming === 'scheduled' && (
                        <div className="p-3 bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                          <p className="text-[11px] font-bold text-[#111113] dark:text-[#f4f4f5]">
                            Quando vuoi che parta la spedizione automatica?
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                                Giorno Spedizione:
                              </label>
                              <Input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] h-8 border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                                Orario Partenza:
                              </label>
                              <Input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] h-8 border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-[#6366f1] leading-tight">
                            L&apos;email verrà inviata automaticamente all&apos;orario indicato
                            anche a piattaforma chiusa e computer spento.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700 dark:text-[#f4f4f5] flex items-center gap-1.5">
                    <span>Testo del Messaggio / Comunicazione</span>
                    {!eventMeetUrl.trim() && (
                      <span className="text-[10px] text-emerald-600 dark:text-[#10b981] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                        Corpo Email
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {!eventMeetUrl.trim()
                      ? "Questo testo sarà il corpo principale dell'email"
                      : 'Opzionale'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Scrivi qui il messaggio per gli studenti (es. Benvenuti nel nuovo percorso formativo, vi informiamo che il materiale didattico è ora disponibile...)"
                  className="w-full text-xs p-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1] resize-y min-h-[90px] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
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
                  className="border-emerald-500/35 text-emerald-600 dark:text-[#10b981] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold gap-1.5 h-9 rounded-md"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#10b981]" />
                  Invia su WhatsApp
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEventModalOpen(false)}
                    className="rounded-md border-[#e5e3dc] dark:border-white/[0.1]"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSendingInvitations}
                    className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold text-xs h-9 px-4 gap-1.5 cursor-pointer rounded-md border-0"
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDbPickerOpen(false)
          }}
        >
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-[#6366f1]/15 text-[#6366f1] flex items-center justify-center font-bold">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Scegli Destinatari dal Database
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Spunta le persone a cui inviare la comunicazione
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDbPickerOpen(false)}
                className="h-8 w-8 rounded-md text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Barra di Ricerca & Filtri Sorgente */}
            <div className="p-3.5 border-b border-[#e5e3dc] dark:border-white/[0.08] space-y-2 bg-[#fafaf8] dark:bg-[#0d0d0f]">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  placeholder="Cerca per nome, email o azienda..."
                  className="pl-8 text-xs h-8 bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
                />
              </div>

              <div className="flex items-center justify-between gap-1 text-[11px] flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {(() => {
                    const hasSrc = (c: SelectableRecipient, src: string) =>
                      c.sources && c.sources.length > 0
                        ? c.sources.includes(src as any)
                        : c.source === src

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setDbSourceFilter('all')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            dbSourceFilter === 'all'
                              ? 'bg-[#6366f1] text-white'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          Tutti ({dbContacts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDbSourceFilter('student')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            dbSourceFilter === 'student'
                              ? 'bg-emerald-600 text-white'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          Studenti ({dbContacts.filter((c) => hasSrc(c, 'student')).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDbSourceFilter('client')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            dbSourceFilter === 'client'
                              ? 'bg-sky-600 text-white'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          Clienti ({dbContacts.filter((c) => hasSrc(c, 'client')).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDbSourceFilter('partner')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            dbSourceFilter === 'partner'
                              ? 'bg-amber-600 text-white'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          Fornitori ({dbContacts.filter((c) => hasSrc(c, 'partner')).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDbSourceFilter('lead')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            dbSourceFilter === 'lead'
                              ? 'bg-[#6366f1] text-white'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          Lead ({dbContacts.filter((c) => hasSrc(c, 'lead')).length})
                        </button>
                      </>
                    )
                  })()}
                </div>

                {selectedDbEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDbEmails([])}
                    className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Azzera ({selectedDbEmails.length})
                  </button>
                )}
              </div>
            </div>

            {/* Lista Contatti Selezionabili */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[420px]">
              {loadingContacts ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <Loader2 className="h-5 w-5 animate-spin text-[#6366f1]" />
                  <span className="text-xs">Caricamento contatti dal database...</span>
                </div>
              ) : (
                (() => {
                  const hasSrc = (c: SelectableRecipient, src: string) =>
                    c.sources && c.sources.length > 0
                      ? c.sources.includes(src as any)
                      : c.source === src

                  const filtered = dbContacts.filter((c) => {
                    const matchFilter =
                      dbSourceFilter === 'all' || hasSrc(c, dbSourceFilter)
                    const q = dbSearchQuery.trim().toLowerCase()
                    const matchQuery =
                      !q ||
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      (c.company && c.company.toLowerCase().includes(q)) ||
                      (c.detail && c.detail.toLowerCase().includes(q))
                    return matchFilter && matchQuery
                  })

                  if (filtered.length === 0) {
                    return (
                      <div className="py-10 text-center text-xs text-zinc-400">
                        Nessun contatto trovato con questi criteri.
                      </div>
                    )
                  }

                  return filtered.map((c) => {
                    const isChecked = selectedDbEmails.includes(c.email)
                    const contactRoles =
                      c.sources && c.sources.length > 0 ? c.sources : [c.source]

                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelectContact(c.email)}
                        className={`p-2.5 rounded-md border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                            : 'bg-white dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.08] hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a20]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="shrink-0 text-[#6366f1]">
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs truncate">{c.name}</span>
                              {contactRoles.map((role) => {
                                if (role === 'student') {
                                  return (
                                    <span
                                      key={role}
                                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    >
                                      Studente
                                    </span>
                                  )
                                }
                                if (role === 'partner') {
                                  return (
                                    <span
                                      key={role}
                                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                    >
                                      Fornitore
                                    </span>
                                  )
                                }
                                if (role === 'client') {
                                  return (
                                    <span
                                      key={role}
                                      className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 bg-sky-500/15 text-sky-700 dark:text-sky-300"
                                    >
                                      Cliente
                                    </span>
                                  )
                                }
                                return (
                                  <span
                                    key={role}
                                    className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                                  >
                                    Lead
                                  </span>
                                )
                              })}
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate font-mono">
                              {c.email}
                            </span>
                            {c.detail && (
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                                {c.detail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()
              )}
            </div>

            {/* Footer con conferma e contatore */}
            <div className="p-3 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-between shrink-0">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                {selectedDbEmails.length}{' '}
                {selectedDbEmails.length === 1 ? 'persona selezionata' : 'persone selezionate'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDbPickerOpen(false)}
                  className="h-8 text-xs rounded-md border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applySelectedDbContacts}
                  className="h-8 text-xs bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold px-4 rounded-md border-0 cursor-pointer"
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
