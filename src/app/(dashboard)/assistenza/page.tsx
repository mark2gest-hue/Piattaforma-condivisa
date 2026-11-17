'use client'

import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LifeBuoy,
  Search,
  RefreshCw,
  Send,
  Loader2,
  User,
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  ArrowLeft,
  Wrench,
  Briefcase,
  BellRing,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
  getTeamSupportTicketsAction,
  replyTeamSupportTicketAction,
  updateSupportTicketStatusAction,
  reassignSupportTicketAction,
  SupportTicketItem,
  TeamSupportMember,
  SupportCategory,
  SupportTicketStatus,
} from '@/app/actions/support'

function getCategoryLabel(cat: SupportCategory) {
  if (cat === 'didattica') return { label: 'Didattica', icon: GraduationCap, cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' }
  if (cat === 'commerciale') return { label: 'Commerciale / B2B', icon: Briefcase, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  return { label: 'Tecnico', icon: Wrench, cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
}

function getStatusBadge(status: SupportTicketStatus) {
  if (status === 'resolved') {
    return { label: 'Risolto', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' }
  }
  if (status === 'pending') {
    return { label: 'In attesa', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', dot: 'bg-amber-500' }
  }
  return { label: 'Aperto', cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', dot: 'bg-rose-500' }
}

function AssistenzaInner() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [tickets, setTickets] = useState<SupportTicketItem[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamSupportMember[]>([])
  const [currentStaffId, setCurrentStaffId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filtri
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicketStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Ticket attivo & risposta
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTickets = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    const res = await getTeamSupportTicketsAction()
    if (res.success) {
      const list = res.tickets || []
      setTickets(list)
      setTeamMembers(res.teamMembers || [])
      if (res.currentStaffId) setCurrentStaffId(res.currentStaffId)

      const urlTicketId = searchParams?.get('ticket')
      if (urlTicketId && list.some((t) => t.id === urlTicketId)) {
        setSelectedTicketId(urlTicketId)
        setMobileShowDetail(true)
      } else if (!selectedTicketId && list.length > 0) {
        setSelectedTicketId(list[0].id)
      }
    }

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime listener su support_tickets e support_messages
  useEffect(() => {
    const channel = supabase
      .channel('public:support_inbox_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          loadTickets(true)
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        () => {
          loadTickets(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (scopeFilter === 'mine' && currentStaffId && t.assigned_to !== currentStaffId) {
        return false
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          t.requester_name.toLowerCase().includes(q) ||
          t.requester_email.toLowerCase().includes(q) ||
          t.student_code.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.company_name || '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [tickets, scopeFilter, statusFilter, categoryFilter, searchQuery, currentStaffId])

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  )

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedTicket?.id, selectedTicket?.messages?.length])

  const counts = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === 'open').length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      mine: tickets.filter((t) => t.assigned_to === currentStaffId && t.status !== 'resolved').length,
    }
  }, [tickets, currentStaffId])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim() || isSendingReply) return

    setIsSendingReply(true)
    const content = replyText.trim()
    setReplyText('')

    const res = await replyTeamSupportTicketAction({
      ticketId: selectedTicket.id,
      content,
      newStatus: 'pending',
    })

    setIsSendingReply(false)

    if (res.success && res.ticket) {
      setTickets((prev) =>
        prev.map((t) => (t.id === res.ticket!.id ? res.ticket! : t))
      )
    } else {
      setReplyText(content)
      alert(res.error || 'Errore invio risposta')
    }
  }

  const handleChangeStatus = async (status: SupportTicketStatus) => {
    if (!selectedTicket || isUpdatingMeta) return
    setIsUpdatingMeta(true)
    const res = await updateSupportTicketStatusAction({
      ticketId: selectedTicket.id,
      status,
    })
    setIsUpdatingMeta(false)
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status } : t))
      )
    }
  }

  const handleReassign = async (assignedToId: string) => {
    if (!selectedTicket || !assignedToId || isUpdatingMeta) return
    setIsUpdatingMeta(true)
    const res = await reassignSupportTicketAction({
      ticketId: selectedTicket.id,
      assignedToId,
    })
    setIsUpdatingMeta(false)
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                assigned_to: res.assignedTo || assignedToId,
                assigned_name: res.assignedName || t.assigned_name,
              }
            : t
        )
      )
    }
  }

  const dmChannelLink =
    selectedTicket && currentStaffId
      ? `/chat?channel=${encodeURIComponent(
          `dm:${[currentStaffId, selectedTicket.student_id].sort().join('_')}`
        )}`
      : '/chat'

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-white dark:bg-slate-950">
      {/* Colonna Sinistra: Lista Ticket & Filtri */}
      <div
        className={`${
          mobileShowDetail ? 'hidden md:flex' : 'flex'
        } w-full md:w-[360px] lg:w-[400px] shrink-0 border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/40 dark:bg-slate-900/50 min-h-0`}
      >
        {/* Header Colonna Sinistra */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Inbox Assistenza</span>
                  {counts.open > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {counts.open} aperti
                    </Badge>
                  )}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ticket Studenti Academy & Aziende B2B
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Torna alla Chat Team"
              >
                <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                <span>Chat</span>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => loadTickets(true)}
                disabled={refreshing}
                className="h-8 w-8 rounded-lg"
                title="Aggiorna ticket"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Switch "I miei ticket" vs "Tutti" */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              📋 Tutti ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('mine')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scopeFilter === 'mine'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              👤 I miei ({counts.mine})
            </button>
          </div>

          {/* Ricerca */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca studente, codice, azienda, oggetto..."
              className="pl-8 h-8 text-xs dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          {/* Filtri Stato & Categoria */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'Tutti' },
                { id: 'open', label: `Aperti (${counts.open})` },
                { id: 'pending', label: `In attesa (${counts.pending})` },
                { id: 'resolved', label: `Risolti (${counts.resolved})` },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {st.label}
              </button>
            ))}

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="ml-auto h-6 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] px-1.5 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Tutte le categorie</option>
              <option value="tecnico">🛠️ Tecnico</option>
              <option value="didattica">🎓 Didattica</option>
              <option value="commerciale">💼 Commerciale/B2B</option>
            </select>
          </div>
        </div>

        {/* Lista Ticket */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-xs text-slate-400">
              <LifeBuoy className="h-8 w-8 mx-auto opacity-40" />
              <p>Nessun ticket trovato con i filtri selezionati.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId
              const catInfo = getCategoryLabel(ticket.category)
              const statusInfo = getStatusBadge(ticket.status)
              const lastMsg = ticket.messages?.[ticket.messages.length - 1]

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => {
                    setSelectedTicketId(ticket.id)
                    setMobileShowDetail(true)
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${statusInfo.cls}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(ticket.last_message_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {ticket.subject}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {lastMsg ? `${lastMsg.sender_name}: ${lastMsg.content}` : 'Nessun messaggio'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      {ticket.requester_name}
                    </span>

                    {ticket.company_name && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" />
                        {ticket.company_name}
                      </span>
                    )}

                    <span className={`px-1.5 py-0.2 rounded border font-semibold ${catInfo.cls}`}>
                      {catInfo.label}
                    </span>

                    {ticket.assigned_name && (
                      <span className="ml-auto text-slate-400 font-mono truncate max-w-[100px]">
                        → {ticket.assigned_name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Colonna Destra: Dettaglio Ticket & Risposta */}
      <div
        className={`${
          mobileShowDetail ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col min-w-0 min-h-0 bg-slate-50/20 dark:bg-slate-950`}
      >
        {selectedTicket ? (
          <>
            {/* Header Dettaglio Ticket */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {selectedTicket.subject}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          getStatusBadge(selectedTicket.status).cls
                        }`}
                      >
                        {getStatusBadge(selectedTicket.status).label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedTicket.requester_name}
                      </span>
                      <span>• {selectedTicket.requester_email}</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {selectedTicket.student_code}
                      </span>
                      {selectedTicket.company_name && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {selectedTicket.company_name}
                        </span>
                      )}
                      {(selectedTicket.course_id || selectedTicket.lesson_title) && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          • {selectedTicket.course_id?.toUpperCase()}
                          {selectedTicket.lesson_id ? ` • Mod. ${selectedTicket.lesson_id}` : ''}
                          {selectedTicket.lesson_title ? ` (${selectedTicket.lesson_title})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Azioni Rapide Staff */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={dmChannelLink}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Apri DM in Chat</span>
                  </Link>

                  <select
                    value={selectedTicket.assigned_to || ''}
                    disabled={isUpdatingMeta}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-2.5 text-slate-700 dark:text-slate-200 font-medium"
                    title="Riassegna ticket ad un collega"
                  >
                    <option value="" disabled>
                      Assegnato a: {selectedTicket.assigned_name || 'Nessuno'}
                    </option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        👤 {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('open')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                        selectedTicket.status === 'open'
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Aperto</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('pending')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                        selectedTicket.status === 'pending'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>In attesa</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('resolved')}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Risolto</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversazione Messaggi */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
              {(selectedTicket.messages || []).map((msg) => {
                const isStaff = msg.sender_type === 'staff'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] ${
                      isStaff ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {msg.sender_name}
                      </span>
                      <Badge
                        variant={isStaff ? 'purple' : 'info'}
                        className="text-[9px] px-1.5 py-0 uppercase"
                      >
                        {isStaff ? 'Staff AIutiamoci' : selectedTicket.company_name ? 'B2B' : 'Studente'}
                      </Badge>
                      <span>{formatDate(msg.created_at)}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                        isStaff
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Box Risposta Staff */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <BellRing className="h-3 w-3" />
                  Invia Web Push al corsista
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Mail className="h-3 w-3" />
                  Inoltro automatico via Email a {selectedTicket.requester_email}
                </span>
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply(e)
                    }
                  }}
                  placeholder={`Rispondi a ${selectedTicket.requester_name}... (Invio per spedire, Shift+Invio a capo)`}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <Button
                  type="submit"
                  disabled={!replyText.trim() || isSendingReply}
                  className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-2 shrink-0"
                >
                  {isSendingReply ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Invia Risposta</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <LifeBuoy className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Inbox Assistenza Nativa AIutiamoci
            </h3>
            <p className="text-xs max-w-sm leading-relaxed">
              Seleziona un ticket dalla colonna sinistra per leggere i dettagli del corsista o dell&apos;azienda B2B e rispondere in tempo reale.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AssistenzaPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          Caricamento Inbox Assistenza...
        </div>
      }
    >
      <AssistenzaInner />
    </Suspense>
  )
}
