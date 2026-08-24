'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Mail,
  Inbox,
  Send,
  Reply,
  Paperclip,
  Loader2,
  Trash2,
  PlusCircle,
  X,
  Search,
  Globe,
  Check,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Email, Profile } from '@/types/index'
import { requestNotificationPermission, sendDesktopNotification } from '@/lib/notifications'
import { sendSharedEmail, updateEmailStatus, deleteSharedEmail, AVAILABLE_FROM_EMAILS } from './actions'

import { useRouter } from 'next/navigation'

export interface ArubaMailboxConfig {
  email: string
  password?: string
  label?: string
}

type EmailWithSender = Email & { senderProfile?: Profile }
type FolderFilter = 'inbox' | 'sent' | 'unread' | 'all'
type AccountFilter = 'all' | 'info@aiutiamoci.cloud' | 'assistenza@aiutiamoci.cloud' | 'info@mar2.cloud' | 'support@mar2.cloud'

function getToArray(to_address: any): string[] {
  if (!to_address) return []
  if (Array.isArray(to_address)) return to_address
  if (typeof to_address === 'string') {
    try {
      const parsed = JSON.parse(to_address)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return [to_address]
    }
    return [to_address]
  }
  return []
}

const DEFAULT_IMAP_ACCOUNTS: ArubaMailboxConfig[] = [
  { email: 'info@aiutiamoci.cloud', label: 'info@aiutiamoci.cloud', password: '' },
  { email: 'assistenza@aiutiamoci.cloud', label: 'assistenza@aiutiamoci.cloud', password: '' },
  { email: 'info@mar2.cloud', label: 'info@mar2.cloud', password: '' },
  { email: 'support@mar2.cloud', label: 'support@mar2.cloud', password: '' },
]

