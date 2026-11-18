'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  LifeBuoy,
  Plus,
  Send,
  Loader2,
  Building2,
  GraduationCap,
  Wrench,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import {
  createSupportTicketAction,
  getStudentSupportTicketsAction,
  replyStudentSupportTicketAction,
  markStudentTicketReadAction,
  SupportTicketItem,
  SupportCategory,
} from '@/app/actions/support'

interface StudentSupportModalProps {
  isOpen: boolean
  onClose: () => void
  studentCode: string
  studentName: string
  courseId: 'ai-start' | 'ai-pro'
  lessonId?: number
  lessonTitle?: string
  companyName?: string | null
  initialTicketId?: string | null
  initialCreateMode?: boolean
  onUnreadCountChange?: (count: number) => void
}

export function StudentSupportModal({
  isOpen,
  onClose,
  studentCode,
  studentName,
  courseId,
  lessonId,
  lessonTitle,
  companyName,
  initialTicketId = null,
  initialCreateMode = false,
  onUnreadCountChange,
}: StudentSupportModalProps) {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'list' | 'create'>(initialCreateMode ? 'create' : 'list')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId)

  // Form nuovo ticket
  const [category, setCategory] = useState<SupportCategory>('didattica')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Risposta ticket esistente
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialCreateMode) setMode('create')
    if (initialTicketId) {
      setMode('list')
      setSelectedTicketId(initialTicketId)
    }
  }, [initialCreateMode, initialTicketId])

  const loadTickets = async (silent = false) => {
    if (!studentCode) return
    if (!silent) setLoading(true)

    const res = await getStudentSupportTicketsAction(studentCode)
    if (res.success) {
      const list = res.tickets || []
      setTickets(list)
      onUnreadCountChange?.(res.unreadCount || 0)

      if (initialTicketId && list.some((t) => t.id === initialTicketId)) {
        setSelectedTicketId(initialTicketId)
      } else if (!selectedTicketId && list.length > 0 && !initialCreateMode) {
        setSelectedTicketId(list[0].id)
      } else if (list.length === 0) {
        setMode('create')
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadTickets()
      const timer = setInterval(() => loadTickets(true), 15000)
      return () => clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentCode])

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null

  useEffect(() => {
    if (isOpen && selectedTicket && mode === 'list') {
      markStudentTicketReadAction({
        studentCode,
        ticketId: selectedTicket.id,
      }).then(() => {
        // Ricalcola unread dopo apertura ticket
        getStudentSupportTicketsAction(studentCode).then((r) => {
          if (r.success) onUnreadCountChange?.(r.unreadCount || 0)
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedTicket?.id, mode])

  useEffect(() => {
    if (!isOpen || loading || mode !== 'list') return
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 60)
    return () => clearTimeout(timer)
  }, [isOpen, loading, mode, selectedTicket?.id, selectedTicket?.messages?.length])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || isCreating) return

    setIsCreating(true)
    const res = await createSupportTicketAction({
      studentCode,
      category,
      subject: subject.trim(),
      message: message.trim(),
      courseId,
      lessonId,
      lessonTitle,
      companyName: companyName || undefined,
    })
    setIsCreating(false)

    if (res.success && res.ticket) {
      setSubject('')
      setMessage('')
      setTickets((prev) => [res.ticket!, ...prev])
      setSelectedTicketId(res.ticket.id)
      setMode('list')
    } else {
      alert(res.error || 'Errore apertura ticket')
    }
  }

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim() || isReplying) return

    setIsReplying(true)
    const txt = replyText.trim()
    setReplyText('')

    const res = await replyStudentSupportTicketAction({
      studentCode,
      ticketId: selectedTicket.id,
      content: txt,
    })

    setIsReplying(false)

    if (res.success && res.ticket) {
      setTickets((prev) =>
        prev.map((t) => (t.id === res.ticket!.id ? res.ticket! : t))
      )
    } else {
      setReplyText(txt)
      alert(res.error || 'Errore invio messaggio')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modale */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Assistenza 1-a-1 AIutiamoci</span>
                {companyName && (
                  <Badge variant="success" className="text-[10px] font-mono">
                    🏢 {companyName}
                  </Badge>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supporto diretto con i docenti e il team tecnico • Risposte notificate via Push ed Email
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setMode(mode === 'create' ? 'list' : 'create')}
              className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{mode === 'create' ? `I miei Ticket (${tickets.length})` : 'Nuova Richiesta'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => loadTickets(true)}
              className="h-8 w-8 rounded-xl"
              title="Aggiorna ticket"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Corpo */}
        {mode === 'create' ? (
          <form
            onSubmit={handleCreateTicket}
            className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 max-w-2xl mx-auto w-full"
          >
            {/* Box Contesto Automatico */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-2 text-xs">
              <div className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                Contesto Rilevato Automaticamente
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                  👤 {studentName} ({studentCode})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                  📘 {courseId === 'ai-pro' ? 'AI Pro' : 'AI Start'}
                </span>
                {lessonId && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                    🎬 Modulo {lessonId}
                    {lessonTitle ? `: ${lessonTitle}` : ''}
                  </span>
                )}
                {companyName && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {companyName}
                  </span>
                )}
              </div>
            </div>

            {/* Scelta Categoria con Auto-Routing */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Tipo di Richiesta (instradamento automatico al referente)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    {
                      id: 'didattica',
                      title: '🎓 Didattica / Moduli',
                      desc: 'Dubbi su lezioni, prompt o esercizi',
                      icon: GraduationCap,
                    },
                    {
                      id: 'tecnico',
                      title: '🛠️ Tecnico / Piattaforma',
                      desc: 'Accesso, video, credenziali o bug',
                      icon: Wrench,
                    },
                    {
                      id: 'commerciale',
                      title: '💼 Commerciale / B2B',
                      desc: 'Aziende, upgrade o certificazioni',
                      icon: Briefcase,
                    },
                  ] as const
                ).map((cat) => {
                  const Icon = cat.icon
                  const isActive = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        <Icon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>{cat.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Oggetto della richiesta *
              </label>
              <Input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Es. Chiarimento sul Modulo 4 / Problema riproduzione video"
                className="h-10 text-xs sm:text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Descrivi la tua domanda *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Spiega cosa stai cercando di fare o qual è il dubbio: ti risponderemo direttamente qui e riceverai avviso via Push ed Email."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {tickets.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('list')}
                  className="text-xs h-10 rounded-xl"
                >
                  Annulla
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || !subject.trim() || !message.trim()}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Invia Richiesta di Assistenza</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Lista Ticket Studente */}
            <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 space-y-2 overflow-y-auto max-h-48 md:max-h-full">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nessuna richiesta inviata finora.
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = t.id === selectedTicketId
                  const lastMsg = t.messages?.[t.messages.length - 1]
                  const isUnread =
                    lastMsg?.sender_type === 'staff' &&
                    (!t.student_last_read_at ||
                      new Date(lastMsg.created_at).getTime() >
                        new Date(t.student_last_read_at).getTime())

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            t.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : t.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {t.status === 'resolved' ? (
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          ) : t.status === 'pending' ? (
                            <Clock className="h-2.5 w-2.5" />
                          ) : (
                            <AlertCircle className="h-2.5 w-2.5" />
                          )}
                          {t.status === 'resolved' ? 'Risolto' : t.status === 'pending' ? 'Risposto' : 'Aperto'}
                        </span>
                        {isUnread && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                            NUOVO
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {t.subject}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatDate(t.last_message_at)}
                      </p>
                    </button>
                  )
                })
              )}
            </div>

            {/* Dettaglio Conversazione Ticket */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50/20 dark:bg-slate-950/60">
              {selectedTicket ? (
                <>
                  <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedTicket.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Referente: <strong>{selectedTicket.assigned_name || 'Team AIutiamoci'}</strong>
                        {selectedTicket.lesson_id ? ` • Modulo ${selectedTicket.lesson_id}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {(selectedTicket.messages || []).map((msg) => {
                      const isMine = msg.sender_type === 'student'
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col space-y-1 max-w-[85%] ${
                            isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {isMine ? `${studentName} (Tu)` : msg.sender_name}
                            </span>
                            {!isMine && (
                              <Badge variant="success" className="text-[9px] px-1.5 py-0">
                                SUPPORTO
                              </Badge>
                            )}
                            <span>{formatDate(msg.created_at)}</span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-tr-xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <form
                    onSubmit={handleReplyTicket}
                    className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0"
                  >
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={isReplying}
                      placeholder="Aggiungi un messaggio o rispondi al docente..."
                      className="text-xs h-10 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      type="submit"
                      disabled={!replyText.trim() || isReplying}
                      className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 rounded-xl shrink-0"
                    >
                      {isReplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>Invia</span>
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Seleziona un ticket o creane uno nuovo.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
