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
  Sparkles,
  Bot,
  AlertCircle,
  CheckSquare,
  Square,
  Zap,
  Archive,
  Folder,
  FolderPlus,
  FolderOpen,
  Tag,
  ChevronDown,
  CornerUpLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Email, Profile } from '@/types/index'
import { requestNotificationPermission, sendDesktopNotification } from '@/lib/notifications'
import {
  sendSharedEmail,
  updateEmailStatus,
  deleteSharedEmail,
  deleteSharedEmailsBulk,
  moveToTrash,
  moveToTrashBulk,
  restoreFromTrash,
  restoreFromTrashBulk,
  permanentlyDeleteEmails,
  markEmailsAsReadBulk,
  archiveSharedEmail,
  unarchiveSharedEmail,
  archiveEmailsBulk,
  unarchiveEmailsBulk,
  analyzeEmailWithAI,
  EmailAIAnalysis,
  getImapAccountsConfig,
  saveImapAccountsConfig,
} from './actions'
import { AVAILABLE_FROM_EMAILS, ArubaMailboxConfig, DEFAULT_IMAP_ACCOUNTS, DEFAULT_CUSTOM_FOLDERS, EmailFolder } from './constants'
import { useRouter } from 'next/navigation'

type EmailWithSender = Email & { senderProfile?: Profile }
type FolderFilter = 'inbox' | 'sent' | 'unread' | 'archived' | 'trash' | 'all' | string
type AccountFilter = 'all' | 'impresa@aiutiamoci.cloud' | 'info@aiutiamoci.cloud' | 'commerciale@aiutiamoci.cloud' | 'pagamenti@aiutiamoci.cloud' | 'assistenza@aiutiamoci.cloud' | 'info@mark2.cloud' | 'support@mark2.cloud'

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

