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
import { renderChatText } from '@/lib/chat-text'
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
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* Colonna Sinistra: Lista Ticket & Filtri */}
      <div
        className={`${
          mobileShowDetail ? 'hidden md:flex' : 'flex'
        } w-full md:w-[360px] lg:w-[400px] shrink-0 border-r border-[#e5e3dc] dark:border-white/[0.08] flex-col bg-white dark:bg-[#111114] min-h-0`}
      >
        {/* Header Colonna Sinistra */}
        <div className="border-b border-[#e5e3dc] dark:border-white/[0.08] shrink-0 bg-white dark:bg-[#0d0d0f]">
          <div className="min-h-[52px] px-4 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <LifeBuoy className="h-4 w-4 text-[#6366f1] shrink-0" />
              <h1
                className="text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5] truncate"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                Inbox Assistenza
              </h1>
              {counts.open > 0 && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shrink-0"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {counts.open} aperti
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1 h-7 px-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] text-[11px] font-semibold hover:border-[#6366f1] transition-colors"
                title="Torna alla Chat Team"
              >
                <MessageCircle className="h-3 w-3 text-[#6366f1]" />
                <span>Chat</span>
              </Link>
              <button
                type="button"
                onClick={() => loadTickets(true)}
                disabled={refreshing}
                className="h-7 w-7 inline-flex items-center justify-center rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer"
                title="Aggiorna ticket"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-2.5">
            {/* Switch "I miei ticket" vs "Tutti" */}
            <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-md bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`py-1 px-2.5 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white dark:bg-[#222228] text-[#111113] dark:text-[#f4f4f5] shadow-2xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                Tutti ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('mine')}
                className={`py-1 px-2.5 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer ${
                  scopeFilter === 'mine'
                    ? 'bg-white dark:bg-[#222228] text-[#6366f1] dark:text-[#f4f4f5] shadow-2xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                I miei ({counts.mine})
              </button>
            </div>

            {/* Ricerca */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca studente, codice, azienda, oggetto..."
                className="pl-8 h-8 text-xs rounded-md bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08]"
              />
            </div>

            {/* Filtri Stato & Categoria */}
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'all', label: 'Tutti' },
                  { id: 'open', label: `Aperti (${counts.open})` },
                  { id: 'pending', label: `Attesa (${counts.pending})` },
                  { id: 'resolved', label: `Risolti (${counts.resolved})` },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-semibold border transition-colors cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                      : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-[#e5e3dc] dark:border-white/[0.08] hover:border-[#6366f1]/50'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="ml-auto h-6 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[10px] px-1.5 text-[#111113] dark:text-[#f4f4f5]"
              >
                <option value="all">Tutte</option>
                <option value="tecnico">Tecnico</option>
                <option value="didattica">Didattica</option>
                <option value="commerciale">Commerciale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista Ticket Piatta divide-y */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e5e3dc] dark:divide-white/[0.06] min-h-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#6366f1]" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-xs text-zinc-400 dark:text-zinc-500">
              <LifeBuoy className="h-7 w-7 mx-auto opacity-40" />
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
                  className={`w-full text-left px-4 py-3.5 transition-colors space-y-1.5 cursor-pointer border-l-2 ${
                    isSelected
                      ? 'bg-[#f7f6f3] dark:bg-[#18181f] border-l-[#6366f1]'
                      : 'bg-white dark:bg-[#111114] hover:bg-[#fafaf8] dark:hover:bg-[#16161b] border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold border ${statusInfo.cls}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                    <span
                      className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {formatDate(ticket.last_message_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] line-clamp-1">
                      {ticket.subject}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {lastMsg ? `${lastMsg.sender_name}: ${lastMsg.content}` : 'Nessun messaggio'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1">
                      <User className="h-2.5 w-2.5 text-zinc-400" />
                      {ticket.requester_name}
                    </span>

                    {ticket.company_name && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" />
                        {ticket.company_name}
                      </span>
                    )}

                    <span className={`px-1.5 py-0.5 rounded-sm border font-medium ${catInfo.cls}`}>
                      {catInfo.label}
                    </span>

                    {ticket.assigned_name && (
                      <span
                        className="ml-auto text-zinc-400 dark:text-zinc-500 truncate max-w-[100px]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
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
        } flex-1 flex-col min-w-0 min-h-0 bg-[#f7f6f3] dark:bg-[#0d0d0f]`}
      >
        {selectedTicket ? (
          <>
            {/* Header Dettaglio Ticket */}
            <div className="min-h-[52px] px-4 py-3 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] shrink-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="md:hidden p-1.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-[#f4f4f5]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className="text-sm sm:text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5] truncate"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                      >
                        {selectedTicket.subject}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold border ${
                          getStatusBadge(selectedTicket.status).cls
                        }`}
                      >
                        {getStatusBadge(selectedTicket.status).label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      <span className="font-semibold text-[#111113] dark:text-[#f4f4f5]">
                        {selectedTicket.requester_name}
                      </span>
                      <span>• {selectedTicket.requester_email}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {selectedTicket.student_code}
                      </span>
                      {selectedTicket.company_name && (
                        <span className="text-emerald-600 dark:text-emerald-300 font-semibold inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {selectedTicket.company_name}
                        </span>
                      )}
                      {(selectedTicket.course_id || selectedTicket.lesson_title) && (
                        <span className="text-[#6366f1] font-medium">
                          • {selectedTicket.course_id?.toUpperCase()}
                          {selectedTicket.lesson_id ? ` • Mod. ${selectedTicket.lesson_id}` : ''}
                          {selectedTicket.lesson_title ? ` (${selectedTicket.lesson_title})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Azioni Rapide Staff */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <Link
                    href={dmChannelLink}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#6366f1] dark:text-[#f4f4f5] text-xs font-semibold hover:bg-[#6366f1]/20 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Apri DM</span>
                  </Link>

                  <select
                    value={selectedTicket.assigned_to || ''}
                    disabled={isUpdatingMeta}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="h-8 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-xs px-2 text-[#111113] dark:text-[#f4f4f5] font-medium"
                    title="Riassegna ticket ad un collega"
                  >
                    <option value="" disabled>
                      Assegnato a: {selectedTicket.assigned_name || 'Nessuno'}
                    </option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] divide-x divide-[#e5e3dc] dark:divide-white/[0.08]">
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('open')}
                      className={`h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedTicket.status === 'open'
                          ? 'bg-rose-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1f1f24]'
                      }`}
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Aperto</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('pending')}
                      className={`h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedTicket.status === 'pending'
                          ? 'bg-amber-500 text-zinc-950'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1f1f24]'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>In attesa</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingMeta}
                      onClick={() => handleChangeStatus('resolved')}
                      className={`h-8 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1f1f24]'
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
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                      <span className="font-semibold text-[#111113] dark:text-[#f4f4f5]">
                        {msg.sender_name}
                      </span>
                      <Badge
                        variant={isStaff ? 'purple' : 'info'}
                        className="text-[9px] px-1.5 py-0 uppercase"
                      >
                        {isStaff ? 'Staff AIutiamoci' : selectedTicket.company_name ? 'B2B' : 'Studente'}
                      </Badge>
                      <span style={{ fontFamily: 'var(--font-mono), monospace' }}>
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isStaff
                          ? 'bg-[#6366f1] text-white rounded-tr-xs'
                          : 'bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] rounded-tl-xs'
                      }`}
                    >
                      {renderChatText(msg.content, {
                        isMe: isStaff,
                        accent: 'indigo',
                        highlightMentions: false,
                      })}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Box Risposta Staff */}
            <div className="p-3.5 sm:p-4 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] space-y-2 shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-[#10b981] font-medium">
                  <BellRing className="h-3 w-3" />
                  Invia Web Push al corsista
                </span>
                <span className="inline-flex items-center gap-1 text-[#6366f1] font-medium">
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
                  className="flex-1 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] px-3.5 py-2.5 text-xs sm:text-sm text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1] resize-none"
                />
                <Button
                  type="submit"
                  disabled={!replyText.trim() || isSendingReply}
                  className="h-11 px-4 bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold text-xs rounded-md gap-2 shrink-0 border-0 cursor-pointer"
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-zinc-400 dark:text-zinc-500">
            <div className="h-11 w-11 rounded-md bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/25 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <h3
              className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
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
        <div className="h-full flex items-center justify-center text-xs text-zinc-400">
          Caricamento Inbox Assistenza...
        </div>
      }
    >
      <AssistenzaInner />
    </Suspense>
  )
}
