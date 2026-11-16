'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Users,
  Send,
  Paperclip,
  Hash,
  Loader2,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  Bell,
  BellRing,
  Check,
  MessageCircle,
  AtSign,
  Smile,
  CornerDownRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/types/index'
import {
  requestNotificationPermission,
  sendDesktopNotification,
  getWebPushStatus,
  registerWebPushSubscription,
} from '@/lib/notifications'
import {
  notifyChatMessageAction,
  getVapidPublicKeyAction,
  savePushSubscriptionAction,
  sendTestPushNotificationAction,
} from '@/app/actions/notifications'
import { toggleMessageReactionAction, ChatMetadataItem } from '@/app/actions/chat'

type MessageWithSender = Message & { sender?: Profile }

interface ChatAttachment {
  name: string
  url: string
  size: number
  type: string
  storage_path?: string
}

const CHANNELS = [
  { id: 'ch-1', name: 'generale', desc: 'Comunicazioni generali, avvisi e allineamento team', icon: Hash },
  { id: 'ch-2', name: 'progetti', desc: 'Discussioni operative su task, sprint e deliverable', icon: Hash },
  { id: 'ch-3', name: 'marketing-social', desc: 'Campagne, Growth Studio, reel video e grafiche', icon: Hash },
  { id: 'ch-4', name: 'corsi-academy', desc: 'Materiale didattico, studenti AI Start/Pro e certificazioni', icon: Hash },
  { id: 'ch-5', name: 'commerciale-b2b', desc: 'Lead, proposte commerciali per PMI e discovery di flusso', icon: Hash },
  { id: 'ch-6', name: 'idee-innovazione', desc: 'Nuovi modelli AI, spunti creativi, tool e automazioni', icon: Hash },
]

const QUICK_REACTIONS = ['✅', '👀', '🔥', '👍']

/**
 * Estrae parent_id, reactions e file reali da attachments del messaggio.
 */
function extractMessageMeta(msg: MessageWithSender) {
  const raw = Array.isArray(msg.attachments) ? (msg.attachments as any[]) : []
  const meta = raw.find((a) => a && a.type === '__chat_meta__')
  return {
    parentId: (msg as any).parent_message_id || meta?.parent_id || null,
    reactions: (meta?.reactions || {}) as Record<string, string[]>,
    files: raw.filter((a) => a && a.type !== '__chat_meta__') as ChatAttachment[],
  }
}

/**
 * Estrae tutti i nomi menzionati con `@`.
 */
function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9À-ÿ_]+)/g)
  if (!matches) return []
  return Array.from(new Set(matches.map((m) => m.slice(1))))
}

/**
 * Renderizza il testo del messaggio evidenziando le @menzioni come pill.
 */