export default function PostaCondivisaPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [emails, setEmails] = useState<EmailWithSender[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailWithSender | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyFrom, setReplyFrom] = useState<string>('Ti AIuto <info@aiutiamoci.cloud>')
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState<FolderFilter>('inbox')
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html')

  // IMAP Sync State
  const [imapAccounts, setImapAccounts] = useState<ArubaMailboxConfig[]>(DEFAULT_IMAP_ACCOUNTS)
  const [isImapModalOpen, setIsImapModalOpen] = useState(false)
  const [isSyncingImap, setIsSyncingImap] = useState(false)
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null)

  // Modal Nuova Email
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [composeFrom, setComposeFrom] = useState<string>('Ti AIuto <info@aiutiamoci.cloud>')
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  // Modal Guida Configurazione Dominio Aruba
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
    })
  }, [])

  useEffect(() => {
    // Carica configurazione IMAP da localStorage se presente
    const saved = localStorage.getItem('piattaforma_imap_accounts')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setImapAccounts(parsed)
        }
      } catch (e) {
        console.error('Errore parsing accounts IMAP salvati', e)
      }
    }
  }, [])

  useEffect(() => {
    fetchEmails()
    requestNotificationPermission()

    // Realtime subscription per email in arrivo ed inviate
    const channel = supabase
      .channel('public:emails')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emails' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEmail = payload.new as Email
            setEmails((prev) => [newEmail, ...prev.filter((e) => e.id !== newEmail.id)])

            if (newEmail.direction === 'inbound') {
              sendDesktopNotification(
                `Nuova Email da ${newEmail.from_address}`,
                { body: newEmail.subject },
                'email'
              )
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Email
            setEmails((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
            setSelectedEmail((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id
            setEmails((prev) => prev.filter((e) => e.id !== oldId))
            setSelectedEmail((prev) => (prev?.id === oldId ? null : prev))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*, senderProfile:profiles(*)')
        .order('created_at', { ascending: false })

      if (data && !error) {
        setEmails(data)
        if (data.length > 0 && !selectedEmail) {
          setSelectedEmail(data[0])
        }
      }
    } catch (err) {
      console.error('Errore fetchEmails:', err)
    } finally {
      setLoading(false)
    }
  }

  // Conteggi per badge
  const counts = useMemo(() => {
    const list = Array.isArray(emails) ? emails : []
    const inbound = list.filter((e) => e && e.direction === 'inbound')
    const unread = inbound.filter((e) => e && e.status === 'received')
    const sent = list.filter((e) => e && e.direction === 'outbound')
    return {
      inbox: inbound.length,
      unread: unread.length,
      sent: sent.length,
      all: list.length,
    }
  }, [emails])

  // Filtro ed elenco cercato
  const filteredEmails = useMemo(() => {
    const list = Array.isArray(emails) ? emails : []
    return list.filter((em) => {
      if (!em) return false

      // 1. Filtro cartella
      if (currentFilter === 'inbox' && em.direction !== 'inbound') return false
      if (currentFilter === 'sent' && em.direction !== 'outbound') return false
      if (currentFilter === 'unread' && (em.direction !== 'inbound' || em.status !== 'received')) return false

      const toList = getToArray(em.to_address)

      // 2. Filtro per casella / account
      if (accountFilter !== 'all') {
        const matchTo = toList.some((t) => (t || '').toLowerCase().includes(accountFilter.toLowerCase()))
        const matchFrom = (em.from_address || '').toLowerCase().includes(accountFilter.toLowerCase())
        if (!matchTo && !matchFrom) return false
      }

      // 3. Filtro ricerca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchFrom = (em.from_address || '').toLowerCase().includes(q)
        const matchTo = toList.some((t) => (t || '').toLowerCase().includes(q))
        const matchSubj = (em.subject || '').toLowerCase().includes(q)
        const matchBody = (em.body_text || '').toLowerCase().includes(q)
        return matchFrom || matchTo || matchSubj || matchBody
      }

      return true
    })
  }, [emails, currentFilter, accountFilter, searchQuery])

  // Segna come letta al click
  const handleSelectEmail = async (em: EmailWithSender) => {
    setSelectedEmail(em)

    // Imposta automaticamente il mittente della risposta in base all'indirizzo destinatario dell'email
    const toStr = getToArray(em.to_address).join(' ').toLowerCase()
    const matching = AVAILABLE_FROM_EMAILS.find((opt) => toStr.includes(opt.email.toLowerCase()))
    if (matching) {
      setReplyFrom(matching.label)
    } else {
      setReplyFrom('Ti AIuto <info@aiutiamoci.cloud>')
    }

    if (em.direction === 'inbound' && em.status === 'received') {
      await updateEmailStatus(em.id, 'read')
      setEmails((prev) => prev.map((e) => (e.id === em.id ? { ...e, status: 'read' } : e)))
    }
  }

  // Toggle Letta / Non letta
  const handleToggleReadStatus = async (em: EmailWithSender, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus = em.status === 'read' ? 'received' : 'read'
    await updateEmailStatus(em.id, nextStatus)
    setEmails((prev) => prev.map((e) => (e.id === em.id ? { ...e, status: nextStatus } : e)))
    if (selectedEmail?.id === em.id) {
      setSelectedEmail({ ...selectedEmail, status: nextStatus })
    }
  }

  // Invio risposta ad un'email esistente
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedEmail) return
    setIsSending(true)

    const recipient =
      selectedEmail.direction === 'inbound'
        ? selectedEmail.from_address
        : getToArray(selectedEmail.to_address)[0] || 'info@aiutiamoci.cloud'

    const subject = (selectedEmail.subject || '').startsWith('Re:')
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject || ''}`

    const result = await sendSharedEmail({
      to: recipient,
      from: replyFrom,
      subject: subject,
      body: replyText,
      threadId: selectedEmail.thread_id || selectedEmail.id,
    })

    if (result.success) {
      setReplyText('')
      await fetchEmails()
    } else {
      alert(`Errore durante l'invio: ${result.error}`)
    }
    setIsSending(false)
  }

  // Invio nuova email da zero
  const handleSendNewEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return
    setIsComposing(true)

    const result = await sendSharedEmail({
      to: composeTo.trim(),
      from: composeFrom,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    })

    if (result.success) {
      setIsComposeModalOpen(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      await fetchEmails()
    } else {
      alert(`Errore durante l'invio dell'email: ${result.error}`)
    }
    setIsComposing(false)
  }

  // Eliminazione email
  const handleDeleteEmail = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Sei sicuro di voler eliminare questa email dal sistema condiviso?')) return

    const result = await deleteSharedEmail(emailId)
    if (result.success) {
      const updated = emails.filter((em) => em.id !== emailId)
      setEmails(updated)
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(updated.length > 0 ? updated[0] : null)
      }
    } else {
      alert(`Impossibile eliminare l'email: ${result.error}`)
    }
  }

  // Sincronizzazione IMAP con Aruba
  const handleSyncImap = async () => {
    const configuredAccounts = imapAccounts.filter((a) => a.password && a.password.trim().length > 0)
    if (configuredAccounts.length === 0) {
      setIsImapModalOpen(true)
      return
    }

    setIsSyncingImap(true)
    setSyncStatusMsg('Connessione e sincronizzazione con Aruba IMAP in corso...')

    try {
      const response = await fetch('/api/email/imap-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts: configuredAccounts }),
      })
      const res = await response.json()
      if (res.success) {
        setSyncStatusMsg(`Sincronizzazione completata: ${res.syncedCount} nuove email scaricate con successo!`)
        await fetchEmails()
      } else {
        setSyncStatusMsg(`Errore sync: ${res.error || 'Errore di sincronizzazione'}`)
      }
    } catch (e: any) {
      setSyncStatusMsg(`Errore imprevisto durante il sync: ${e.message}`)
    } finally {
      setIsSyncingImap(false)
      setTimeout(() => setSyncStatusMsg(null), 6000)
    }
  }

  const handleSaveImapAccounts = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('piattaforma_imap_accounts', JSON.stringify(imapAccounts))
    setIsImapModalOpen(false)
    handleSyncImap()
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Se l'utente non è autenticato con account team Supabase
  if (!loading && !currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Posta Condivisa del Team</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questa sezione è riservata ai membri del team per la gestione delle 4 caselle di posta aziendali (aiutiamoci.cloud e mar2.cloud).
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 gap-2 shadow-md"
            >
              <span>Accedi con Account Team</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Posta Condivisa
                <Badge variant="outline" className="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60">
                  4 Caselle Aruba
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                aiutiamoci.cloud & mar2.cloud con sincronizzazione IMAP diretta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {syncStatusMsg && (
            <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 animate-pulse">
              {syncStatusMsg}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncImap}
            disabled={isSyncingImap}
            className="text-xs border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 h-9 gap-1.5 font-medium shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingImap ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncingImap ? 'Sincronizzazione...' : 'Sincronizza Aruba IMAP'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImapModalOpen(true)}
            className="text-xs border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 gap-1.5"
            title="Configura password e caselle Aruba"
          >
            <span>⚙️ Password Caselle</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsComposeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuova Email</span>
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-h-0">
        {/* Left Column: Folders + Email List (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
          {/* Folders / Filter Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per mittente, oggetto o testo..."
                className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Folder Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setCurrentFilter('inbox')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentFilter === 'inbox'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                <span>In arrivo</span>
                {counts.unread > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white text-[10px] rounded-full font-bold">
                    {counts.unread}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentFilter('unread')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentFilter === 'unread'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Non lette</span>
                <span className="text-[10px] opacity-75">({counts.unread})</span>
              </button>

              <button
                onClick={() => setCurrentFilter('sent')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentFilter === 'sent'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Inviate</span>
                <span className="text-[10px] opacity-75">({counts.sent})</span>
              </button>

              <button
                onClick={() => setCurrentFilter('all')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Tutte</span>
                <span className="text-[10px] opacity-75">({counts.all})</span>
              </button>
            </div>

            {/* Account Selector Pills (4 Caselle Aruba) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAccountFilter('all')}
                className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  accountFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tutte ({emails.length})
              </button>
              <button
                onClick={() => setAccountFilter('info@aiutiamoci.cloud')}
                className={`px-2 py-1 rounded-lg font-mono whitespace-nowrap transition-all ${
                  accountFilter === 'info@aiutiamoci.cloud'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                info@aiutiamoci
              </button>
              <button
                onClick={() => setAccountFilter('assistenza@aiutiamoci.cloud')}
                className={`px-2 py-1 rounded-lg font-mono whitespace-nowrap transition-all ${
                  accountFilter === 'assistenza@aiutiamoci.cloud'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                assistenza@aiutiamoci
              </button>
              <button
                onClick={() => setAccountFilter('info@mar2.cloud')}
                className={`px-2 py-1 rounded-lg font-mono whitespace-nowrap transition-all ${
                  accountFilter === 'info@mar2.cloud'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                info@mar2
              </button>
              <button
                onClick={() => setAccountFilter('support@mar2.cloud')}
                className={`px-2 py-1 rounded-lg font-mono whitespace-nowrap transition-all ${
                  accountFilter === 'support@mar2.cloud'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                support@mar2
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : filteredEmails.length > 0 ? (
              filteredEmails.map((em) => {
                const isSelected = selectedEmail?.id === em.id
                const isUnread = em.direction === 'inbound' && em.status === 'received'
                const toList = getToArray(em.to_address)
                const toStr = toList.join(' ').toLowerCase()
                const isMar2 = toStr.includes('mar2.cloud')
                const isAssistenza = toStr.includes('assistenza@')
                const isSupport = toStr.includes('support@')

                return (
                  <div
                    key={em.id}
                    onClick={() => handleSelectEmail(em)}
                    className={`p-3.5 cursor-pointer transition-all relative group border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600'
                        : isUnread
                          ? 'bg-white dark:bg-slate-900 border-amber-500 font-semibold'
                          : 'bg-white/60 dark:bg-slate-900/60 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Nuovo messaggio non letto" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isUnread
                              ? 'font-bold text-slate-900 dark:text-white'
                              : 'font-medium text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {em.direction === 'inbound' ? em.from_address : `A: ${toList.join(', ')}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {em.created_at ? formatDate(em.created_at) : ''}
                      </span>
                    </div>

                    <div
                      className={`text-xs line-clamp-1 mb-1 ${
                        isUnread
                          ? 'font-bold text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300 font-normal'
                      }`}
                    >
                      {em.subject || '(Nessun oggetto)'}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {em.body_text?.substring(0, 110) || 'Nessun testo...'}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {em.direction === 'outbound' ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 flex items-center gap-1"
                          >
                            <ArrowUpRight className="h-2.5 w-2.5" />
                            Inviata
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 font-mono flex items-center gap-1 ${
                                isMar2
                                  ? isSupport
                                    ? 'border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'border-purple-500/30 text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300'
                                  : isAssistenza
                                    ? 'border-indigo-500/30 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300'
                                    : 'border-blue-500/30 text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300'
                              }`}
                            >
                              <ArrowDownLeft className="h-2.5 w-2.5" />
                              {toList[0] || 'info@aiutiamoci.cloud'}
                            </Badge>

                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 flex items-center gap-1 ${
                                isUnread
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {isUnread ? 'Da Leggere' : 'Letta'}
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {em.direction === 'inbound' && (
                          <button
                            onClick={(e) => handleToggleReadStatus(em, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title={em.status === 'read' ? 'Segna come non letta' : 'Segna come già letta'}
                          >
                            {em.status === 'read' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteEmail(em.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                          title="Elimina email"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <Inbox className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>Nessun messaggio trovato in questa cartella.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Viewer & Quick Reply (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Message Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/40 dark:bg-slate-800/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight break-words">
                      {selectedEmail.subject || '(Nessun oggetto)'}
                    </h2>

                    <div className="flex items-center gap-3 mt-3">
                      <Avatar
                        fallback={
                          selectedEmail.direction === 'inbound'
                            ? (selectedEmail.from_address ? selectedEmail.from_address.charAt(0).toUpperCase() : 'M')
                            : 'T'
                        }
                        className="h-9 w-9 bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                      />
                      <div className="flex flex-col min-w-0 text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedEmail.direction === 'inbound'
                            ? selectedEmail.from_address
                            : 'Team (@aiutiamoci.cloud)'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          A: {getToArray(selectedEmail.to_address).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {selectedEmail.created_at ? formatDate(selectedEmail.created_at) : ''}
                    </span>

                    {selectedEmail.body_html && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'html' ? 'text' : 'html')}
                        className="h-8 px-2 text-xs text-slate-600 dark:text-slate-300"
                        title="Cambia vista HTML/Testo"
                      >
                        {viewMode === 'html' ? 'Visualizza Testo' : 'Visualizza HTML'}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Elimina questa email"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {viewMode === 'html' && selectedEmail.body_html ? (
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.6;color:#334155;padding:12px;margin:0;word-break:break-word;}a{color:#2563eb;}</style></head><body>${selectedEmail.body_html}</body></html>`}
                    className="w-full h-full min-h-[260px] border-0 rounded-lg bg-transparent"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    title="Email Preview"
                  />
                ) : (
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedEmail.body_text || selectedEmail.body_html?.replace(/<[^>]*>?/gm, '') || 'Nessun contenuto in questo messaggio.'}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                <div className="space-y-2 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 truncate">
                      <Reply className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Rispondi a{' '}
                      <strong className="text-slate-900 dark:text-white truncate max-w-[220px]">
                        {selectedEmail.direction === 'inbound'
                          ? selectedEmail.from_address
                          : getToArray(selectedEmail.to_address)[0] || 'info@aiutiamoci.cloud'}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline-block">
                        Invia come:
                      </span>
                      <select
                        value={replyFrom}
                        onChange={(e) => setReplyFrom(e.target.value)}
                        className="h-6 px-1.5 text-[10px] rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                      >
                        {AVAILABLE_FROM_EMAILS.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Scrivi qui la risposta condivisa dal team..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setReplyText(
                          `\n\n--- Messaggio Originale ---\nDa: ${selectedEmail.from_address}\nOggetto: ${selectedEmail.subject}\n\n${selectedEmail.body_text || ''}`
                        )
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 h-7 px-2"
                    >
                      Cita testo originale
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 px-4 gap-1.5 shadow-xs"
                    >
                      <Send className="h-3 w-3" />
                      {isSending ? 'Invio...' : 'Invia Risposta'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 p-8">
              <Mail className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">Seleziona un messaggio per leggerlo</p>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                Tutte le email in arrivo sulle caselle aiutiamoci.cloud e mar2.cloud compariranno automaticamente qui.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuova Email */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Email di Team</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsComposeModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSendNewEmail} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Invia da (Mittente Casella) *</label>
                <select
                  value={composeFrom}
                  onChange={(e) => setComposeFrom(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_FROM_EMAILS.map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">A (Destinatario) *</label>
                <Input
                  autoFocus
                  required
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Es. cliente@azienda.com"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Oggetto *</label>
                <Input
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Es. Richiesta Informazioni / Preventivo"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Messaggio *</label>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Scrivi qui il messaggio..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Mittente: info@aiutiamoci.cloud</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsComposeModalOpen(false)}>
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isComposing}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  >
                    {isComposing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Invia Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Guida DNS Aruba */}
      {isDnsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Guida Configurazione DNS Dominio <span className="text-blue-600 dark:text-blue-400 font-mono">aiutiamoci.cloud</span> (Aruba)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDnsModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto text-xs">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Pannello Aruba: Gestione DNS e Record Posta
                </div>
                <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] leading-relaxed">
                  Per far recapitare la posta di <strong>aiutiamoci.cloud</strong> direttamente in questa piattaforma e abilitare l'invio verificato con SPF/DKIM, inserisci i seguenti record nel pannello di controllo Aruba (sezione <em>Gestione DNS / NameServer</em>):
                </p>
              </div>

              {/* Tabella Record DNS */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>1. Record Posta in Arrivo (MX Inbound)</span>
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">Tipo MX:</span> Priorità <span className="font-mono font-bold text-blue-600">10</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('feedback-smtp.us-east-1.amazonses.com', 'mx')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'mx' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copia Host
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    feedback-smtp.us-east-1.amazonses.com
                  </div>
                  <p className="text-[10px] text-slate-400">
                    (In alternativa, se usi Resend Inbound Routing dedicato: inserisci il record MX fornito nel pannello Resend Domains per Inbound)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  2. Record Autenticazione Invio (SPF, DKIM, DMARC)
                </h4>

                {/* SPF */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">TXT (SPF): Host @</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('v=spf1 include:amazonses.com ~all', 'spf')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'spf' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copia Valore
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    v=spf1 include:amazonses.com ~all
                  </div>
                </div>

                {/* DMARC */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">TXT (DMARC): Host _dmarc</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('v=DMARC1; p=none;', 'dmarc')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'dmarc' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copia Valore
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    v=DMARC1; p=none;
                  </div>
                </div>
              </div>

              {/* Webhook Endpoint per ricezione automatica */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  3. Endpoint Webhook Inbound (da inserire su Resend Dashboard)
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">URL Destinazione Webhook Eventi:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('https://aiutiamoci.cloud/api/webhooks/resend', 'webhook')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'webhook' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copia URL Webhook
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 select-all">
                    https://aiutiamoci.cloud/api/webhooks/resend
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <Button onClick={() => setIsDnsModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Chiudi Guida
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurazione Credenziali IMAP Aruba */}
      {isImapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Configurazione Caselle Aruba (IMAP)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsImapModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveImapAccounts} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  Inserisci le password delle caselle per consentire la sincronizzazione diretta con i server <strong>imaps.aruba.it (porta 993 SSL)</strong>.
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {imapAccounts.map((acc, idx) => (
                  <div key={acc.email} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {acc.email}
                      </span>
                      <Badge variant="outline" className="text-[9px] font-mono text-slate-500">
                        imaps.aruba.it:993
                      </Badge>
                    </div>

                    <div>
                      <Input
                        type="password"
                        placeholder={`Password per ${acc.email}`}
                        value={acc.password || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setImapAccounts((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, password: val } : item))
                          )
                        }}
                        className="text-xs h-8 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsImapModalOpen(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSyncingImap}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  {isSyncingImap ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sincronizzazione...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Salva e Sincronizza Ora
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