export default function PostaCondivisaPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [emails, setEmails] = useState<EmailWithSender[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailWithSender | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyFrom, setReplyFrom] = useState<string>('aiutiamoci Impresa <impresa@aiutiamoci.cloud>')
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
  const [composeFrom, setComposeFrom] = useState<string>('aiutiamoci Impresa <impresa@aiutiamoci.cloud>')
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeAttachments, setComposeAttachments] = useState<{ filename: string; content: string; contentType?: string; size: number }[]>([])
  const [replyAttachments, setReplyAttachments] = useState<{ filename: string; content: string; contentType?: string; size: number }[]>([])
  const [isComposing, setIsComposing] = useState(false)

  // Modal Guida Configurazione Dominio Aruba
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // AI Agent State (Gemini)
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, EmailAIAnalysis>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Selezione Multipla Email & Azioni Bulk
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set())
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  // Cartelle Personalizzate & Archiviazione
  const [customFolders, setCustomFolders] = useState<EmailFolder[]>(DEFAULT_CUSTOM_FOLDERS)
  const [emailFolderMap, setEmailFolderMap] = useState<Record<string, string>>({})
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('blue')
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
    })
  }, [])

  useEffect(() => {
    // Carica configurazione IMAP prioritariamente da DB Supabase, con fallback a localStorage
    const loadImapConfig = async () => {
      let savedAccounts: ArubaMailboxConfig[] = []

      // 1. Prova prima da DB Supabase
      try {
        const dbRes = await getImapAccountsConfig()
        if (dbRes.success && dbRes.accounts && Array.isArray(dbRes.accounts) && dbRes.accounts.length > 0) {
          savedAccounts = dbRes.accounts
          // Sincronizza anche localmente per velocità
          localStorage.setItem('piattaforma_imap_accounts', JSON.stringify(dbRes.accounts))
        }
      } catch (e) {
        console.warn('Errore lettura IMAP da DB:', e)
      }

      // 2. Se vuoto su DB, prova da localStorage
      if (savedAccounts.length === 0) {
        const saved = localStorage.getItem('piattaforma_imap_accounts')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
              savedAccounts = parsed
            }
          } catch (e) {
            console.error('Errore parsing accounts IMAP salvati', e)
          }
        }
      }

      // 3. Esegui il merge con la lista di DEFAULT_IMAP_ACCOUNTS
      if (savedAccounts.length > 0) {
        const merged = DEFAULT_IMAP_ACCOUNTS.map((def) => {
          const found = savedAccounts.find((p: ArubaMailboxConfig) => p.email?.toLowerCase() === def.email.toLowerCase())
          return found ? { ...def, password: found.password || '' } : def
        })
        setImapAccounts(merged)
      }
    }

    loadImapConfig()

    // Carica Cartelle Personalizzate da localStorage
    const savedFolders = localStorage.getItem('piattaforma_email_folders')
    if (savedFolders) {
      try {
        const parsed = JSON.parse(savedFolders)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomFolders(parsed)
        }
      } catch (e) {
        console.error('Errore parsing cartelle salvate', e)
      }
    }

    // Carica Mappatura Email -> Cartella da localStorage
    const savedMap = localStorage.getItem('piattaforma_email_folder_map')
    if (savedMap) {
      try {
        const parsed = JSON.parse(savedMap)
        if (parsed && typeof parsed === 'object') {
          setEmailFolderMap(parsed)
        }
      } catch (e) {
        console.error('Errore parsing mappa email/cartelle', e)
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

    // Polling periodico automatico di sincronizzazione (ogni 3 minuti in background)
    const syncInterval = setInterval(() => {
      fetch('/api/email/imap-sync', { method: 'POST' }).catch(() => {})
    }, 180000)

    // Trigger sincrono iniziale dopo 2 secondi dal caricamento della schermata
    const initialSyncTimer = setTimeout(() => {
      fetch('/api/email/imap-sync', { method: 'POST' }).catch(() => {})
    }, 2000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(syncInterval)
      clearTimeout(initialSyncTimer)
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
        const normalized = (data as Array<any>).map((e) => ({ ...e, senderProfile: e.senderProfile ?? undefined }))
        setEmails(normalized)
        if (normalized.length > 0 && !selectedEmail) {
          setSelectedEmail(normalized[0])
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
    const activeList = list.filter((e) => e && e.status !== 'archived' && e.status !== 'trash')
    const inbound = activeList.filter((e) => e.direction === 'inbound')
    const unread = inbound.filter((e) => e.status === 'received')
    const sent = activeList.filter((e) => e.direction === 'outbound')
    const archived = list.filter((e) => e && e.status === 'archived')
    const trash = list.filter((e) => e && e.status === 'trash')

    // Conteggi per cartella personalizzata
    const folderCounts: Record<string, number> = {}
    customFolders.forEach((f) => {
      folderCounts[f.id] = activeList.filter((e) => e && emailFolderMap[e.id] === f.id).length
    })

    return {
      inbox: inbound.length,
      unread: unread.length,
      sent: sent.length,
      archived: archived.length,
      trash: trash.length,
      all: activeList.length,
      folders: folderCounts,
    }
  }, [emails, customFolders, emailFolderMap])

  // Filtro ed elenco cercato
  const filteredEmails = useMemo(() => {
    const list = Array.isArray(emails) ? emails : []
    return list.filter((em) => {
      if (!em) return false

      // 1. Filtro cartella principale
      if (currentFilter === 'inbox') {
        if (em.direction !== 'inbound' || em.status === 'archived' || em.status === 'trash') return false
      } else if (currentFilter === 'sent') {
        if (em.direction !== 'outbound' || em.status === 'archived' || em.status === 'trash') return false
      } else if (currentFilter === 'unread') {
        if (em.direction !== 'inbound' || em.status !== 'received') return false
      } else if (currentFilter === 'archived') {
        if (em.status !== 'archived') return false
      } else if (currentFilter === 'trash') {
        if (em.status !== 'trash') return false
      } else if (currentFilter === 'all') {
        if (em.status === 'trash') return false
      } else {
        // Filtro per Cartella Personalizzata (es: 'clienti', 'corsi', etc.)
        if (em.status === 'trash' || emailFolderMap[em.id] !== currentFilter) return false
      }

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
  }, [emails, currentFilter, accountFilter, searchQuery, emailFolderMap])

  // Segna come letta al click
  const handleSelectEmail = async (em: EmailWithSender) => {
    setSelectedEmail(em)

    // Imposta automaticamente il mittente della risposta in base all'indirizzo destinatario dell'email
    const toStr = getToArray(em.to_address).join(' ').toLowerCase()
    const matching = AVAILABLE_FROM_EMAILS.find((opt) => toStr.includes(opt.email.toLowerCase()))
    if (matching) {
      setReplyFrom(matching.label)
    } else {
      setReplyFrom('aiutiamoci <info@aiutiamoci.cloud>')
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
      attachments: replyAttachments.length > 0 ? replyAttachments.map(a => ({ filename: a.filename, content: a.content, contentType: a.contentType })) : undefined,
    })

    if (result.success) {
      setReplyText('')
      setReplyAttachments([])
      await fetchEmails()
    } else {
      alert(`Errore durante l'invio: ${result.error}`)
    }
    setIsSending(false)
  }

  // Helper per convertire File in Base64
  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const maxFileSize = 15 * 1024 * 1024 // 15MB limite singolo file
    const newItems: { filename: string; content: string; contentType?: string; size: number }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > maxFileSize) {
        alert(`Il file "${file.name}" supera la dimensione massima di 15MB.`)
        continue
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const res = reader.result as string
            const base64Part = res.includes('base64,') ? res.split('base64,')[1] : res
            resolve(base64Part)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        newItems.push({
          filename: file.name,
          content: base64,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        })
      } catch (err) {
        console.error('Errore conversione allegato:', err)
      }
    }

    if (isReply) {
      setReplyAttachments(prev => [...prev, ...newItems])
    } else {
      setComposeAttachments(prev => [...prev, ...newItems])
    }

    // Reset input
    e.target.value = ''
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
      attachments: composeAttachments.length > 0 ? composeAttachments.map(a => ({ filename: a.filename, content: a.content, contentType: a.contentType })) : undefined,
    })

    if (result.success) {
      setIsComposeModalOpen(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
      setComposeAttachments([])
      await fetchEmails()
    } else {
      alert(`Errore durante l'invio dell'email: ${result.error}`)
    }
    setIsComposing(false)
  }

  // Eliminazione email singola (Cestino o Eliminazione Definitiva da Aruba)
  const handleDeleteEmail = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const targetEmail = emails.find((em) => em.id === emailId)
    const isAlreadyInTrash = targetEmail?.status === 'trash' || currentFilter === 'trash'

    if (isAlreadyInTrash) {
      if (!confirm('Eliminare definitivamente questa email anche dalla casella Aruba? L\'azione è irreversibile.')) return
      const result = await permanentlyDeleteEmails([emailId])
      if (result.success) {
        const updated = emails.filter((em) => em.id !== emailId)
        setEmails(updated)
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(updated.length > 0 ? updated[0] : null)
        }
        setSelectedEmailIds((prev) => {
          const next = new Set(prev)
          next.delete(emailId)
          return next
        })
      } else {
        alert(`Impossibile eliminare definitivamente: ${result.error}`)
      }
    } else {
      const result = await moveToTrash(emailId)
      if (result.success) {
        setEmails((prev) =>
          prev.map((em) => (em.id === emailId ? { ...em, status: 'trash' as const } : em))
        )
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(null)
        }
        setSelectedEmailIds((prev) => {
          const next = new Set(prev)
          next.delete(emailId)
          return next
        })
      } else {
        alert(`Impossibile spostare nel cestino: ${result.error}`)
      }
    }
  }

  // Ripristino email da cestino
  const handleRestoreFromTrash = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const result = await restoreFromTrash(emailId)
    if (result.success) {
      setEmails((prev) =>
        prev.map((em) => (em.id === emailId ? { ...em, status: 'read' as const } : em))
      )
      if (selectedEmail?.id === emailId) {
        setSelectedEmail((prev) => (prev ? { ...prev, status: 'read' as const } : null))
      }
    } else {
      alert(`Errore ripristino dal cestino: ${result.error}`)
    }
  }

  // Archiviazione email singola
  const handleArchiveEmail = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const result = await archiveSharedEmail(emailId)
    if (result.success) {
      setEmails((prev) =>
        prev.map((em) => (em.id === emailId ? { ...em, status: 'archived' as const } : em))
      )
      if (selectedEmail?.id === emailId) {
        setSelectedEmail((prev) => (prev ? { ...prev, status: 'archived' as const } : null))
      }
    } else {
      alert(`Errore archiviazione: ${result.error}`)
    }
  }

  // Ripristino email da archivio
  const handleUnarchiveEmail = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const result = await unarchiveSharedEmail(emailId)
    if (result.success) {
      setEmails((prev) =>
        prev.map((em) => (em.id === emailId ? { ...em, status: 'read' as const } : em))
      )
      if (selectedEmail?.id === emailId) {
        setSelectedEmail((prev) => (prev ? { ...prev, status: 'read' as const } : null))
      }
    } else {
      alert(`Errore ripristino: ${result.error}`)
    }
  }

  // Archiviazione multipla in blocco
  const handleArchiveBulk = async () => {
    const ids = Array.from(selectedEmailIds)
    if (ids.length === 0) return

    setIsBulkOperating(true)
    try {
      const result = await archiveEmailsBulk(ids)
      if (result.success) {
        setEmails((prev) =>
          prev.map((em) => (selectedEmailIds.has(em.id) ? { ...em, status: 'archived' as const } : em))
        )
        setSelectedEmailIds(new Set())
      } else {
        alert(`Errore archiviazione multipla: ${result.error}`)
      }
    } finally {
      setIsBulkOperating(false)
    }
  }

  // Ripristino multiplo in blocco
  const handleUnarchiveBulk = async () => {
    const ids = Array.from(selectedEmailIds)
    if (ids.length === 0) return

    setIsBulkOperating(true)
    try {
      const result = await unarchiveEmailsBulk(ids)
      if (result.success) {
        setEmails((prev) =>
          prev.map((em) => (selectedEmailIds.has(em.id) ? { ...em, status: 'read' as const } : em))
        )
        setSelectedEmailIds(new Set())
      } else {
        alert(`Errore ripristino multiplo: ${result.error}`)
      }
    } finally {
      setIsBulkOperating(false)
    }
  }

  // Assegnazione di una o più email a una cartella personalizzata
  const handleAssignFolder = (targetEmailIds: string[], folderId: string | null) => {
    setEmailFolderMap((prev) => {
      const next = { ...prev }
      targetEmailIds.forEach((id) => {
        if (folderId) {
          next[id] = folderId
        } else {
          delete next[id]
        }
      })
      localStorage.setItem('piattaforma_email_folder_map', JSON.stringify(next))
      return next
    })
    setIsMoveMenuOpen(false)
  }

  // Creazione nuova cartella personalizzata
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newFolderName.trim()
    if (!trimmed) return

    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_')
    if (customFolders.some((f) => f.id === id)) {
      alert('Una cartella con questo nome esiste già.')
      return
    }

    const newFolder: EmailFolder = {
      id,
      name: trimmed,
      color: newFolderColor || 'blue',
      icon: 'Folder',
    }

    const updated = [...customFolders, newFolder]
    setCustomFolders(updated)
    localStorage.setItem('piattaforma_email_folders', JSON.stringify(updated))
    setNewFolderName('')
    setIsNewFolderModalOpen(false)
  }

  // Eliminazione cartella personalizzata
  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Vuoi eliminare questa cartella? Le email al suo interno non verranno cancellate.')) return

    const updated = customFolders.filter((f) => f.id !== folderId)
    setCustomFolders(updated)
    localStorage.setItem('piattaforma_email_folders', JSON.stringify(updated))

    // Rimuovi associazioni a questa cartella
    setEmailFolderMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (next[k] === folderId) delete next[k]
      })
      localStorage.setItem('piattaforma_email_folder_map', JSON.stringify(next))
      return next
    })

    if (currentFilter === folderId) {
      setCurrentFilter('inbox')
    }
  }

  // Selezione singola con checkbox
  const handleToggleSelect = (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedEmailIds((prev) => {
      const next = new Set(prev)
      if (next.has(emailId)) {
        next.delete(emailId)
      } else {
        next.add(emailId)
      }
      return next
    })
  }

  // Seleziona/deseleziona tutte le email visibili nel filtro
  const handleSelectAllToggle = () => {
    if (filteredEmails.length === 0) return
    const allVisibleSelected = filteredEmails.every((em) => selectedEmailIds.has(em.id))
    if (allVisibleSelected) {
      setSelectedEmailIds((prev) => {
        const next = new Set(prev)
        filteredEmails.forEach((em) => next.delete(em.id))
        return next
      })
    } else {
      setSelectedEmailIds((prev) => {
        const next = new Set(prev)
        filteredEmails.forEach((em) => next.add(em.id))
        return next
      })
    }
  }

  // Deseleziona tutto
  const handleClearSelection = () => {
    setSelectedEmailIds(new Set())
  }

  // Eliminazione Multipla in blocco (Cestino vs Eliminazione Definitiva da Aruba)
  const handleDeleteBulk = async () => {
    const ids = Array.from(selectedEmailIds)
    if (ids.length === 0) return

    if (currentFilter === 'trash') {
      if (!confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE le ${ids.length} email selezionate anche dai server Aruba? L'azione è irreversibile.`)) {
        return
      }

      setIsBulkOperating(true)
      try {
        const result = await permanentlyDeleteEmails(ids)
        if (result.success) {
          const updated = emails.filter((em) => !selectedEmailIds.has(em.id))
          setEmails(updated)
          if (selectedEmail && selectedEmailIds.has(selectedEmail.id)) {
            setSelectedEmail(updated.length > 0 ? updated[0] : null)
          }
          setSelectedEmailIds(new Set())
        } else {
          alert(`Errore eliminazione definitiva da Aruba: ${result.error}`)
        }
      } finally {
        setIsBulkOperating(false)
      }
    } else {
      setIsBulkOperating(true)
      try {
        const result = await moveToTrashBulk(ids)
        if (result.success) {
          setEmails((prev) =>
            prev.map((em) => (selectedEmailIds.has(em.id) ? { ...em, status: 'trash' as const } : em))
          )
          if (selectedEmail && selectedEmailIds.has(selectedEmail.id)) {
            setSelectedEmail(null)
          }
          setSelectedEmailIds(new Set())
        } else {
          alert(`Errore durante lo spostamento nel cestino: ${result.error}`)
        }
      } finally {
        setIsBulkOperating(false)
      }
    }
  }

  // Ripristino Multiplo dal Cestino
  const handleRestoreBulk = async () => {
    const ids = Array.from(selectedEmailIds)
    if (ids.length === 0) return

    setIsBulkOperating(true)
    try {
      const result = await restoreFromTrashBulk(ids)
      if (result.success) {
        setEmails((prev) =>
          prev.map((em) => (selectedEmailIds.has(em.id) ? { ...em, status: 'read' as const } : em))
        )
        setSelectedEmailIds(new Set())
      } else {
        alert(`Errore ripristino multiplo dal cestino: ${result.error}`)
      }
    } finally {
      setIsBulkOperating(false)
    }
  }

  // Segna come lette in blocco
  const handleMarkAsReadBulk = async () => {
    const ids = Array.from(selectedEmailIds)
    if (ids.length === 0) return

    setIsBulkOperating(true)
    try {
      const result = await markEmailsAsReadBulk(ids)
      if (result.success) {
        setEmails((prev) =>
          prev.map((em) => (selectedEmailIds.has(em.id) ? { ...em, status: 'read' as const } : em))
        )
        setSelectedEmailIds(new Set())
      } else {
        alert(`Errore aggiornamento: ${result.error}`)
      }
    } finally {
      setIsBulkOperating(false)
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

  const handleSaveImapAccounts = async (e: React.FormEvent) => {
    e.preventDefault()
    // 1. Salva localmente per reattività immediata
    localStorage.setItem('piattaforma_imap_accounts', JSON.stringify(imapAccounts))
    setIsImapModalOpen(false)

    // 2. Salva in modo permanente nel database Supabase (così non si cancellano mai più)
    try {
      await saveImapAccountsConfig(imapAccounts)
    } catch (err) {
      console.warn('Avviso salvataggio imap config su DB:', err)
    }

    handleSyncImap()
  }

  // Analisi AI con Gemini per email selezionata
  const handleAnalyzeEmail = async (em: EmailWithSender) => {
    setIsAnalyzing(true)
    setAiError(null)
    try {
      const res = await analyzeEmailWithAI({
        emailId: em.id,
        subject: em.subject || '',
        body: em.body_text || em.body_html?.replace(/<[^>]*>?/gm, '') || '',
        fromAddress: em.from_address || '',
        toAddress: getToArray(em.to_address).join(', '),
      })
      if (res.success && res.analysis) {
        setAiAnalysisMap((prev) => ({
          ...prev,
          [em.id]: res.analysis!,
        }))
      } else {
        setAiError(res.error || 'Impossibile completare l\'analisi AI')
      }
    } catch (err: any) {
      setAiError(err.message || 'Errore di connessione con l\'Agente AI Gemini')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Se l'utente non è autenticato con account team Supabase
  if (!loading && !currentUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#f7f6f3] dark:bg-[#0d0d0f]">
        <div className="max-w-md w-full p-8 rounded-lg bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] shadow-xl space-y-5">
          <div className="h-14 w-14 mx-auto rounded-md bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/25 flex items-center justify-center">
            <Mail className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2
              className="text-lg font-bold text-[#111113] dark:text-[#f4f4f5]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              Posta Condivisa del Team
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Questa sezione è riservata ai membri del team per la gestione delle caselle di posta aziendali (aiutiamoci.cloud e mark2.cloud).
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold text-xs h-9 gap-2 rounded-md border-0"
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
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* A) COMMAND BAR */}
      <div className="min-h-[52px] px-4 sm:px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1
            className="text-[15px] font-bold tracking-tight text-[#111113] dark:text-[#f4f4f5] shrink-0"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            Posta Condivisa
          </h1>

          <span
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            7 Caselle Aruba
          </span>

          {syncStatusMsg && (
            <span className="text-[11px] font-medium text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/25 px-2 py-0.5 rounded-sm truncate max-w-[280px]">
              {syncStatusMsg}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Ricerca Rapida */}
          <div className="relative w-44 sm:w-60">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca mittente, oggetto..."
              className="pl-8 pr-7 h-8 text-xs bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] rounded-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSyncImap}
            disabled={isSyncingImap}
            className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:border-[#6366f1]/50 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shrink-0"
            title="Sincronizza Aruba IMAP"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingImap ? 'animate-spin text-[#6366f1]' : ''}`} />
            <span className="hidden sm:inline">{isSyncingImap ? 'Sync...' : 'Sync IMAP'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              try {
                const saved = localStorage.getItem('piattaforma_imap_accounts')
                if (saved) {
                  const parsed = JSON.parse(saved)
                  if (Array.isArray(parsed)) {
                    const merged = DEFAULT_IMAP_ACCOUNTS.map((def) => {
                      const found = parsed.find(
                        (p: ArubaMailboxConfig) => p.email?.toLowerCase() === def.email.toLowerCase()
                      )
                      return found ? { ...def, password: found.password || '' } : def
                    })
                    setImapAccounts(merged)
                  }
                } else {
                  setImapAccounts(DEFAULT_IMAP_ACCOUNTS)
                }
              } catch {
                setImapAccounts(DEFAULT_IMAP_ACCOUNTS)
              }
              setIsImapModalOpen(true)
            }}
            className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Configura password e caselle Aruba"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden md:inline">Password</span>
          </button>

          <button
            type="button"
            onClick={() => setIsComposeModalOpen(true)}
            className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Scrivi</span>
          </button>
        </div>
      </div>

      {/* B) CORPO 2-PANE FULL-HEIGHT */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Colonna Lista Email Sinistra */}
        <div
          className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 border-r border-[#e5e3dc] dark:border-white/[0.08] flex flex-col h-full overflow-hidden bg-white dark:bg-[#111114] ${
            selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Filtri & Selettori Caselle/Cartelle */}
          <div className="border-b border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#111114] shrink-0">
            {/* Folder Tabs */}
            <div className="px-3 flex items-center gap-3 border-b border-[#e5e3dc] dark:border-white/[0.08] overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setCurrentFilter('inbox')}
                className={`h-9 inline-flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  currentFilter === 'inbox'
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span>Ricevute</span>
                {counts.unread > 0 && (
                  <span
                    className="px-1.5 py-0.2 bg-[#6366f1] text-white text-[9px] rounded-sm font-semibold tabular-nums"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {counts.unread}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentFilter('unread')}
                className={`h-9 inline-flex items-center gap-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  currentFilter === 'unread'
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span>Non lette</span>
                <span
                  className="text-[10px] text-zinc-400 tabular-nums"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {counts.unread}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFilter('sent')}
                className={`h-9 inline-flex items-center gap-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  currentFilter === 'sent'
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span>Inviate</span>
                <span
                  className="text-[10px] text-zinc-400 tabular-nums"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {counts.sent}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFilter('archived')}
                className={`h-9 inline-flex items-center gap-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  currentFilter === 'archived'
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span>Archivio</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFilter('trash')}
                className={`h-9 inline-flex items-center gap-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  currentFilter === 'trash'
                    ? 'border-[#111113] dark:border-[#f4f4f5] text-[#111113] dark:text-[#f4f4f5] font-semibold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                }`}
              >
                <span>Cestino</span>
                {counts.trash > 0 && (
                  <span
                    className="text-[10px] text-zinc-400 tabular-nums"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {counts.trash}
                  </span>
                )}
              </button>
            </div>

            {/* Selettori Casella Aruba & Cartelle senza emoji hardcoded */}
            <div className="p-2.5 grid grid-cols-2 gap-2 bg-[#fafaf8] dark:bg-[#141417]">
              <div className="relative">
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value as AccountFilter)}
                  className="w-full h-8 pl-2.5 pr-6 text-[11px] bg-white dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#6366f1] cursor-pointer font-medium truncate"
                >
                  <option value="all">Tutte le caselle ({emails.length})</option>
                  <option value="impresa@aiutiamoci.cloud">impresa@aiutiamoci.cloud</option>
                  <option value="info@aiutiamoci.cloud">info@aiutiamoci.cloud</option>
                  <option value="commerciale@aiutiamoci.cloud">commerciale@aiutiamoci.cloud</option>
                  <option value="pagamenti@aiutiamoci.cloud">pagamenti@aiutiamoci.cloud</option>
                  <option value="assistenza@aiutiamoci.cloud">assistenza@aiutiamoci.cloud</option>
                  <option value="info@mark2.cloud">info@mark2.cloud</option>
                  <option value="support@mark2.cloud">support@mark2.cloud</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>

              <div className="relative flex items-center gap-1">
                <div className="relative flex-1">
                  <select
                    value={
                      ['inbox', 'unread', 'sent', 'archived', 'trash', 'all'].includes(currentFilter)
                        ? ''
                        : currentFilter
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setCurrentFilter(e.target.value as any)
                      }
                    }}
                    className="w-full h-8 pl-2.5 pr-6 text-[11px] bg-white dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#6366f1] cursor-pointer font-medium truncate"
                  >
                    <option value="">Cartelle ({customFolders.length})</option>
                    {customFolders.map((f) => {
                      const countInFolder = counts.folders[f.id] || 0
                      return (
                        <option key={f.id} value={f.id}>
                          {f.name} {countInFolder > 0 ? `(${countInFolder})` : ''}
                        </option>
                      )
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-zinc-400">
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] text-zinc-500 hover:text-[#6366f1] transition-colors shrink-0 cursor-pointer"
                  title="Crea cartella"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          <div className="px-3.5 py-2 bg-[#f7f6f3] dark:bg-[#141417] border-b border-[#e5e3dc] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllToggle}
                disabled={filteredEmails.length === 0 || loading}
                className="flex items-center gap-1.5 font-medium hover:text-[#111113] dark:hover:text-[#f4f4f5] transition-colors disabled:opacity-40 cursor-pointer"
                title={
                  filteredEmails.length > 0 && filteredEmails.every((em) => selectedEmailIds.has(em.id))
                    ? 'Deseleziona tutte'
                    : 'Seleziona tutte'
                }
              >
                {filteredEmails.length > 0 && filteredEmails.every((em) => selectedEmailIds.has(em.id)) ? (
                  <CheckSquare className="h-3.5 w-3.5 text-[#6366f1]" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-zinc-400" />
                )}
                <span className="text-[11px]">
                  {filteredEmails.length > 0 && filteredEmails.every((em) => selectedEmailIds.has(em.id))
                    ? 'Tutte selezionate'
                    : 'Seleziona tutte'}
                </span>
              </button>

              {selectedEmailIds.size > 0 && (
                <span
                  className="bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/25 font-semibold px-1.5 py-0.5 rounded-sm text-[10px]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {selectedEmailIds.size}
                </span>
              )}
            </div>

            {selectedEmailIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={handleMarkAsReadBulk}
                  disabled={isBulkOperating}
                  className="h-6 px-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-[10px] font-semibold text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] inline-flex items-center gap-1 cursor-pointer"
                  title="Segna come lette"
                >
                  <Check className="h-3 w-3 text-[#10b981]" />
                  <span>Lette</span>
                </button>

                {currentFilter === 'trash' ? (
                  <button
                    type="button"
                    onClick={handleRestoreBulk}
                    disabled={isBulkOperating}
                    className="h-6 px-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CornerUpLeft className="h-3 w-3" />
                    <span>Ripristina</span>
                  </button>
                ) : currentFilter === 'archived' ? (
                  <button
                    type="button"
                    onClick={handleUnarchiveBulk}
                    disabled={isBulkOperating}
                    className="h-6 px-2 rounded-sm border border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold text-amber-600 dark:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CornerUpLeft className="h-3 w-3" />
                    <span>Ripristina</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleArchiveBulk}
                    disabled={isBulkOperating}
                    className="h-6 px-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-[10px] font-semibold text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="h-3 w-3 text-zinc-500" />
                    <span>Archivia</span>
                  </button>
                )}

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const fId = e.target.value === '__none' ? null : e.target.value
                      handleAssignFolder(Array.from(selectedEmailIds), fId)
                      e.target.value = ''
                    }
                  }}
                  defaultValue=""
                  className="h-6 text-[10px] px-1.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5]"
                  title="Assegna cartella alle selezionate"
                >
                  <option value="" disabled>
                    Sposta...
                  </option>
                  {customFolders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                  <option value="__none">Rimuovi cartella</option>
                </select>

                <button
                  type="button"
                  onClick={handleDeleteBulk}
                  disabled={isBulkOperating}
                  className="h-6 px-2 rounded-sm bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  title={currentFilter === 'trash' ? 'Elimina definitivamente' : 'Sposta nel Cestino'}
                >
                  {isBulkOperating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  <span>{selectedEmailIds.size}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-0.5 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
                  title="Annulla selezione"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Email List divide-y */}
          <div className="divide-y divide-[#e5e3dc] dark:divide-white/[0.06] flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-[#6366f1] animate-spin" />
              </div>
            ) : filteredEmails.length > 0 ? (
              filteredEmails.map((em) => {
                const isSelected = selectedEmail?.id === em.id
                const isMarked = selectedEmailIds.has(em.id)
                const isUnread = em.direction === 'inbound' && em.status === 'received'
                const toList = getToArray(em.to_address)

                return (
                  <div
                    key={em.id}
                    onClick={() => handleSelectEmail(em)}
                    className={`px-3.5 py-3 cursor-pointer transition-colors relative group border-l-2 ${
                      isSelected
                        ? 'border-l-[#6366f1] bg-[#f7f6f3] dark:bg-[#18181c]'
                        : isMarked
                          ? 'border-l-[#6366f1]/60 bg-[#6366f1]/5'
                          : 'border-l-transparent bg-white dark:bg-[#111114] hover:bg-[#fafaf8] dark:hover:bg-[#16161b]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelect(em.id, e)}
                          className="p-0.5 -ml-0.5 text-zinc-400 hover:text-[#6366f1] transition-colors shrink-0 cursor-pointer"
                          title={isMarked ? 'Deseleziona' : 'Seleziona'}
                        >
                          {isMarked ? (
                            <CheckSquare className="h-3.5 w-3.5 text-[#6366f1]" />
                          ) : (
                            <Square className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
                          )}
                        </button>
                        {isUnread && (
                          <span
                            className="h-2 w-2 rounded-full bg-[#6366f1] shrink-0"
                            title="Non letta"
                          />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isUnread
                              ? 'font-bold text-[#111113] dark:text-[#f4f4f5]'
                              : 'font-medium text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {em.direction === 'inbound' ? em.from_address : `A: ${toList.join(', ')}`}
                        </span>
                      </div>
                      <span
                        className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0 tabular-nums"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {em.created_at ? formatDate(em.created_at) : ''}
                      </span>
                    </div>

                    <div
                      className={`text-xs line-clamp-1 mb-0.5 ${
                        isUnread
                          ? 'font-semibold text-[#111113] dark:text-[#f4f4f5]'
                          : 'text-zinc-700 dark:text-zinc-300 font-normal'
                      }`}
                    >
                      {em.subject || '(Nessun oggetto)'}
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                      {em.body_text?.substring(0, 110) || 'Nessun testo...'}
                    </p>

                    <div className="flex items-center justify-between mt-2 gap-1.5">
                      <div className="flex items-center gap-1 flex-wrap min-w-0">
                        {em.direction === 'outbound' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[#6366f1]">
                            <ArrowUpRight className="h-2.5 w-2.5" />
                            Inviata
                          </span>
                        ) : (
                          <>
                            <span
                              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-zinc-600 dark:text-zinc-300 truncate max-w-[165px]"
                              style={{ fontFamily: 'var(--font-mono), monospace' }}
                            >
                              <ArrowDownLeft className="h-2.5 w-2.5 text-[#6366f1] shrink-0" />
                              {toList[0] || 'info@aiutiamoci.cloud'}
                            </span>

                            {emailFolderMap[em.id] &&
                              (() => {
                                const assigned = customFolders.find(
                                  (f) => f.id === emailFolderMap[em.id]
                                )
                                if (!assigned) return null
                                return (
                                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm border border-[#6366f1]/25 bg-[#6366f1]/10 text-[#6366f1]">
                                    <Folder className="h-2.5 w-2.5" />
                                    {assigned.name}
                                  </span>
                                )
                              })()}

                            {aiAnalysisMap[em.id] && (
                              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[#6366f1] capitalize font-medium">
                                <Sparkles className="h-2 w-2" />
                                {aiAnalysisMap[em.id].category}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {em.direction === 'inbound' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleReadStatus(em, e)}
                            className="p-1 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] rounded-sm cursor-pointer"
                            title={em.status === 'read' ? 'Segna come non letta' : 'Segna come letta'}
                          >
                            {em.status === 'read' ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEmail(em.id, e)}
                          className="p-1 text-zinc-400 hover:text-rose-500 rounded-sm cursor-pointer"
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
              <div className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-2">
                <Inbox className="h-7 w-7 mx-auto opacity-40" />
                <p>Nessun messaggio trovato in questa cartella.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pannello Lettura Destro */}
        <div
          className={`flex-1 min-w-0 flex flex-col h-full bg-white dark:bg-[#0d0d0f] overflow-hidden ${
            selectedEmail ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header Email */}
              <div className="p-4 sm:p-5 border-b border-[#e5e3dc] dark:border-white/[0.08] flex-shrink-0 bg-white dark:bg-[#111114]">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="lg:hidden flex items-center gap-1 text-xs font-semibold text-[#6366f1] mb-3 hover:underline cursor-pointer"
                >
                  <ArrowDownLeft className="h-4 w-4 rotate-45" />
                  <span>Torna alla lista email</span>
                </button>

                <h2
                  className="text-base sm:text-lg font-bold text-[#111113] dark:text-[#f4f4f5] leading-snug break-words mb-3"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  {selectedEmail.subject || '(Nessun oggetto)'}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Sender Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      fallback={
                        selectedEmail.direction === 'inbound'
                          ? selectedEmail.from_address
                            ? selectedEmail.from_address.charAt(0).toUpperCase()
                            : 'M'
                          : 'T'
                      }
                      className="h-8 w-8 bg-[#f7f6f3] dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5] font-semibold border border-[#e5e3dc] dark:border-white/[0.08] shrink-0"
                    />
                    <div className="flex flex-col min-w-0 text-xs">
                      <span className="font-semibold text-[#111113] dark:text-[#f4f4f5] truncate">
                        {selectedEmail.direction === 'inbound'
                          ? selectedEmail.from_address
                          : 'Team (@aiutiamoci.cloud)'}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        A: {getToArray(selectedEmail.to_address).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                    <span
                      className="text-[11px] text-zinc-400 dark:text-zinc-500 mr-1"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {selectedEmail.created_at ? formatDate(selectedEmail.created_at) : ''}
                    </span>

                    {selectedEmail.direction === 'inbound' && (
                      <button
                        type="button"
                        onClick={() => handleAnalyzeEmail(selectedEmail)}
                        disabled={isAnalyzing}
                        className="h-8 px-2.5 rounded-md border border-[#6366f1]/30 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#6366f1] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                        title="Analizza e genera una bozza di risposta con l'Agente AI"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Analisi...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{aiAnalysisMap[selectedEmail.id] ? 'Rianalizza' : 'Bozza AI'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {selectedEmail.body_html && (
                      <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'html' ? 'text' : 'html')}
                        className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#18181c] text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
                        title="Cambia vista HTML/Testo"
                      >
                        {viewMode === 'html' ? 'Testo' : 'HTML'}
                      </button>
                    )}

                    {selectedEmail.status === 'trash' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestoreFromTrash(selectedEmail.id)}
                          className="h-8 px-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CornerUpLeft className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Ripristina</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(selectedEmail.id)}
                          className="h-8 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Elimina da Aruba</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {selectedEmail.status === 'archived' ? (
                          <button
                            type="button"
                            onClick={() => handleUnarchiveEmail(selectedEmail.id)}
                            className="h-8 px-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CornerUpLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ripristina</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleArchiveEmail(selectedEmail.id)}
                            className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] inline-flex items-center gap-1.5 cursor-pointer"
                            title="Archivia questa email"
                          >
                            <Archive className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="hidden sm:inline">Archivia</span>
                          </button>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
                            className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] inline-flex items-center gap-1 cursor-pointer"
                            title="Sposta o assegna a cartella"
                          >
                            <Folder className="h-3.5 w-3.5 text-[#6366f1]" />
                            <span className="hidden sm:inline">Cartella</span>
                            <ChevronDown className="h-3 w-3 opacity-60" />
                          </button>

                          {isMoveMenuOpen && (
                            <div className="absolute right-0 top-9 w-48 bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg shadow-xl py-1.5 z-50 text-xs">
                              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Assegna a:
                              </div>
                              {customFolders.map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => handleAssignFolder([selectedEmail.id], f.id)}
                                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#f7f6f3] dark:hover:bg-[#1f1f24] transition-colors cursor-pointer ${
                                    emailFolderMap[selectedEmail.id] === f.id
                                      ? 'font-bold text-[#6366f1] bg-[#6366f1]/10'
                                      : 'text-[#111113] dark:text-zinc-300'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#6366f1]" />
                                    {f.name}
                                  </span>
                                  {emailFolderMap[selectedEmail.id] === f.id && (
                                    <Check className="h-3 w-3 text-[#6366f1]" />
                                  )}
                                </button>
                              ))}
                              {emailFolderMap[selectedEmail.id] && (
                                <button
                                  type="button"
                                  onClick={() => handleAssignFolder([selectedEmail.id], null)}
                                  className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 border-t border-[#e5e3dc] dark:border-white/[0.08] hover:bg-rose-500/10 transition-colors mt-1 cursor-pointer"
                                >
                                  Rimuovi da cartelle
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(selectedEmail.id)}
                          className="h-8 w-8 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 inline-flex items-center justify-center cursor-pointer"
                          title="Sposta nel Cestino"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-white dark:bg-[#0d0d0f]">
                {viewMode === 'html' && selectedEmail.body_html ? (
                  <div className="rounded-md overflow-hidden bg-[#141417] p-2 border border-[#e5e3dc] dark:border-white/[0.08]">
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.6;color:#e4e4e7;background-color:transparent;padding:12px;margin:0;word-break:break-word;}a{color:#818cf8;}p,div,span,td,th,li{color:inherit!important;}h1,h2,h3,h4,h5,h6{color:#f4f4f5!important;}</style></head><body>${selectedEmail.body_html}</body></html>`}
                      className="w-full min-h-[280px] border-0 bg-transparent"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      title="Email Preview"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-[#111113] dark:text-[#f4f4f5] whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedEmail.body_text ||
                      selectedEmail.body_html?.replace(/<[^>]*>?/gm, '') ||
                      'Nessun contenuto in questo messaggio.'}
                  </div>
                )}
              </div>

              {/* AI Analysis Panel */}
              {aiError && (
                <div className="mx-4 my-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{aiError}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiError(null)}
                    className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {aiAnalysisMap[selectedEmail.id] && (
                <div className="p-4 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#fafaf8] dark:bg-[#111114] flex-shrink-0">
                  <div className="p-3.5 bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-[#6366f1]" />
                        <span className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5]">
                          Agente Email AI (Gemini)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] capitalize font-semibold">
                          <Tag className="h-2.5 w-2.5 text-[#6366f1]" />
                          {aiAnalysisMap[selectedEmail.id].category}
                        </span>

                        <span
                          className="text-[10px] px-2 py-0.5 rounded-sm border border-[#6366f1]/25 bg-[#6366f1]/10 text-[#6366f1] font-semibold"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          Priorità {aiAnalysisMap[selectedEmail.id].priority}/5
                        </span>

                        {aiAnalysisMap[selectedEmail.id].autoReplyCandidate && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-sm bg-[#10b981] text-white font-semibold">
                            <Zap className="h-2.5 w-2.5" />
                            Auto-rispondibile
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] text-xs">
                      <span className="font-semibold text-[#111113] dark:text-[#f4f4f5]">
                        Riassunto:{' '}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {aiAnalysisMap[selectedEmail.id].summary}
                      </span>
                    </div>

                    {aiAnalysisMap[selectedEmail.id].suggestedReply && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                            Bozza di risposta suggerita:
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplyText(aiAnalysisMap[selectedEmail.id].suggestedReply)}
                            className="h-6 px-2 rounded-sm text-[11px] font-semibold text-[#6366f1] hover:bg-[#6366f1]/10 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copia nella Risposta</span>
                          </button>
                        </div>
                        <div className="p-2.5 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] text-xs text-[#111113] dark:text-[#f4f4f5] whitespace-pre-wrap font-sans max-h-36 overflow-y-auto">
                          {aiAnalysisMap[selectedEmail.id].suggestedReply}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reply Box */}
              <div className="p-3.5 sm:p-4 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#fafaf8] dark:bg-[#111114] flex-shrink-0">
                <div className="space-y-2 bg-white dark:bg-[#141417] p-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 gap-2">
                    <span className="flex items-center gap-1.5 truncate">
                      <Reply className="h-3.5 w-3.5 text-[#6366f1]" />
                      Rispondi a{' '}
                      <strong className="text-[#111113] dark:text-[#f4f4f5] truncate max-w-[220px]">
                        {selectedEmail.direction === 'inbound'
                          ? selectedEmail.from_address
                          : getToArray(selectedEmail.to_address)[0] || 'info@aiutiamoci.cloud'}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline-block">
                        Invia come:
                      </span>
                      <select
                        value={replyFrom}
                        onChange={(e) => setReplyFrom(e.target.value)}
                        className="h-6 px-1.5 text-[10px] rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] font-mono"
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
                    className="w-full text-xs p-2.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1] resize-none transition-colors"
                  />

                  {replyAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-1.5 rounded-sm bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08]">
                      {replyAttachments.map((att, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-[10px] text-[#111113] dark:text-[#f4f4f5]"
                        >
                          <Paperclip className="h-2.5 w-2.5 text-zinc-400" />
                          <span className="truncate max-w-[120px] font-mono">{att.filename}</span>
                          <span className="text-[9px] text-zinc-400">
                            ({(att.size / 1024).toFixed(0)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyAttachments((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-zinc-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setReplyText(
                            `\n\n--- Messaggio Originale ---\nDa: ${selectedEmail.from_address}\nOggetto: ${selectedEmail.subject}\n\n${selectedEmail.body_text || ''}`
                          )
                        }
                        className="text-[11px] text-zinc-500 hover:text-[#111113] dark:hover:text-[#f4f4f5] h-7 px-2 cursor-pointer"
                      >
                        Cita testo originale
                      </button>

                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-[#6366f1] h-7 px-2 transition-colors">
                        <Paperclip className="h-3 w-3" />
                        <span>Allega File</span>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileAttach(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSending || (!replyText.trim() && replyAttachments.length === 0)}
                      className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs font-semibold h-8 px-4 gap-1.5 cursor-pointer border-0 rounded-md"
                    >
                      <Send className="h-3 w-3" />
                      {isSending ? 'Invio...' : 'Invia Risposta'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 space-y-3 p-8">
              <Mail className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-[#111113] dark:text-[#f4f4f5]">
                Seleziona un messaggio per leggerlo
              </p>
              <p className="text-xs text-center max-w-xs">
                Tutte le email in arrivo sulle caselle aiutiamoci.cloud e mark2.cloud compariranno
                automaticamente qui.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuova Email */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Nuova Email di Team
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsComposeModalOpen(false)}
                className="h-7 w-7 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSendNewEmail} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Invia da (Mittente Casella) *
                </label>
                <select
                  value={composeFrom}
                  onChange={(e) => setComposeFrom(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-xs font-mono font-medium text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                >
                  {AVAILABLE_FROM_EMAILS.map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  A (Destinatario) *
                </label>
                <Input
                  autoFocus
                  required
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Es. cliente@azienda.com"
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Oggetto *</label>
                <Input
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Es. Richiesta Informazioni / Preventivo"
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Messaggio *
                </label>
                <textarea
                  required
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Scrivi qui il messaggio..."
                  className="w-full text-xs p-3 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-[#6366f1] resize-none"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-xs">
                    <Paperclip className="h-3.5 w-3.5 text-[#6366f1]" />
                    <span>Allegati ({composeAttachments.length})</span>
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#6366f1] text-[11px] font-semibold border border-[#6366f1]/25 transition-colors">
                    <Paperclip className="h-3 w-3" />
                    <span>Carica File</span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileAttach(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {composeAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08]">
                    {composeAttachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-[11px] text-[#111113] dark:text-[#f4f4f5]"
                      >
                        <Paperclip className="h-2.5 w-2.5 text-zinc-400" />
                        <span className="truncate max-w-[140px] font-mono">{att.filename}</span>
                        <span className="text-[9px] text-zinc-400 font-sans">
                          ({(att.size / 1024).toFixed(0)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setComposeAttachments((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-zinc-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <span className="text-[11px] text-zinc-400">Mittente: info@aiutiamoci.cloud</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsComposeModalOpen(false)}
                    className="border-[#e5e3dc] dark:border-white/[0.1]"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isComposing}
                    className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] gap-1.5 cursor-pointer border-0"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-2xl border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#10b981]" />
                <h3 className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]">
                  Guida Configurazione DNS Dominio{' '}
                  <span className="text-[#6366f1] font-mono">aiutiamoci.cloud</span> (Aruba)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDnsModalOpen(false)}
                className="h-7 w-7 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto text-xs">
              <div className="p-3.5 bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-md space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#111113] dark:text-[#f4f4f5]">
                  <ShieldCheck className="h-4 w-4 text-[#6366f1]" />
                  Pannello Aruba: Gestione DNS e Record Posta
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                  Per far recapitare la posta di <strong>aiutiamoci.cloud</strong> direttamente in
                  questa piattaforma e abilitare l&apos;invio verificato con SPF/DKIM, inserisci i
                  seguenti record nel pannello di controllo Aruba.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#111113] dark:text-[#f4f4f5]">
                  1. Record Posta in Arrivo (MX Inbound)
                </h4>
                <div className="p-3 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#111113] dark:text-[#f4f4f5]">
                        Tipo MX:
                      </span>{' '}
                      Priorità <span className="font-mono font-bold text-[#6366f1]">10</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('feedback-smtp.us-east-1.amazonses.com', 'mx')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'mx' ? (
                        <Check className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copia Host
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08]">
                    feedback-smtp.us-east-1.amazonses.com
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#111113] dark:text-[#f4f4f5]">
                  2. Record Autenticazione Invio (SPF, DKIM, DMARC)
                </h4>

                <div className="p-3 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#111113] dark:text-[#f4f4f5]">
                      TXT (SPF): Host @
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('v=spf1 include:amazonses.com ~all', 'spf')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'spf' ? (
                        <Check className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copia Valore
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08]">
                    v=spf1 include:amazonses.com ~all
                  </div>
                </div>

                <div className="p-3 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#111113] dark:text-[#f4f4f5]">
                      TXT (DMARC): Host _dmarc
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('v=DMARC1; p=none;', 'dmarc')}
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'dmarc' ? (
                        <Check className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copia Valore
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08]">
                    v=DMARC1; p=none;
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#111113] dark:text-[#f4f4f5]">
                  3. Endpoint Webhook Inbound (Resend Dashboard)
                </h4>
                <div className="p-3 bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      URL Destinazione Webhook Eventi:
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard('https://aiutiamoci.cloud/api/webhooks/resend', 'webhook')
                      }
                      className="h-7 text-[11px] gap-1"
                    >
                      {copiedKey === 'webhook' ? (
                        <Check className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copia URL Webhook
                    </Button>
                  </div>
                  <div className="font-mono text-[11px] text-[#6366f1] bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] select-all">
                    https://aiutiamoci.cloud/api/webhooks/resend
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex justify-end">
              <Button
                onClick={() => setIsDnsModalOpen(false)}
                className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs"
              >
                Chiudi Guida
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurazione Credenziali IMAP Aruba */}
      {isImapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-lg border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Configurazione Caselle Aruba (IMAP)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsImapModalOpen(false)}
                className="h-7 w-7 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveImapAccounts} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-md">
                <p className="text-[11px] text-[#111113] dark:text-zinc-200">
                  Inserisci le password delle caselle per consentire la sincronizzazione diretta con
                  i server <strong>imaps.aruba.it (porta 993 SSL)</strong>.
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {(Array.isArray(imapAccounts) ? imapAccounts : DEFAULT_IMAP_ACCOUNTS).map(
                  (acc, idx) => (
                    <div
                      key={acc.email}
                      className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#111113] dark:text-[#f4f4f5] text-xs">
                          {acc.email}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 border border-[#e5e3dc] dark:border-white/[0.08] px-1.5 py-0.5 rounded-sm">
                          imaps.aruba.it:993
                        </span>
                      </div>

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
                        className="text-xs h-8 bg-white dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.1]"
                      />
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImapModalOpen(false)}
                    className="border-[#e5e3dc] dark:border-white/[0.1]"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImapAccounts(DEFAULT_IMAP_ACCOUNTS)
                    }}
                    className="text-[11px] text-zinc-500 hover:text-rose-500"
                    title="Reimposta l'elenco delle caselle predefinite"
                  >
                    Reimposta Elenco
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSyncingImap}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] gap-1.5 border-0"
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

      {/* Modal Nuova Cartella Personalizzata */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl w-full max-w-sm border border-[#e5e3dc] dark:border-white/[0.1] overflow-hidden">
            <div className="p-4 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-[#f7f6f3] dark:bg-[#141417]">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Nuova Cartella
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="h-7 w-7 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Nome Cartella *
                </label>
                <Input
                  autoFocus
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Es. Fornitori, Contratti, Marketing"
                  className="text-xs bg-[#f7f6f3] dark:bg-[#0d0d0f] border-[#e5e3dc] dark:border-white/[0.1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Colore Etichetta
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { id: 'blue', bg: 'bg-[#6366f1]' },
                    { id: 'emerald', bg: 'bg-[#10b981]' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'purple', bg: 'bg-purple-500' },
                    { id: 'rose', bg: 'bg-rose-500' },
                    { id: 'indigo', bg: 'bg-indigo-500' },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setNewFolderColor(col.id)}
                      className={`h-6 w-6 rounded-full ${col.bg} transition-all cursor-pointer ${
                        newFolderColor === col.id
                          ? 'ring-2 ring-offset-2 ring-[#6366f1] dark:ring-offset-[#141417] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] font-semibold border-0"
                >
                  Crea Cartella
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