function renderMessageContent(content: string, isMe: boolean) {
  if (!content) return null
  const parts = content.split(/(@[a-zA-Z0-9À-ÿ_]+)/g)
  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={idx}
              className={`inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md font-semibold text-[11px] sm:text-xs transition-colors ${
                isMe
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {part}
            </span>
          )
        }
        return <span key={idx}>{part}</span>
      })}
    </span>
  )
}

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState('generale')
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileChannels, setShowMobileChannels] = useState(false)

  // Web Push States
  const [pushStatus, setPushStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'prompt'>('loading')
  const [isSendingTestPush, setIsSendingTestPush] = useState(false)
  const [testPushSent, setTestPushSent] = useState(false)

  // Attachment States
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null)

  // Phase 2 States: Badge non letti & Thread laterale & Autocomplete @menzioni
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [threadInputMessage, setThreadInputMessage] = useState('')
  const [isSendingThreadReply, setIsSendingThreadReply] = useState(false)

  // Autocomplete Menzioni
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionTarget, setMentionTarget] = useState<'main' | 'thread' | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainInputRef = useRef<HTMLInputElement>(null)
  const threadInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior })
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('smooth'), 100)
    return () => clearTimeout(timer)
  }, [messages, activeChannel])

  // Scroll bottom on active thread change / new reply
  useEffect(() => {
    if (activeThreadId) {
      const timer = setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeThreadId, messages])

  // Check Web Push Status on mount
  useEffect(() => {
    const checkPush = async () => {
      try {
        const status = await getWebPushStatus()
        setPushStatus(status)
      } catch {
        setPushStatus('unsupported')
      }
    }
    checkPush()
  }, [])

  // Auto-select channel from URL query parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paramChannel = new URLSearchParams(window.location.search).get('channel')
      if (paramChannel && CHANNELS.some((c) => c.name === paramChannel)) {
        setActiveChannel(paramChannel)
      }
    }
  }, [])

  // Persistenza e azzeramento letture canale
  const markChannelAsRead = (ch: string) => {
    if (!currentUser) return
    const key = `aiutiamoci_chat_last_read_${currentUser.id}`
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '{}')
      existing[ch] = new Date().toISOString()
      localStorage.setItem(key, JSON.stringify(existing))
    } catch (e) {
      console.warn('Errore salvataggio last_read:', e)
    }
    setUnreadCounts((prev) => ({ ...prev, [ch]: 0 }))
  }

  // Fetch initial user, team members, and messages for channel
  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      requestNotificationPermission()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profile) setCurrentUser(profile)
      }

      const { data: profiles } = await supabase.from('profiles').select('*')
      if (profiles) {
        setTeamMembers(profiles.filter((p: any) => !p.is_agent))
      }

      await fetchMessages(activeChannel)
      markChannelAsRead(activeChannel)
      setLoading(false)
    }

    initChat()
  }, [activeChannel])

  // Setup Supabase Realtime Subscription (ascolta tutti i canali per non letti e update reazioni)
  useEffect(() => {
    const channel = supabase
      .channel('public:messages_realtime_all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message
          const senderProfile = teamMembers.find((p) => p.id === newMessage.sender_id)

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: senderProfile,
          }

          if (newMessage.channel === activeChannel) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev
              return [...prev, messageWithSender]
            })
            markChannelAsRead(activeChannel)
          } else {
            if (currentUser && newMessage.sender_id !== currentUser.id) {
              setUnreadCounts((prev) => ({
                ...prev,
                [newMessage.channel]: (prev[newMessage.channel] || 0) + 1,
              }))
            }
          }

          if (currentUser && newMessage.sender_id !== currentUser.id) {
            sendDesktopNotification(
              `Messaggio da ${senderProfile?.full_name || 'Team'} in #${newMessage.channel}`,
              { body: newMessage.content || 'Nuovo messaggio o allegato' },
              'chat'
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updatedMessage.id
                ? {
                    ...m,
                    ...updatedMessage,
                    sender: m.sender || teamMembers.find((p) => p.id === updatedMessage.sender_id),
                  }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannel, teamMembers, currentUser])

  const fetchMessages = async (channelName: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('channel', channelName)
      .order('created_at', { ascending: true })

    if (data && !error) {
      setMessages(data)
    }
  }

  // Toggle Reazione Emoji con aggiornamento ottimistico
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return
    const userId = currentUser.id

    // Aggiornamento ottimistico locale
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const raw: any[] = Array.isArray(m.attachments) ? [...m.attachments] : []
        const metaIdx = raw.findIndex((a: any) => a && a.type === '__chat_meta__')
        let meta: ChatMetadataItem =
          metaIdx >= 0 ? { ...(raw[metaIdx] as any) } : { type: '__chat_meta__', reactions: {} }

        const reactions = { ...(meta.reactions || {}) }
        const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : []
        const userIdx = currentUsers.indexOf(userId)
        if (userIdx >= 0) {
          currentUsers.splice(userIdx, 1)
        } else {
          currentUsers.push(userId)
        }

        if (currentUsers.length > 0) {
          reactions[emoji] = currentUsers
        } else {
          delete reactions[emoji]
        }

        meta.reactions = reactions
        if (metaIdx >= 0) {
          raw[metaIdx] = meta as any
        } else {
          raw.push(meta as any)
        }
        return { ...m, attachments: raw as any }
      })
    )

    // Server Action
    await toggleMessageReactionAction(messageId, emoji)
  }

  const handleEnablePush = async () => {
    try {
      setPushStatus('loading')
      const resKey = await getVapidPublicKeyAction()
      if (!resKey.success || !resKey.publicKey) {
        alert('Errore configurazione VAPID: ' + (resKey.error || 'chiave pubblica non disponibile'))
        setPushStatus('prompt')
        return
      }

      const sub = await registerWebPushSubscription(resKey.publicKey)
      const saveRes = await savePushSubscriptionAction(sub)
      if (saveRes.success) {
        setPushStatus('subscribed')
      } else {
        alert('Errore registrazione sottoscrizione: ' + saveRes.error)
        setPushStatus('prompt')
      }
    } catch (err: any) {
      console.error('Attivazione Web Push fallita:', err)
      const current = await getWebPushStatus()
      setPushStatus(current)
    }
  }

  const handleSendTestPush = async () => {
    try {
      setIsSendingTestPush(true)
      const res = await sendTestPushNotificationAction()
      if (res.success) {
        setTestPushSent(true)
        setTimeout(() => setTestPushSent(false), 3000)
      } else {
        alert(res.error || 'Impossibile inviare la notifica test')
      }
    } catch (err: any) {
      alert('Errore invio notifica test: ' + err.message)
    } finally {
      setIsSendingTestPush(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      setPendingFiles((prev) => [...prev, ...selected])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadAttachments = async (filesToUpload: File[]): Promise<ChatAttachment[]> => {
    const uploaded: ChatAttachment[] = []

    for (const file of filesToUpload) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `chat-attachments/${activeChannel}/${Date.now()}_${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('team-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading chat attachment:', uploadError)
        continue
      }

      const { data: publicData } = supabase.storage
        .from('team-files')
        .getPublicUrl(storagePath)

      uploaded.push({
        name: file.name,
        url: publicData.publicUrl,
        size: file.size,
        type: file.type || 'application/octet-stream',
        storage_path: storagePath,
      })
    }

    return uploaded
  }

  // Invio messaggio principale
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputMessage.trim() && pendingFiles.length === 0) || !currentUser || isUploading) return

    setIsUploading(true)
    let uploadedAttachments: any[] = []

    if (pendingFiles.length > 0) {
      const files = await uploadAttachments(pendingFiles)
      uploadedAttachments = [...files]
    }

    const messageContent = inputMessage.trim()
    setInputMessage('')
    setPendingFiles([])
    setMentionQuery(null)

    const { error } = await (supabase as any).from('messages').insert({
      channel: activeChannel,
      content: messageContent,
      attachments: uploadedAttachments,
      sender_id: currentUser.id,
      is_system: false,
    })

    setIsUploading(false)

    if (error) {
      console.error('Error sending message:', error)
    } else {
      const notifyText =
        messageContent ||
        (uploadedAttachments.length > 0 ? `📎 Ha inviato ${uploadedAttachments.length} allegato/i` : '')
      const mentions = extractMentions(messageContent)
      notifyChatMessageAction(activeChannel, notifyText, currentUser.full_name, {
        mentionedNames: mentions,
      }).catch((err) => console.error('Chat push & Telegram notify error:', err))
    }
  }

  // Invio risposta nel thread
  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadInputMessage.trim() || !currentUser || !activeThreadId || isSendingThreadReply) return

    setIsSendingThreadReply(true)
    const replyText = threadInputMessage.trim()
    setThreadInputMessage('')
    setMentionQuery(null)

    const metaItem: ChatMetadataItem = {
      type: '__chat_meta__',
      parent_id: activeThreadId,
    }

    const { error } = await (supabase as any).from('messages').insert({
      channel: activeChannel,
      content: replyText,
      attachments: [metaItem],
      sender_id: currentUser.id,
      is_system: false,
    })

    setIsSendingThreadReply(false)

    if (error) {
      console.error('Error sending thread reply:', error)
    } else {
      const mentions = extractMentions(replyText)
      notifyChatMessageAction(activeChannel, replyText, currentUser.full_name, {
        isThreadReply: true,
        mentionedNames: mentions,
      }).catch((err) => console.error('Thread notify error:', err))
    }
  }

  // Gestione input menzioni
  const handleInputChangeWithMentions = (
    val: string,
    target: 'main' | 'thread'
  ) => {
    if (target === 'main') setInputMessage(val)
    else setThreadInputMessage(val)

    const match = val.match(/@([a-zA-Z0-9À-ÿ]*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
      setMentionTarget(target)
    } else {
      setMentionQuery(null)
      setMentionTarget(null)
    }
  }

  const handleSelectMention = (name: string) => {
    if (mentionTarget === 'main') {
      const updated = inputMessage.replace(/@([a-zA-Z0-9À-ÿ]*)$/, `@${name} `)
      setInputMessage(updated)
      mainInputRef.current?.focus()
    } else if (mentionTarget === 'thread') {
      const updated = threadInputMessage.replace(/@([a-zA-Z0-9À-ÿ]*)$/, `@${name} `)
      setThreadInputMessage(updated)
      threadInputRef.current?.focus()
    }
    setMentionQuery(null)
    setMentionTarget(null)
  }

  // Calcolo messaggi principali e raggruppamento thread
  const mainMessages = messages.filter((m) => !extractMessageMeta(m).parentId)
  const repliesByParent = messages.reduce<Record<string, MessageWithSender[]>>((acc, m) => {
    const pId = extractMessageMeta(m).parentId
    if (pId) {
      if (!acc[pId]) acc[pId] = []
      acc[pId].push(m)
    }
    return acc
  }, {})

  const activeThreadParent = activeThreadId
    ? messages.find((m) => m.id === activeThreadId) || null
    : null
  const activeThreadReplies = activeThreadId ? repliesByParent[activeThreadId] || [] : []

  const currentChannelObj = CHANNELS.find((c) => c.name === activeChannel) || CHANNELS[0]

  // Candidati menzioni filtrati (token singolo pulito: @Marco, @Stefano, @Lorenzo)
  const mentionCandidates = [
    { id: 'all', name: 'tutti', role: 'Team All' },
    ...teamMembers.map((m) => ({
      id: m.id,
      name: (m.full_name || 'team').trim().split(/\s+/)[0],
      role: m.role,
    })),
  ].filter((c) => !mentionQuery || c.name.toLowerCase().includes(mentionQuery))

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-white dark:bg-slate-900">
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        className="hidden"
      />

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative w-full h-full">
        {/* Mobile Drawer Backdrop */}
        {showMobileChannels && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
            onClick={() => setShowMobileChannels(false)}
          />
        )}

        {/* Left: Channels & Team List */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-72 h-[100dvh] bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out
            md:static md:z-auto md:w-[240px] lg:w-[250px] md:h-full md:shadow-none md:translate-x-0 md:flex md:shrink-0 md:border-r border-slate-200 dark:border-slate-800 md:bg-slate-50/50 md:dark:bg-slate-900/60 overflow-y-auto min-h-0
            ${showMobileChannels ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Canali Tematici
              </div>
              <button
                onClick={() => setShowMobileChannels(false)}
                className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Chiudi menu canali"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.name
                const Icon = ch.icon
                const unread = unreadCounts[ch.name] || 0
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch.name)
                      setShowMobileChannels(false)
                      setActiveThreadId(null)
                      markChannelAsRead(ch.name)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">#{ch.name}</span>
                    </div>
                    {unread > 0 && !isActive && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white animate-pulse">
                        {unread}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Team Members */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 flex items-center justify-between">
              <span>Team</span>
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-2 text-xs">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        member.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                      {member.full_name}
                    </span>
                  </div>
                  <Badge
                    variant={member.role === 'dev' ? 'purple' : member.role === 'admin' ? 'destructive' : 'info'}
                    className="text-[9px] px-1.5 py-0 uppercase"
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <div className="text-slate-400 px-2 py-1">Nessun membro trovato</div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Main Message Stream */}
        <div className="flex-1 min-w-0 h-full flex flex-col bg-slate-50/20 dark:bg-slate-950/40 relative overflow-hidden">
          {/* Channel Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0 z-10 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setShowMobileChannels(true)}
                className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                title="Scegli canale"
              >
                <Menu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">{currentChannelObj.name}</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {currentChannelObj.desc}
                </p>
              </div>
            </div>

            {/* Right Header Actions: Web Push Button & Realtime Badge */}
            <div className="flex items-center gap-2 shrink-0">
              {pushStatus === 'subscribed' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSendingTestPush}
                  onClick={handleSendTestPush}
                  className="text-xs h-8 px-2.5 gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
                  title="Notifiche Web Push attive. Clicca per inviare una notifica test su questo dispositivo."
                >
                  {isSendingTestPush ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : testPushSent ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <BellRing className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className="hidden sm:inline">
                    {testPushSent ? 'Notifica Inviata!' : isSendingTestPush ? 'Invio test...' : 'Push Attive · Test'}
                  </span>
                  <span className="sm:hidden">{testPushSent ? 'Inviata!' : 'Push OK'}</span>
                </Button>
              ) : pushStatus === 'prompt' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEnablePush}
                  className="text-xs h-8 px-2.5 gap-1.5 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs"
                  title="Attiva le notifiche Web Push per ricevere avvisi istantanei su questo dispositivo."
                >
                  <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Attiva Push</span>
                </Button>
              ) : pushStatus === 'denied' ? (
                <span
                  className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                  title="I permessi per le notifiche sono bloccati nelle impostazioni del browser"
                >
                  <Bell className="h-3 w-3" />
                  <span className="hidden sm:inline">Push bloccate</span>
                </span>
              ) : null}

              <Badge
                variant="success"
                className="py-0.5 sm:py-1 px-2.5 sm:px-3 text-[11px] sm:text-xs flex items-center gap-1.5 w-fit"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Realtime Connesso</span>
                <span className="sm:hidden">Realtime</span>
              </Badge>
            </div>
          </div>

          {/* Messages List (Timeline principale dei messaggi radice) */}
          <div
            ref={chatContainerRef}
            className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto min-h-0 overscroll-contain"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : mainMessages.length > 0 ? (
              mainMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id
                const { reactions, files } = extractMessageMeta(msg)
                const replies = repliesByParent[msg.id] || []
                const isThreadOpen = activeThreadId === msg.id

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start gap-2.5 sm:gap-3 ${isMe ? 'flex-row-reverse' : ''} ${
                      isThreadOpen ? 'bg-blue-50/40 dark:bg-blue-950/20 p-2 rounded-2xl -mx-2 transition-colors' : ''
                    }`}
                  >
                    <Avatar
                      fallback={msg.sender?.full_name || '?'}
                      src={msg.sender?.avatar_url || undefined}
                      className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-semibold text-[10px] sm:text-xs shrink-0 mt-1 border border-blue-200 dark:border-blue-800"
                    />
                    <div className={`flex flex-col flex-1 space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-1.5 sm:gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white">
                          {isMe ? 'Tu' : msg.sender?.full_name || 'Utente Sconosciuto'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400">{formatDate(msg.created_at)}</span>
                      </div>

                      {/* Text Bubble */}
                      {msg.content && (
                        <div
                          className={`text-xs sm:text-sm p-2.5 sm:p-3 rounded-2xl shadow-xs leading-relaxed max-w-[88%] sm:max-w-[85%] break-words ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                          }`}
                        >
                          {renderMessageContent(msg.content, isMe)}
                        </div>
                      )}

                      {/* Attachments Files Rendering */}
                      {files.length > 0 && (
                        <div className="space-y-2 max-w-[88%] sm:max-w-[85%]">
                          {files.map((att, attIdx) => {
                            const isImg =
                              att.type?.startsWith('image/') ||
                              /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.name || '')
                            return (
                              <div key={attIdx} className="overflow-hidden rounded-xl">
                                {isImg ? (
                                  <div
                                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/30"
                                    onClick={() => setPreviewModalUrl(att.url)}
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name || 'Immagine allegata'}
                                      className="max-h-64 max-w-full rounded-xl object-cover group-hover:scale-102 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
                                      <Eye className="h-4 w-4" />
                                      <span>Ingrandisci</span>
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={att.name}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                                      isMe
                                        ? 'bg-blue-700/80 hover:bg-blue-700 border-blue-500/50 text-white shadow-xs'
                                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0">
                                        <FileText className="h-4 w-4" />
                                      </div>
                                      <div className="flex flex-col min-w-0 text-left">
                                        <span className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[260px]">
                                          {att.name}
                                        </span>
                                        <span className="text-[10px] opacity-75">{formatBytes(att.size || 0)}</span>
                                      </div>
                                    </div>
                                    <Download className="h-4 w-4 opacity-75 shrink-0 ml-2" />
                                  </a>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Reazioni & Azioni Rapide */}
                      <div className={`flex flex-wrap items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Pill delle reazioni esistenti */}
                        {Object.entries(reactions).map(([emoji, userIds]) => {
                          const hasReacted = currentUser && userIds.includes(currentUser.id)
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                hasReacted
                                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                              }`}
                              title={`Reagito da ${userIds.length} utente/i`}
                            >
                              <span>{emoji}</span>
                              <span className="font-semibold text-[10px]">{userIds.length}</span>
                            </button>
                          )
                        })}

                        {/* Barra Reazioni Rapide + Tasto Rispondi */}
                        <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="h-6 w-6 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs flex items-center justify-center transition-transform hover:scale-120"
                              title={`Reagisci con ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setActiveThreadId(msg.id)}
                            className="h-6 px-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="Rispondi nel thread"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Rispondi</span>
                          </button>
                        </div>
                      </div>

                      {/* Link "X risposte • Vedi thread" */}
                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveThreadId(msg.id)}
                          className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 transition-colors shadow-xs w-fit"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>
                            {replies.length} {replies.length === 1 ? 'risposta' : 'risposte'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">• Vedi thread</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nessun messaggio in #{activeChannel}. Inizia la conversazione!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pending Files Preview Strip */}
          {pendingFiles.length > 0 && (
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center gap-2 overflow-x-auto">
              {pendingFiles.map((file, idx) => {
                const isImg = file.type.startsWith('image/')
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs shrink-0 shadow-xs"
                  >
                    {isImg ? (
                      <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[120px] font-medium text-slate-800 dark:text-slate-200">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({formatBytes(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(idx)}
                      className="p-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Autocomplete Popup Menzioni per Input Principale */}
          {mentionQuery !== null && mentionTarget === 'main' && mentionCandidates.length > 0 && (
            <div className="absolute bottom-16 left-4 z-30 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 dark:border-slate-700/60">
                <AtSign className="h-3 w-3" />
                <span>Menziona membro</span>
              </div>
              {mentionCandidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectMention(c.name)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">@{c.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{c.role}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Bar Principale */}
          <div className="p-2.5 sm:p-3.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !currentUser}
                title="Allega foto o documenti"
                className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={mainInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => handleInputChangeWithMentions(e.target.value, 'main')}
                placeholder={
                  pendingFiles.length > 0
                    ? 'Aggiungi una didascalia...'
                    : `Scrivi in #${activeChannel}... (digita @ per menzionare)`
                }
                className="flex-1 text-xs sm:text-sm focus:outline-none bg-transparent px-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-w-0"
                disabled={!currentUser || isUploading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={(!inputMessage.trim() && pendingFiles.length === 0) || !currentUser || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 sm:h-9 px-3 sm:px-4 gap-1.5 shadow-xs rounded-lg shrink-0"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="hidden sm:inline">Invio...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Invia</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Thread Lateral Panel (360px desktop, full drawer mobile) */}
        {activeThreadParent && (
          <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:w-[360px] lg:w-[380px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-2xl md:shadow-none animate-in slide-in-from-right-4 duration-200">
            {/* Thread Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thread</h3>
                <span className="text-xs text-slate-400">#{activeChannel}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Chiudi thread"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thread Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-0">
              {/* Messaggio Padre Originale */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    fallback={activeThreadParent.sender?.full_name || '?'}
                    src={activeThreadParent.sender?.avatar_url || undefined}
                    className="h-6 w-6 text-[10px]"
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeThreadParent.sender?.full_name || 'Utente'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {formatDate(activeThreadParent.created_at)}
                  </span>
                </div>
                <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                  {renderMessageContent(activeThreadParent.content, false)}
                </div>
                {/* Reazioni padre */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {Object.entries(extractMessageMeta(activeThreadParent).reactions).map(([emoji, userIds]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleToggleReaction(activeThreadParent.id, emoji)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold">{userIds.length}</span>
                    </button>
                  ))}
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleToggleReaction(activeThreadParent.id, emoji)}
                      className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separatore Risposte */}
              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-slate-200 dark:border-slate-800 flex-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeThreadReplies.length}{' '}
                  {activeThreadReplies.length === 1 ? 'Risposta' : 'Risposte'}
                </span>
                <div className="h-px bg-slate-200 dark:border-slate-800 flex-1" />
              </div>

              {/* Elenco Risposte del Thread */}
              {activeThreadReplies.length > 0 ? (
                activeThreadReplies.map((reply) => {
                  const isMe = reply.sender_id === currentUser?.id
                  const { reactions: replyReactions } = extractMessageMeta(reply)
                  return (
                    <div key={reply.id} className="flex items-start gap-2.5">
                      <Avatar
                        fallback={reply.sender?.full_name || '?'}
                        src={reply.sender?.avatar_url || undefined}
                        className="h-6 w-6 text-[10px] shrink-0 mt-0.5"
                      />
                      <div className="flex flex-col flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {isMe ? 'Tu' : reply.sender?.full_name || 'Utente'}
                          </span>
                          <span className="text-[9px] text-slate-400">{formatDate(reply.created_at)}</span>
                        </div>
                        <div
                          className={`text-xs p-2 rounded-xl shadow-xs leading-relaxed break-words ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {renderMessageContent(reply.content, isMe)}
                        </div>

                        {/* Reazioni risposta */}
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {Object.entries(replyReactions).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(reply.id, emoji)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                              <span>{emoji}</span>
                              <span className="font-semibold">{userIds.length}</span>
                            </button>
                          ))}
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(reply.id, emoji)}
                              className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] flex items-center justify-center"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Nessuna risposta in questo thread. Sii il primo a rispondere!
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Autocomplete Popup Menzioni per Thread */}
            {mentionQuery !== null && mentionTarget === 'thread' && mentionCandidates.length > 0 && (
              <div className="absolute bottom-16 right-4 z-30 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 max-h-44 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 dark:border-slate-700/60">
                  <AtSign className="h-3 w-3" />
                  <span>Menziona membro</span>
                </div>
                {mentionCandidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectMention(c.name)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">@{c.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{c.role}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thread Input Form */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <form onSubmit={handleSendThreadReply} className="flex items-center gap-2">
                <input
                  ref={threadInputRef}
                  type="text"
                  value={threadInputMessage}
                  onChange={(e) => handleInputChangeWithMentions(e.target.value, 'thread')}
                  placeholder="Rispondi al thread... (@ per menzionare)"
                  className="flex-1 text-xs focus:outline-none bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 min-w-0"
                  disabled={isSendingThreadReply || !currentUser}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!threadInputMessage.trim() || isSendingThreadReply || !currentUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg shrink-0 text-xs gap-1"
                >
                  {isSendingThreadReply ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CornerDownRight className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Invia</span>
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Zoom Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-lg"
              aria-label="Chiudi anteprima"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Anteprima a schermo intero"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}
    </div>
  )
}
