'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
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
  CornerDownRight,
  Lock,
  Plus,
  Trash2,
  Search,
  Copy,
  CheckCircle2,
  UserPlus,
  Terminal,
  Sparkles,
  Mail,
  LifeBuoy,
  UploadCloud,
  Mic,
  Headphones,
  Video,
  Volume2,
} from 'lucide-react'
import { ChatHuddleBar } from '@/components/chat/ChatHuddleBar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { renderChatText } from '@/lib/chat-text'
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
import {
  toggleMessageReactionAction,
  getCustomChannelsAction,
  createCustomChannelAction,
  deleteCustomChannelAction,
  inviteCollaboratorAction,
  updateChannelMembersAction,
  executeSlashCommandAction,
  getChatUnreadSummaryAction,
  ChatMetadataItem,
  CustomChannelItem,
  EnrolledStudentChatMember,
} from '@/app/actions/chat'
import { getOpenSupportTicketsCountAction } from '@/app/actions/support'

type MessageWithSender = Message & { sender?: Profile }

interface ChatAttachment {
  name: string
  url: string
  size: number
  type: string
  storage_path?: string
}

interface DisplayChannel {
  id: string
  name: string
  desc: string
  icon: any
  isPrivate: boolean
  memberIds?: string[]
  createdBy?: string
  isCustom?: boolean
}

export interface ChannelParticipant {
  id: string
  full_name: string
  email?: string
  role: string
  is_active?: boolean
  code?: string
}

const SYSTEM_CHANNELS: DisplayChannel[] = [
  {
    id: 'ch-community',
    name: 'community-studenti',
    desc: 'Community Corsisti AI Start & AI Pro — Tutti gli studenti iscritti e docenti',
    icon: Users,
    isPrivate: false,
    isCustom: false,
  },
]

const QUICK_REACTIONS = ['✅', '👀', '🔥', '👍']

interface SlashCommandItem {
  command: string
  title: string
  description: string
  example: string
  icon: any
  requiresTeam?: boolean
}

const AVAILABLE_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    command: '/task',
    title: '/task',
    description: 'Crea una nuova attività nel Kanban (/lavori)',
    example: '/task Titolo attività | Descrizione opzionale',
    icon: Terminal,
  },
  {
    command: '/lead',
    title: '/lead',
    description: 'Inserisci un nuovo lead nel CRM (/clienti)',
    example: '/lead Azienda Alfa 2500',
    icon: Sparkles,
    requiresTeam: true,
  },
  {
    command: '/ai',
    title: '/ai',
    description: 'Chiedi una risposta immediata al Copilot AI in canale',
    example: '/ai Come posso ottimizzare questo flusso?',
    icon: Sparkles,
  },
]

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
    senderName: (meta?.sender_name || null) as string | null,
    senderEmail: (meta?.sender_email || null) as string | null,
    senderStudentId: (meta?.sender_student_id || null) as string | null,
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
 * Renderizza il testo del messaggio evidenziando link cliccabili e @menzioni.
 */
function renderMessageContent(content: string, isMe: boolean) {
  return renderChatText(content, { isMe, accent: 'blue', highlightMentions: true })
}

function normalizeTeamDisplayName(
  fullName?: string | null,
  email?: string | null,
  role?: string | null
): string {
  const raw = (fullName || '').trim()
  if (role === 'collaborator') {
    return raw || (email ? email.split('@')[0] : 'Collaboratore')
  }
  const lower = raw.toLowerCase()
  const mail = (email || '').toLowerCase()
  if (lower === 'marco' || lower.includes('gerelmo') || mail.includes('gerelmo')) return 'Marco'
  if (
    lower === 'lorenzo' ||
    lower.includes('lorenzolodi') ||
    lower.includes('lorenzo lodi') ||
    mail.includes('lorenzolodi')
  ) {
    return 'Lorenzo'
  }
  if (
    lower === 'stefano' ||
    lower.includes('malaisi') ||
    lower.includes('maraisi') ||
    mail.includes('malaisi') ||
    mail.includes('maraisi')
  ) {
    return 'Stefano'
  }
  return raw || (email ? email.split('@')[0] : 'Team')
}

function isRealChatProfile(p: any): boolean {
  if (!p || p.is_agent) return false
  const nameLower = (p.full_name || '').toLowerCase()
  const mailLower = (p.email || '').toLowerCase()
  if (nameLower.includes('nemotron') || mailLower.includes('nemotron')) return false
  if (nameLower.includes('pentest') || mailLower.includes('pentest')) return false
  return true
}

function formatVoiceDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function VoiceAudioPlayer({ att, isMe }: { att: ChatAttachment; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1)

  const cycleSpeed = () => {
    const next: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1
    setPlaybackRate(next)
    if (audioRef.current) {
      audioRef.current.playbackRate = next
    }
  }

  const displayName = /^vocale-/i.test(att.name || '') ? 'Messaggio vocale' : att.name

  return (
    <div
      className={`p-2.5 rounded-lg border flex flex-col gap-2 min-w-[230px] sm:min-w-[280px] ${
        isMe
          ? 'bg-[#6366f1] border-[#6366f1] text-white'
          : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`p-1.5 rounded-md shrink-0 ${
              isMe ? 'bg-white/20 text-white' : 'bg-[#6366f1]/10 text-[#6366f1]'
            }`}
          >
            <Volume2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{displayName}</p>
            <p className="text-[10px] opacity-75">{formatBytes(att.size || 0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border transition-colors cursor-pointer ${
              isMe
                ? 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                : 'bg-white dark:bg-[#18181c] hover:bg-zinc-100 dark:hover:bg-[#222228] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200'
            }`}
            title="Cambia velocità riproduzione"
          >
            {playbackRate}x
          </button>
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            download={att.name}
            className="p-1 rounded-sm hover:opacity-80 transition-opacity"
            title="Scarica audio"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={att.url}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate
          }
        }}
        className="w-full h-8"
      />
    </div>
  )
}

function StudentMemberPicker({
  students,
  selectedIds,
  onToggleId,
  search,
  onSearchChange,
}: {
  students: EnrolledStudentChatMember[]
  selectedIds: string[]
  onToggleId: (id: string) => void
  search: string
  onSearchChange: (val: string) => void
}) {
  const q = search.trim().toLowerCase()
  const filtered = students
    .filter((st) => {
      if (!q) return true
      return (
        st.full_name.toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q) ||
        (st.code || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const aSel = selectedIds.includes(a.id) ? 0 : 1
      const bSel = selectedIds.includes(b.id) ? 0 : 1
      if (aSel !== bSel) return aSel - bSel
      return a.full_name.localeCompare(b.full_name, 'it', { sensitivity: 'base' })
    })

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        Studenti / Corsisti ({selectedIds.filter((id) => id.startsWith('student-')).length} selezionati)
      </label>
      <div className="flex items-center bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs">
        <Search className="h-3.5 w-3.5 text-zinc-400 mr-1.5 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca studente per nome, email o codice..."
          className="flex-1 bg-transparent focus:outline-none text-[#111113] dark:text-[#f4f4f5]"
        />
      </div>
      <div className="max-h-40 overflow-y-auto rounded-md border border-[#e5e3dc] dark:border-white/[0.08] p-2 space-y-1 bg-[#f7f6f3] dark:bg-[#0d0d0f]">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-zinc-400 text-center py-2">
            Nessuno studente trovato.
          </p>
        ) : (
          filtered.map((st) => {
            const isChecked = selectedIds.includes(st.id)
            return (
              <label
                key={st.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-sm text-xs cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleId(st.id)}
                    className="h-3.5 w-3.5 rounded border-[#e5e3dc] text-[#6366f1] focus:ring-[#6366f1] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[#111113] dark:text-[#f4f4f5] font-medium truncate block">
                      {st.full_name}
                    </span>
                    {st.code && (
                      <span className="text-[10px] font-mono text-zinc-400 block truncate">
                        {st.code}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="purple" className="text-[9px] px-1.5 py-0 uppercase shrink-0">
                  STUDENTE
                </Badge>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState('community-studenti')
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [userRole, setUserRole] = useState<string>('member')
  const [loading, setLoading] = useState(true)
  const [showMobileChannels, setShowMobileChannels] = useState(false)

  // Custom Channels States (Fase 3)
  const [customChannels, setCustomChannels] = useState<CustomChannelItem[]>([])
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false)
  const [newChannelMemberIds, setNewChannelMemberIds] = useState<string[]>([])
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)

  // Collaborator Invite in Create Channel Modal
  const [showInviteCollabSection, setShowInviteCollabSection] = useState(false)
  const [collabFullName, setCollabFullName] = useState('')
  const [collabEmail, setCollabEmail] = useState('')
  const [collabPassword, setCollabPassword] = useState('Collab!2026!')
  const [isInvitingCollab, setIsInvitingCollab] = useState(false)
  const [inviteCollabResult, setInviteCollabResult] = useState<{ message: string; user: any } | null>(null)
  const [collabCopied, setCollabCopied] = useState(false)

  // Manage Channel Members Modal (per canali custom/privati)
  const [showManageMembersModal, setShowManageMembersModal] = useState(false)
  const [manageMemberIds, setManageMemberIds] = useState<string[]>([])
  const [isSavingMembers, setIsSavingMembers] = useState(false)
  const [manageCollabFullName, setManageCollabFullName] = useState('')
  const [manageCollabEmail, setManageCollabEmail] = useState('')
  const [manageCollabPassword, setManageCollabPassword] = useState('Collab!2026!')
  const [isManageInviting, setIsManageInviting] = useState(false)
  const [manageCollabResult, setManageCollabResult] = useState<{ message: string; user: any } | null>(null)
  const [manageCollabCopied, setManageCollabCopied] = useState(false)

  // Studenti Iscritti & Modal Partecipanti ("Chi c'è nel canale")
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudentChatMember[]>([])
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [participantSearchQuery, setParticipantSearchQuery] = useState('')
  const [studentPickerSearch, setStudentPickerSearch] = useState('')

  // Channel Search Query (Fase 3)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Toggle Email Broadcast su #community-studenti (Fase 5 - Zero Spam)
  const [notifyStudentsEmailToggle, setNotifyStudentsEmailToggle] = useState(false)

  // Web Push States
  const [pushStatus, setPushStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'prompt'>('loading')
  const [isSendingTestPush, setIsSendingTestPush] = useState(false)
  const [testPushSent, setTestPushSent] = useState(false)

  // Attachment States
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const dragCounterRef = useRef(0)

  // Voice Messages & Live Huddle States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isSendingVoice, setIsSendingVoice] = useState(false)
  const [huddleRequest, setHuddleRequest] = useState<{ mode: 'audio' | 'video'; seq: number } | null>(null)
  const [isInHuddle, setIsInHuddle] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const cancelRecordingRef = useRef(false)

  // Phase 2 States: Badge non letti & Thread laterale & Autocomplete @menzioni
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [openSupportTicketsCount, setOpenSupportTicketsCount] = useState<number>(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [threadInputMessage, setThreadInputMessage] = useState('')
  const [isSendingThreadReply, setIsSendingThreadReply] = useState(false)

  // Autocomplete Menzioni
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionTarget, setMentionTarget] = useState<'main' | 'thread' | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const threadContainerRef = useRef<HTMLDivElement>(null)
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
    }
  }

  useEffect(() => {
    if (loading) return
    scrollToBottom('auto')
    const timer = setTimeout(() => scrollToBottom('auto'), 80)
    return () => clearTimeout(timer)
  }, [messages, activeChannel, loading])

  // Cleanup registrazione vocale al cambio canale o unmount
  useEffect(() => {
    return () => {
      cancelRecordingRef.current = true
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          // ignore
        }
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop())
        recordingStreamRef.current = null
      }
      setIsRecordingVoice(false)
      setRecordingSeconds(0)
    }
  }, [activeChannel])

  // Scroll bottom on active thread change / new reply (senza scrollare la pagina esterna)
  useEffect(() => {
    if (activeThreadId) {
      const timer = setTimeout(() => {
        if (threadContainerRef.current) {
          threadContainerRef.current.scrollTo({
            top: threadContainerRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeThreadId, messages])

  // Close active thread on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeThreadId) setActiveThreadId(null)
        if (isSearchOpen && !searchQuery) setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeThreadId, isSearchOpen, searchQuery])

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

  // Carica i canali personalizzati
  const loadCustomChannels = async () => {
    try {
      const res = await getCustomChannelsAction()
      if (res.success && res.channels) {
        setCustomChannels(res.channels)
        if (res.userRole) setUserRole(res.userRole)
        const collabIds: string[] = (res as any)?.collaboratorIds || []
        if (collabIds.length > 0) {
          setTeamMembers((prev) =>
            prev.map((m) =>
              collabIds.includes(m.id) ? { ...m, role: 'collaborator' as any } : m
            )
          )
        }
        if (Array.isArray((res as any)?.enrolledStudents)) {
          setEnrolledStudents((res as any).enrolledStudents)
        }
        return res
      }
    } catch (e) {
      console.warn('Errore caricamento custom channels:', e)
    }
    return null
  }

  // Auto-select channel from URL query parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paramChannel = new URLSearchParams(window.location.search).get('channel')
      if (paramChannel) {
        setActiveChannel(paramChannel)
      }
    }
  }, [])

  // Persistenza e azzeramento letture canale
  const markChannelAsRead = (ch: string, explicitUserId?: string) => {
    const uid = explicitUserId || currentUser?.id
    if (!uid) return
    const key = `aiutiamoci_chat_last_read_${uid}`
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '{}')
      existing[ch] = new Date().toISOString()
      localStorage.setItem(key, JSON.stringify(existing))
    } catch (e) {
      console.warn('Errore salvataggio last_read:', e)
    }
    setUnreadCounts((prev) => ({ ...prev, [ch]: 0 }))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aiutiamoci:chat-read'))
    }
  }

  // Fetch initial user, team members, and messages for channel
  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      requestNotificationPermission()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      let effectiveRole = 'member'
      let loadedProfile: any = null
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        loadedProfile = profile
        effectiveRole =
          user.user_metadata?.role === 'collaborator'
            ? 'collaborator'
            : profile?.role || user.user_metadata?.role || 'member'
        setUserRole(effectiveRole)
      }

      const customRes = await loadCustomChannels()
      const allowedChannels: CustomChannelItem[] = customRes?.channels || []
      const finalRole = customRes?.userRole || effectiveRole
      setUserRole(finalRole)

      const collabIds: string[] = (customRes as any)?.collaboratorIds || []

      if (user && loadedProfile) {
        setCurrentUser({
          ...loadedProfile,
          role: finalRole as any,
          full_name: normalizeTeamDisplayName(
            loadedProfile.full_name,
            loadedProfile.email || user.email,
            finalRole
          ),
        })
      }

      const { data: profiles } = await supabase.from('profiles').select('*')
      const initialMembers: Profile[] = profiles
        ? profiles.filter(isRealChatProfile).map((p: any) => {
            const memberRole =
              collabIds.includes(p.id) || p.role === 'collaborator'
                ? 'collaborator'
                : p.role
            return {
              ...p,
              role: memberRole as any,
              full_name: normalizeTeamDisplayName(p.full_name, p.email, memberRole),
            }
          })
        : []
      setTeamMembers(initialMembers)

      let targetChannel = activeChannel
      let hasAssignedChannel = true
      if (finalRole === 'collaborator') {
        const allowedNames = allowedChannels.map((c) => c.name)
        if (!allowedNames.includes(activeChannel) && !activeChannel.startsWith('dm:')) {
          if (allowedChannels.length > 0) {
            targetChannel = allowedChannels[0].name
            setActiveChannel(targetChannel)
          } else {
            hasAssignedChannel = false
            setMessages([])
          }
        }
      }

      if (hasAssignedChannel) {
        await fetchMessages(targetChannel)
      }

      if (user) {
        if (hasAssignedChannel) {
          markChannelAsRead(targetChannel, user.id)
        }
        try {
          let lastReadMap: Record<string, string> = {}
          try {
            lastReadMap = JSON.parse(
              localStorage.getItem(`aiutiamoci_chat_last_read_${user.id}`) || '{}'
            )
          } catch {
            lastReadMap = {}
          }
          if (hasAssignedChannel) {
            lastReadMap[targetChannel] = new Date().toISOString()
          }
          const summaryRes = await getChatUnreadSummaryAction(lastReadMap)
          if (summaryRes.success) {
            setUnreadCounts({
              ...summaryRes.byChannel,
              ...(hasAssignedChannel ? { [targetChannel]: 0 } : {}),
            })
          }
        } catch {
          // ignore
        }
      }

      setLoading(false)
    }

    initChat()
  }, [activeChannel])

  // Contatore ticket assistenza aperti (solo team interno) con Realtime + polling fallback 30s
  useEffect(() => {
    if (!currentUser || userRole === 'collaborator') {
      setOpenSupportTicketsCount(0)
      return
    }

    let cancelled = false
    const refreshTicketsCount = async () => {
      try {
        const res = await getOpenSupportTicketsCountAction()
        if (!cancelled && res.success) {
          setOpenSupportTicketsCount(res.openCount)
        }
      } catch {
        // ignore
      }
    }

    refreshTicketsCount()

    const ticketsChannel = supabase
      .channel('chat_support_tickets_count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => refreshTicketsCount()
      )
      .subscribe()

    const fallbackInterval = setInterval(refreshTicketsCount, 30000)

    return () => {
      cancelled = true
      clearInterval(fallbackInterval)
      supabase.removeChannel(ticketsChannel)
    }
  }, [currentUser?.id, userRole])

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

          if (userRole === 'collaborator') {
            const isAllowedCustom = customChannels.some((c) => c.name === newMessage.channel)
            const dmParts = newMessage.channel.startsWith('dm:')
              ? newMessage.channel.slice(3).split('_')
              : []
            const isAllowedDm = Boolean(
              currentUser &&
                dmParts.length === 2 &&
                dmParts.includes(currentUser.id) &&
                !dmParts.some((p) => p.startsWith('student-'))
            )
            if (!isAllowedCustom && !isAllowedDm) return
          }

          const senderProfile = teamMembers.find((p) => p.id === newMessage.sender_id)

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: senderProfile,
          }
          const incomingMeta = extractMessageMeta(messageWithSender)
          const isIncomingFromMe = Boolean(
            currentUser &&
              newMessage.sender_id === currentUser.id &&
              !incomingMeta.senderStudentId
          )

          if (newMessage.channel === activeChannel) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev
              return [...prev, messageWithSender]
            })
            markChannelAsRead(activeChannel)
          } else {
            if (currentUser && !isIncomingFromMe) {
              setUnreadCounts((prev) => ({
                ...prev,
                [newMessage.channel]: (prev[newMessage.channel] || 0) + 1,
              }))
            }
          }

          if (currentUser && !isIncomingFromMe) {
            sendDesktopNotification(
              `Messaggio da ${incomingMeta.senderName || senderProfile?.full_name || 'Team'} in #${newMessage.channel}`,
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
  }, [activeChannel, teamMembers, currentUser, userRole, customChannels])

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

  const normalizePastedOrDroppedFiles = (files: File[], isPaste = false): File[] => {
    return files.map((file) => {
      const isGenericName =
        !file.name ||
        /^image(\.(png|jpe?g|webp|gif))?$/i.test(file.name) ||
        file.name === 'blob'
      if (isPaste && isGenericName) {
        const rawExt = file.type?.split('/')[1]?.split('+')[0] || 'png'
        const ext = rawExt.toLowerCase() === 'jpeg' ? 'jpg' : rawExt.toLowerCase()
        return new File([file], `screenshot-${Date.now()}.${ext}`, {
          type: file.type || `image/${ext}`,
        })
      }
      return file
    })
  }

  const handlePasteFiles = (e: React.ClipboardEvent) => {
    if (!currentUser || isUploading) return

    const extracted: File[] = []
    const items = e.clipboardData?.items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) extracted.push(file)
        }
      }
    }
    if (extracted.length === 0 && e.clipboardData?.files && e.clipboardData.files.length > 0) {
      extracted.push(...Array.from(e.clipboardData.files))
    }

    if (extracted.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      const normalized = normalizePastedOrDroppedFiles(extracted, true)
      setPendingFiles((prev) => [...prev, ...normalized])
    }
  }

  const hasFilesInDrag = (e: React.DragEvent<HTMLDivElement>) =>
    Boolean(e.dataTransfer?.types?.includes('Files'))

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (!isDraggingOver) {
      setIsDraggingOver(true)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    if (!isDraggingOver) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDraggingOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e) && !(e.dataTransfer?.files && e.dataTransfer.files.length > 0)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDraggingOver(false)
    if (!currentUser || isUploading) return
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const normalized = normalizePastedOrDroppedFiles(Array.from(e.dataTransfer.files), false)
      setPendingFiles((prev) => [...prev, ...normalized])
      mainInputRef.current?.focus()
    }
  }

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(msgId)
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === msgId ? null : prev))
      }, 2000)
    } catch (err) {
      console.error('Errore copia messaggio:', err)
    }
  }

  const startVoiceRecording = async () => {
    if (!currentUser || isUploading || isSendingVoice || isRecordingVoice) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Registrazione vocale non supportata su questo browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream
      recordingChunksRef.current = []
      cancelRecordingRef.current = false

      const candidateMimes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ]
      const supportedMime = candidateMimes.find((m) => MediaRecorder.isTypeSupported(m)) || ''
      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder
      let secondsCounter = 0

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordingChunksRef.current.push(ev.data)
        }
      }

      recorder.onstop = async () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((t) => t.stop())
          recordingStreamRef.current = null
        }

        const wasCancelled = cancelRecordingRef.current
        const chunks = [...recordingChunksRef.current]
        const mimeType = recorder.mimeType || supportedMime || 'audio/webm'
        const durationLabel = formatVoiceDuration(secondsCounter)

        recordingChunksRef.current = []
        mediaRecorderRef.current = null
        setIsRecordingVoice(false)
        setRecordingSeconds(0)

        if (wasCancelled || chunks.length === 0) return

        const ext = mimeType.includes('mp4')
          ? 'm4a'
          : mimeType.includes('ogg')
          ? 'ogg'
          : 'webm'

        const voiceBlob = new Blob(chunks, { type: mimeType })
        const voiceFile = new File([voiceBlob], `vocale-${Date.now()}.${ext}`, {
          type: mimeType,
        })

        setIsSendingVoice(true)
        try {
          const uploaded = await uploadAttachments([voiceFile])
          if (uploaded.length === 0) {
            alert('Errore durante il caricamento del messaggio vocale.')
            return
          }

          const { error } = await (supabase as any).from('messages').insert({
            channel: activeChannel,
            content: '',
            attachments: uploaded,
            sender_id: currentUser.id,
            is_system: false,
          })

          if (error) {
            console.error('Error sending voice message:', error)
          } else {
            const notifyOptions: any = {}
            if (isDirectMessage && dmPartnerId) {
              notifyOptions.isDirectMessage = true
              notifyOptions.recipientUserIds = [dmPartnerId]
            } else if (isPrivateChannel) {
              notifyOptions.isPrivateChannel = true
              notifyOptions.recipientUserIds = privateMemberIds
            }

            notifyChatMessageAction(
              activeChannel,
              `🎙️ Messaggio vocale (${durationLabel})`,
              currentUser.full_name,
              notifyOptions
            ).catch((err) => console.error('Voice notify error:', err))
          }
        } finally {
          setIsSendingVoice(false)
        }
      }

      recorder.start(250)
      setIsRecordingVoice(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => {
        secondsCounter += 1
        setRecordingSeconds(secondsCounter)
      }, 1000)
    } catch (err: any) {
      console.error('Errore avvio registrazione vocale:', err)
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop())
        recordingStreamRef.current = null
      }
      alert(
        err?.name === 'NotAllowedError'
          ? 'Permesso microfono negato. Abilitalo nelle impostazioni del browser.'
          : 'Impossibile avviare la registrazione vocale.'
      )
    }
  }

  const stopVoiceRecording = (shouldSend: boolean) => {
    cancelRecordingRef.current = !shouldSend
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop())
        recordingStreamRef.current = null
      }
      setIsRecordingVoice(false)
      setRecordingSeconds(0)
    }
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

  // Risoluzione partner per canali DM (cerca sia nel team che negli studenti iscritti)
  const isDirectMessage = activeChannel.startsWith('dm:')
  const dmPartnerId = isDirectMessage
    ? activeChannel.replace('dm:', '').split('_').find((id) => id !== currentUser?.id)
    : null
  const dmPartner = dmPartnerId
    ? teamMembers.find((m) => m.id === dmPartnerId) ||
      (enrolledStudents.find((s) => s.id === dmPartnerId) as any) ||
      null
    : null

  // Apertura rapida DM 1-a-1 con qualsiasi iscritto o membro del team
  const openDirectMessageWith = (targetId: string) => {
    if (!currentUser || !targetId || targetId === currentUser.id) return
    const dmId = `dm:${[currentUser.id, targetId].sort().join('_')}`
    setActiveChannel(dmId)
    setShowMobileChannels(false)
    setShowParticipantsModal(false)
    setShowManageMembersModal(false)
    setActiveThreadId(null)
    markChannelAsRead(dmId)
  }

  // Risoluzione canale attivo e configurazione privacy
  const currentCustomChannel = customChannels.find((c) => c.name === activeChannel)
  const isPrivateChannel = Boolean(currentCustomChannel?.isPrivate)
  const privateMemberIds = currentCustomChannel?.memberIds || []
  const hasStudentParticipants =
    userRole !== 'collaborator' &&
    (activeChannel === 'community-studenti' ||
      privateMemberIds.some((id) => id.startsWith('student-')))

  // Calcolo Partecipanti Canale ("Chi c'è dentro")
  const currentChannelParticipants: ChannelParticipant[] = useMemo(() => {
    if (isDirectMessage) {
      const list: ChannelParticipant[] = []
      if (currentUser) {
        list.push({
          id: currentUser.id,
          full_name: currentUser.full_name,
          email: currentUser.email,
          role: userRole,
          is_active: true,
        })
      }
      if (dmPartner) {
        list.push({
          id: dmPartner.id,
          full_name: dmPartner.full_name,
          email: dmPartner.email,
          role: dmPartner.role,
          is_active: dmPartner.is_active,
          code: (dmPartner as any).code,
        })
      }
      return list
    }

    if (activeChannel === 'community-studenti') {
      // Membri interni del team (esclusi collaborator) + tutti gli studenti iscritti
      const teamList: ChannelParticipant[] = teamMembers
        .filter((m) => m.role !== 'collaborator')
        .map((m) => ({
          id: m.id,
          full_name: m.full_name,
          email: m.email,
          role: m.role || 'member',
          is_active: m.is_active,
        }))

      const studentList: ChannelParticipant[] = enrolledStudents.map((s) => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        role: 'student',
        is_active: s.is_active,
        code: s.code,
      }))

      const map = new Map<string, ChannelParticipant>()
      for (const p of [...teamList, ...studentList]) {
        map.set(p.id, p)
      }
      return Array.from(map.values())
    }

    if (isPrivateChannel) {
      const teamPart: ChannelParticipant[] = teamMembers
        .filter(
          (m) =>
            privateMemberIds.includes(m.id) ||
            m.id === currentCustomChannel?.createdBy
        )
        .map((m) => ({
          id: m.id,
          full_name: m.full_name,
          email: m.email,
          role: m.role || 'member',
          is_active: m.is_active,
        }))

      const studentPart: ChannelParticipant[] =
        userRole !== 'collaborator'
          ? enrolledStudents
              .filter((s) => privateMemberIds.includes(s.id))
              .map((s) => ({
                id: s.id,
                full_name: s.full_name,
                email: s.email,
                role: 'student',
                is_active: s.is_active,
                code: s.code,
              }))
          : []

      const map = new Map<string, ChannelParticipant>()
      for (const p of [...teamPart, ...studentPart]) {
        map.set(p.id, p)
      }
      return Array.from(map.values())
    }

    // Canale pubblico custom: tutti i membri interni del team
    return teamMembers
      .filter((m) => m.role !== 'collaborator')
      .map((m) => ({
        id: m.id,
        full_name: m.full_name,
        email: m.email,
        role: m.role || 'member',
        is_active: m.is_active,
      }))
  }, [
    isDirectMessage,
    currentUser,
    userRole,
    dmPartner,
    activeChannel,
    teamMembers,
    enrolledStudents,
    isPrivateChannel,
    privateMemberIds,
    currentCustomChannel,
  ])

  // Suggerimenti comandi slash filtrati
  const matchingSlashCommands = AVAILABLE_SLASH_COMMANDS.filter((cmd) => {
    if (cmd.requiresTeam && userRole === 'collaborator') return false
    return cmd.command.startsWith(inputMessage.toLowerCase().trim())
  })

  const handleSelectSlashCommand = (cmdStr: string) => {
    setInputMessage(`${cmdStr} `)
    setMentionQuery(null)
    setMentionTarget(null)
    if (mainInputRef.current) {
      mainInputRef.current.focus()
    }
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
    const shouldNotifyByEmail =
      hasStudentParticipants &&
      (notifyStudentsEmailToggle || /@tutti\b/i.test(messageContent))
    setInputMessage('')
    setPendingFiles([])
    setMentionQuery(null)
    if (notifyStudentsEmailToggle) {
      setNotifyStudentsEmailToggle(false)
    }

    // Intercettazione Slash Commands (/task, /lead, /ai)
    if (
      pendingFiles.length === 0 &&
      (messageContent.startsWith('/task ') ||
        messageContent.startsWith('/lead ') ||
        messageContent.startsWith('/ai ') ||
        messageContent === '/task' ||
        messageContent === '/lead' ||
        messageContent === '/ai')
    ) {
      const cmdRes = await executeSlashCommandAction({
        channel: activeChannel,
        commandText: messageContent,
      })
      setIsUploading(false)
      if (!cmdRes.success) {
        alert(cmdRes.error || 'Errore esecuzione comando slash')
      } else {
        await fetchMessages(activeChannel)
        if (!isDirectMessage && !isPrivateChannel) {
          notifyChatMessageAction(
            activeChannel,
            messageContent,
            currentUser.full_name
          ).catch((err) => console.error('Slash notify push error:', err))
        }
      }
      return
    }

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

      // Configura le opzioni di notifica per DM o canale privato
      const notifyOptions: any = {
        mentionedNames: mentions,
      }

      if (isDirectMessage && dmPartnerId) {
        notifyOptions.isDirectMessage = true
        notifyOptions.recipientUserIds = [dmPartnerId]
      } else if (isPrivateChannel) {
        notifyOptions.isPrivateChannel = true
        notifyOptions.recipientUserIds = privateMemberIds
        if (shouldNotifyByEmail) {
          notifyOptions.notifyStudentsByEmail = true
        }
      } else if (shouldNotifyByEmail) {
        notifyOptions.notifyStudentsByEmail = true
      }

      notifyChatMessageAction(activeChannel, notifyText, currentUser.full_name, notifyOptions).catch((err) =>
        console.error('Chat push notify error:', err)
      )
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
      const notifyOptions: any = {
        isThreadReply: true,
        mentionedNames: mentions,
      }

      if (isDirectMessage && dmPartnerId) {
        notifyOptions.isDirectMessage = true
        notifyOptions.recipientUserIds = [dmPartnerId]
      } else if (isPrivateChannel) {
        notifyOptions.isPrivateChannel = true
        notifyOptions.recipientUserIds = privateMemberIds
        if (hasStudentParticipants && /@tutti\b/i.test(replyText)) {
          notifyOptions.notifyStudentsByEmail = true
        }
      } else if (hasStudentParticipants && /@tutti\b/i.test(replyText)) {
        notifyOptions.notifyStudentsByEmail = true
      }

      notifyChatMessageAction(activeChannel, replyText, currentUser.full_name, notifyOptions).catch((err) =>
        console.error('Thread notify error:', err)
      )
    }
  }

  // Gestione creazione nuovo canale custom
  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim() || isCreatingChannel) return

    setIsCreatingChannel(true)
    const res = await createCustomChannelAction({
      name: newChannelName,
      desc: newChannelDesc,
      isPrivate: newChannelIsPrivate,
      memberIds: newChannelMemberIds,
    })

    setIsCreatingChannel(false)

    if (res.success && res.channel) {
      await loadCustomChannels()
      setActiveChannel(res.channel.name)
      setShowCreateChannelModal(false)
      setStudentPickerSearch('')
      setNewChannelName('')
      setNewChannelDesc('')
      setNewChannelIsPrivate(false)
      setNewChannelMemberIds([])
    } else {
      alert(res.error || 'Errore creazione canale')
    }
  }

  // Eliminazione canale custom
  const handleDeleteChannel = async (channelName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il canale "#${channelName}"?`)) return
    const res = await deleteCustomChannelAction(channelName)
    if (res.success) {
      await loadCustomChannels()
      if (activeChannel === channelName) {
        setActiveChannel('community-studenti')
      }
    } else {
      alert(res.error || 'Impossibile eliminare il canale')
    }
  }

  // Invito rapido collaboratore dal modale di creazione canale
  const handleInviteCollabInModal = async () => {
    if (!collabEmail.trim() || !collabFullName.trim()) {
      alert('Inserisci nome completo ed email del collaboratore')
      return
    }
    setIsInvitingCollab(true)
    try {
      const res = await inviteCollaboratorAction({
        email: collabEmail,
        fullName: collabFullName,
        tempPassword: collabPassword,
      })
      if (res.success && res.user) {
        setInviteCollabResult({
          message: res.inviteMessage || '',
          user: res.user,
        })
        // Aggiungi al team locale per visualizzarlo subito
        setTeamMembers((prev) => {
          if (prev.some((m) => m.id === res.user.id)) return prev
          return [
            ...prev,
            {
              id: res.user.id,
              full_name: res.user.fullName,
              email: res.user.email,
              role: 'collaborator' as any,
              is_active: true,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]
        })
        // Spunta automaticamente il nuovo collaboratore tra i membri del canale
        setNewChannelMemberIds((prev) => Array.from(new Set([...prev, res.user.id])))
      } else {
        alert(res.error || 'Errore durante la creazione del collaboratore')
      }
    } catch (err: any) {
      alert(err.message || 'Errore imprevisto')
    } finally {
      setIsInvitingCollab(false)
    }
  }

  // Salvataggio membri canale da modale Gestione Membri
  const handleSaveManageMembers = async () => {
    setIsSavingMembers(true)
    try {
      const res = await updateChannelMembersAction({
        channelName: activeChannel,
        memberIds: manageMemberIds,
      })
      if (res.success) {
        await loadCustomChannels()
        setStudentPickerSearch('')
        setShowManageMembersModal(false)
      } else {
        alert(res.error || 'Errore salvataggio membri')
      }
    } catch (err: any) {
      alert(err.message || 'Errore imprevisto')
    } finally {
      setIsSavingMembers(false)
    }
  }

  // Invito rapido collaboratore dal modale Gestione Membri canale
  const handleInviteCollabInManage = async () => {
    if (!manageCollabEmail.trim() || !manageCollabFullName.trim()) {
      alert('Inserisci nome completo ed email del collaboratore')
      return
    }
    setIsManageInviting(true)
    try {
      const res = await inviteCollaboratorAction({
        email: manageCollabEmail,
        fullName: manageCollabFullName,
        tempPassword: manageCollabPassword,
        channelName: activeChannel,
      })
      if (res.success && res.user) {
        setManageCollabResult({
          message: res.inviteMessage || '',
          user: res.user,
        })
        // Aggiungi a team locale e seleziona tra i membri
        setTeamMembers((prev) => {
          if (prev.some((m) => m.id === res.user.id)) return prev
          return [
            ...prev,
            {
              id: res.user.id,
              full_name: res.user.fullName,
              email: res.user.email,
              role: 'collaborator' as any,
              is_active: true,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]
        })
        setManageMemberIds((prev) => Array.from(new Set([...prev, res.user.id])))
        await loadCustomChannels()
      } else {
        alert(res.error || 'Errore durante la creazione del collaboratore')
      }
    } catch (err: any) {
      alert(err.message || 'Errore imprevisto')
    } finally {
      setIsManageInviting(false)
    }
  }

  // Gestione input menzioni
  const handleInputChangeWithMentions = (val: string, target: 'main' | 'thread') => {
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

  // Lista canali combinata in base al ruolo (Guest/Collaborator vs Team)
  const displayChannels: DisplayChannel[] =
    userRole === 'collaborator'
      ? customChannels.map((c) => ({
          id: c.id,
          name: c.name,
          desc: c.desc,
          icon: Lock,
          isPrivate: true,
          memberIds: c.memberIds,
          createdBy: c.createdBy,
          isCustom: true,
        }))
      : [
          ...SYSTEM_CHANNELS,
          ...customChannels.map((c) => ({
            id: c.id,
            name: c.name,
            desc: c.desc,
            icon: c.isPrivate ? Lock : Hash,
            isPrivate: c.isPrivate,
            memberIds: c.memberIds,
            createdBy: c.createdBy,
            isCustom: true,
          })),
        ]

  // Calcolo messaggi principali e raggruppamento thread
  const mainMessages = messages.filter((m) => !extractMessageMeta(m).parentId)

  // Filtraggio messaggi per ricerca interna al canale
  const filteredMainMessages = searchQuery.trim()
    ? mainMessages.filter((m) => {
        const q = searchQuery.toLowerCase()
        const textMatch = m.content?.toLowerCase().includes(q)
        const fileMatch = (m.attachments as any[])?.some(
          (a) => a && a.name && a.name.toLowerCase().includes(q)
        )
        return textMatch || fileMatch
      })
    : mainMessages

  const repliesByParent = messages.reduce<Record<string, MessageWithSender[]>>((acc, m) => {
    const pId = extractMessageMeta(m).parentId
    if (pId) {
      if (!acc[pId]) acc[pId] = []
      acc[pId].push(m)
    }
    return acc
  }, {})

  const activeThreadParent = activeThreadId ? messages.find((m) => m.id === activeThreadId) || null : null
  const activeThreadReplies = activeThreadId ? repliesByParent[activeThreadId] || [] : []

  const currentChannelObj =
    displayChannels.find((c) => c.name === activeChannel) || {
      id: 'custom',
      name: activeChannel,
      desc: isDirectMessage ? 'Conversazione diretta riservata' : 'Canale tematico',
      icon: isDirectMessage ? MessageSquare : isPrivateChannel ? Lock : Hash,
      isPrivate: isPrivateChannel,
    }

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
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-white dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        className="hidden"
      />

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative w-full h-full">
        {/* Mobile Drawer Backdrop */}
        {showMobileChannels && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setShowMobileChannels(false)}
          />
        )}

        {/* Left: Channels & DM List */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-72 h-[100dvh] bg-[#fafaf8] dark:bg-[#111114] p-3.5 flex flex-col shadow-2xl transition-transform duration-200 ease-in-out
            md:static md:z-auto md:w-[240px] lg:w-[250px] md:h-full md:shadow-none md:translate-x-0 md:flex md:shrink-0 md:border-r border-[#e5e3dc] dark:border-white/[0.08] overflow-hidden min-h-0
            ${showMobileChannels ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Accesso rapido Inbox Assistenza (solo team interno) */}
          {userRole !== 'collaborator' && (
            <div className="shrink-0 mb-3">
              <Link
                href="/assistenza"
                onClick={() => setShowMobileChannels(false)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <LifeBuoy className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                  <span className="truncate">Inbox Assistenza</span>
                </span>
                {openSupportTicketsCount > 0 ? (
                  <span
                    className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-rose-600 text-white whitespace-nowrap shrink-0"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {openSupportTicketsCount} {openSupportTicketsCount === 1 ? 'APERTO' : 'APERTI'}
                  </span>
                ) : (
                  <span
                    className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 whitespace-nowrap shrink-0"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    Ticket
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Canali Tematici */}
          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between px-2">
              <div
                className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                Canali {userRole === 'collaborator' ? 'Assegnati' : 'Tematici'}
              </div>
              <div className="flex items-center gap-1">
                {userRole !== 'collaborator' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentPickerSearch('')
                      setShowCreateChannelModal(true)
                    }}
                    className="p-1 rounded-sm text-zinc-400 hover:text-[#6366f1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Crea nuovo canale"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowMobileChannels(false)}
                  className="md:hidden p-1 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  aria-label="Chiudi menu canali"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-0.5 max-h-[40vh] overflow-y-auto">
              {displayChannels.map((ch) => {
                const isActive = activeChannel === ch.name
                const Icon = ch.icon
                const unread = unreadCounts[ch.name] || 0
                const canDelete =
                  ch.isCustom &&
                  (userRole === 'dev' || userRole === 'admin' || ch.createdBy === currentUser?.id)

                return (
                  <div
                    key={ch.id}
                    className={`group/ch flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors border-l-2 ${
                      isActive
                        ? 'bg-[#6366f1]/12 text-[#111113] dark:text-[#f4f4f5] border-l-[#6366f1] font-semibold'
                        : 'border-l-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#111113] dark:hover:text-[#f4f4f5] font-medium'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChannel(ch.name)
                        setShowMobileChannels(false)
                        setActiveThreadId(null)
                        markChannelAsRead(ch.name)
                      }}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-[#6366f1]' : 'text-zinc-400'
                        }`}
                      />
                      <span className="truncate">{ch.name}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {unread > 0 && !isActive && (
                        <span
                          className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-rose-600 text-white"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {unread}
                        </span>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChannel(ch.name)
                          }}
                          className="opacity-0 group-hover/ch:opacity-100 p-1 rounded-sm text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
                          title="Elimina canale"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {displayChannels.length === 0 && (
                <div className="px-2 py-2 text-[11px] text-zinc-400 text-center">
                  Nessun canale assegnato.
                </div>
              )}
            </div>
          </div>

          {/* Messaggi Diretti (DM 1-a-1) */}
          <div className="mt-4 pt-4 border-t border-[#e5e3dc] dark:border-white/[0.08] flex-1 min-h-0 overflow-y-auto space-y-2">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-2 flex items-center justify-between"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              <span>Messaggi Diretti</span>
              <Users className="h-3 w-3" />
            </div>
            <div className="space-y-0.5 text-xs">
              {(() => {
                const sharedCollabMemberIds = new Set(
                  customChannels.flatMap((c) => c.memberIds || [])
                )
                const visibleDmMembers =
                  userRole === 'collaborator'
                    ? teamMembers.filter(
                        (m) =>
                          m.id === currentUser?.id ||
                          m.role !== 'collaborator' ||
                          sharedCollabMemberIds.has(m.id)
                      )
                    : teamMembers

                return visibleDmMembers.map((member) => {
                  const isMe = member.id === currentUser?.id
                  const dmChannelId = currentUser
                    ? `dm:${[currentUser.id, member.id].sort().join('_')}`
                    : ''
                  const isActive = activeChannel === dmChannelId
                  const unread = unreadCounts[dmChannelId] || 0

                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={isMe}
                      onClick={() => {
                        if (!isMe && dmChannelId) {
                          setActiveChannel(dmChannelId)
                          setShowMobileChannels(false)
                          setActiveThreadId(null)
                          markChannelAsRead(dmChannelId)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm transition-colors text-left border-l-2 ${
                        isActive
                          ? 'bg-[#6366f1]/12 text-[#111113] dark:text-[#f4f4f5] border-l-[#6366f1] font-semibold'
                          : isMe
                            ? 'opacity-55 border-l-transparent cursor-default'
                            : 'border-l-transparent text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            member.is_active ? 'bg-[#10b981]' : 'bg-zinc-300 dark:bg-zinc-600'
                          }`}
                        />
                        <span className="truncate max-w-[115px]">
                          {member.full_name} {isMe ? '(Tu)' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {unread > 0 && !isActive && (
                          <span
                            className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-rose-600 text-white"
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                          >
                            {unread}
                          </span>
                        )}
                        <span
                          className="text-[9px] uppercase text-zinc-400 dark:text-zinc-500"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {member.role}
                        </span>
                      </div>
                    </button>
                  )
                })
              })()}

              {userRole !== 'collaborator' &&
                currentUser &&
                enrolledStudents
                  .filter((st) => {
                    const dmId = `dm:${[currentUser.id, st.id].sort().join('_')}`
                    return (unreadCounts[dmId] || 0) > 0 || activeChannel === dmId
                  })
                  .map((st) => {
                    const dmChannelId = `dm:${[currentUser.id, st.id].sort().join('_')}`
                    const isActive = activeChannel === dmChannelId
                    const unread = unreadCounts[dmChannelId] || 0

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setActiveChannel(dmChannelId)
                          setShowMobileChannels(false)
                          setActiveThreadId(null)
                          markChannelAsRead(dmChannelId)
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm transition-colors text-left border-l-2 cursor-pointer ${
                          isActive
                            ? 'bg-[#6366f1]/12 text-[#111113] dark:text-[#f4f4f5] border-l-[#6366f1] font-semibold'
                            : 'border-l-transparent text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              st.is_active ? 'bg-[#10b981]' : 'bg-zinc-300 dark:bg-zinc-600'
                            }`}
                          />
                          <span className="truncate max-w-[115px]">{st.full_name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {unread > 0 && !isActive && (
                            <span
                              className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-rose-600 text-white"
                              style={{ fontFamily: 'var(--font-mono), monospace' }}
                            >
                              {unread}
                            </span>
                          )}
                          <span
                            className="text-[9px] uppercase text-[#6366f1]"
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                          >
                            STUD
                          </span>
                        </div>
                      </button>
                    )
                  })}
            </div>
          </div>
        </div>

        {/* Center: Main Message Stream */}
        <div
          className="flex-1 min-w-0 h-full flex flex-col bg-white dark:bg-[#0d0d0f] relative overflow-hidden"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePasteFiles}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 z-30 bg-[#6366f1]/10 backdrop-blur-xs border-2 border-dashed border-[#6366f1] flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <div className="p-4 rounded-lg bg-white dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.1] shadow-xl flex flex-col items-center gap-2 max-w-sm">
                <UploadCloud className="h-9 w-9 text-[#6366f1]" />
                <p className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5]">
                  Rilascia per allegare
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isDirectMessage
                    ? `Rilascia qui immagini, screenshot o documenti per allegarli in DM con ${dmPartner?.full_name || 'questo membro'}`
                    : `Rilascia qui immagini, screenshot o documenti per allegarli in #${activeChannel}`}
                </p>
              </div>
            </div>
          )}

          {/* Channel Header */}
          <div className="min-h-[52px] px-4 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 bg-white dark:bg-[#0d0d0f] shrink-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMobileChannels(true)}
                className="relative md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] shrink-0"
                title="Scegli canale"
              >
                <Menu className="h-4 w-4" />
                {((openSupportTicketsCount > 0 && userRole !== 'collaborator') ||
                  Object.entries(unreadCounts).some(([ch, cnt]) => ch !== activeChannel && cnt > 0)) && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-[#0d0d0f]" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="text-sm sm:text-[15px] font-bold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5 min-w-0 truncate"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    {isDirectMessage ? (
                      <>
                        <MessageCircle className="h-4 w-4 text-[#10b981] shrink-0" />
                        <span className="truncate">
                          DM: {dmPartner?.full_name || 'Conversazione Diretta'}
                        </span>
                      </>
                    ) : isPrivateChannel ? (
                      <>
                        <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="truncate">{currentChannelObj.name}</span>
                      </>
                    ) : (
                      <>
                        <Hash className="h-4 w-4 text-[#6366f1] shrink-0" />
                        <span className="truncate">{currentChannelObj.name}</span>
                      </>
                    )}
                  </h2>

                  {!isDirectMessage && (
                    <button
                      type="button"
                      onClick={() => setShowParticipantsModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#6366f1] bg-[#f7f6f3] dark:bg-[#141417] px-2 py-0.5 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08] cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                      title="Visualizza chi è presente in questo canale e scrivi in privato"
                    >
                      <Users className="h-3 w-3 shrink-0 text-[#6366f1]" />
                      <span>{currentChannelParticipants.length} presenti</span>
                      {currentChannelParticipants.length > 0 && (
                        <span className="hidden lg:inline text-zinc-400 font-normal">
                          (
                          {currentChannelParticipants
                            .slice(0, 3)
                            .map((p: ChannelParticipant) => p.full_name.split(' ')[0])
                            .join(', ')}
                          {currentChannelParticipants.length > 3 ? '...' : ''}
                          )
                        </span>
                      )}
                    </button>
                  )}
                </div>
                <p className="hidden sm:block text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                  {isDirectMessage
                    ? 'Messaggio Diretto Privato 1-a-1 • Notifiche personali'
                    : currentChannelObj.desc}
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-1.5 flex-wrap xl:justify-end shrink-0">
              <button
                type="button"
                disabled={!currentUser}
                onClick={() => setHuddleRequest({ mode: 'audio', seq: Date.now() })}
                className={`h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isInHuddle
                    ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                    : 'border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-zinc-700 dark:text-zinc-300 hover:border-[#6366f1]'
                }`}
                title="Avvia o unisciti alla stanza vocale live"
              >
                <Headphones className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Vocale</span>
              </button>

              <button
                type="button"
                disabled={!currentUser}
                onClick={() => setHuddleRequest({ mode: 'video', seq: Date.now() })}
                className={`h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isInHuddle
                    ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                    : 'border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-zinc-700 dark:text-zinc-300 hover:border-[#6366f1]'
                }`}
                title="Avvia o unisciti alla videochiamata / condivisione schermo"
              >
                <Video className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Video</span>
              </button>

              {(isPrivateChannel || currentChannelObj.isCustom) && userRole !== 'collaborator' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentChannelItem = customChannels.find((c) => c.name === activeChannel)
                    setManageMemberIds(currentChannelItem?.memberIds || [])
                    setManageCollabResult(null)
                    setStudentPickerSearch('')
                    setShowManageMembersModal(true)
                  }}
                  className="h-8 px-2.5 rounded-md border border-amber-500/30 text-amber-600 dark:text-amber-300 bg-amber-500/10 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  title="Gestisci i membri autorizzati di questo canale privato"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Gestisci</span>
                </button>
              )}

              {/* Barra di Ricerca Interna */}
              <div className="relative flex items-center">
                {isSearchOpen ? (
                  <div className="flex items-center bg-[#f7f6f3] dark:bg-[#141417] rounded-md px-2 h-8 border border-[#e5e3dc] dark:border-white/[0.08]">
                    <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0 mr-1.5" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca nei messaggi..."
                      className="bg-transparent text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none w-32 sm:w-44"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      }}
                      className="p-0.5 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-zinc-500 hover:text-[#6366f1] transition-colors cursor-pointer"
                    title="Cerca messaggi nel canale"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Bottone Notifiche Push */}
              {pushStatus === 'subscribed' ? (
                <button
                  type="button"
                  disabled={isSendingTestPush}
                  onClick={handleSendTestPush}
                  className="h-8 px-2.5 rounded-md border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Notifiche Web Push attive. Clicca per inviare una notifica test su questo dispositivo."
                >
                  {isSendingTestPush ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : testPushSent ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <BellRing className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {testPushSent ? 'Inviata' : isSendingTestPush ? 'Invio...' : 'Push OK'}
                  </span>
                </button>
              ) : pushStatus === 'prompt' ? (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="h-8 px-2.5 rounded-md border border-[#6366f1]/30 text-[#6366f1] bg-[#6366f1]/10 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Attiva le notifiche Web Push"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Attiva Push</span>
                </button>
              ) : pushStatus === 'denied' ? (
                <span
                  className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 px-2 h-8 rounded-md bg-amber-500/10 border border-amber-500/25"
                  title="Permessi notifiche bloccati nel browser"
                >
                  <Bell className="h-3 w-3" />
                  <span className="hidden sm:inline">Push bloccate</span>
                </span>
              ) : null}

              <span
                className="h-8 px-2.5 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 inline-flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                <span className="hidden sm:inline">REALTIME</span>
              </span>
            </div>
          </div>

          {/* Stanza Live Voce / Video / Schermo (WebRTC P2P) */}
          {currentUser && (
            <ChatHuddleBar
              channelName={activeChannel}
              currentUser={{
                id: currentUser.id,
                full_name: currentUser.full_name,
                avatar_url: currentUser.avatar_url,
              }}
              huddleRequest={huddleRequest}
              onJoinedChange={setIsInHuddle}
              onNotifyStart={(mode) => {
                const notifyOptions: any = {}
                if (isDirectMessage && dmPartnerId) {
                  notifyOptions.isDirectMessage = true
                  notifyOptions.recipientUserIds = [dmPartnerId]
                } else if (isPrivateChannel) {
                  notifyOptions.isPrivateChannel = true
                  notifyOptions.recipientUserIds = privateMemberIds
                } else if (activeChannel === 'community-studenti') {
                  notifyOptions.recipientUserIds = teamMembers
                    .filter((m) => m.role !== 'collaborator' && m.id !== currentUser.id)
                    .map((m) => m.id)
                }
                const label =
                  mode === 'video'
                    ? 'Ha avviato una videochiamata live nella chat'
                    : 'Ha avviato una stanza vocale live nella chat'
                notifyChatMessageAction(activeChannel, label, currentUser.full_name, notifyOptions).catch(
                  (err) => console.error('Huddle notify error:', err)
                )
              }}
            />
          )}

          {/* Banner Risultati Ricerca attiva */}
          {searchQuery.trim() && (
            <div className="px-4 py-2 bg-[#f7f6f3] dark:bg-[#141417] border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#111113] dark:text-[#f4f4f5]">
              <span>
                Filtro ricerca: <strong>&ldquo;{searchQuery}&rdquo;</strong> ({filteredMainMessages.length} risultati)
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[#6366f1] hover:underline cursor-pointer"
              >
                Azzera
              </button>
            </div>
          )}

          {/* Messages List */}
          <div
            ref={chatContainerRef}
            className="p-3 sm:p-5 space-y-3.5 flex-1 overflow-y-auto min-h-0 overscroll-contain bg-white dark:bg-[#0d0d0f]"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-[#6366f1] animate-spin" />
              </div>
            ) : filteredMainMessages.length > 0 ? (
              filteredMainMessages.map((msg) => {
                const msgMeta = extractMessageMeta(msg)
                const isMe = msg.sender_id === currentUser?.id && !msgMeta.senderStudentId
                const { reactions, files } = msgMeta
                const replies = repliesByParent[msg.id] || []
                const isThreadOpen = activeThreadId === msg.id

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start gap-2.5 sm:gap-3 ${isMe ? 'flex-row-reverse' : ''} ${
                      isThreadOpen ? 'bg-[#f7f6f3] dark:bg-[#141417] p-2 rounded-md -mx-2 transition-colors' : ''
                    }`}
                  >
                    <Avatar
                      fallback={msgMeta.senderName || msg.sender?.full_name || '?'}
                      src={msgMeta.senderStudentId ? undefined : msg.sender?.avatar_url || undefined}
                      className="h-7 w-7 sm:h-8 sm:w-8 bg-[#f7f6f3] dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5] font-semibold text-[10px] sm:text-xs shrink-0 mt-1 border border-[#e5e3dc] dark:border-white/[0.08]"
                    />
                    <div className={`flex flex-col flex-1 space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-1.5 sm:gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {isMe ? (
                          <span className="text-[11px] sm:text-xs font-semibold text-[#111113] dark:text-[#f4f4f5]">
                            Tu
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openDirectMessageWith(
                                extractMessageMeta(msg).senderStudentId || msg.sender_id
                              )
                            }
                            className="text-[11px] sm:text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] hover:text-[#6366f1] hover:underline transition-colors text-left flex items-center gap-1 group/author cursor-pointer"
                            title={`Clicca per scrivere in privato a ${
                              extractMessageMeta(msg).senderName ||
                              msg.sender?.full_name ||
                              'questo utente'
                            }`}
                          >
                            <span>
                              {extractMessageMeta(msg).senderName ||
                                msg.sender?.full_name ||
                                'Utente Sconosciuto'}
                            </span>
                            <MessageCircle className="h-2.5 w-2.5 opacity-0 group-hover/author:opacity-100 text-[#6366f1] transition-opacity" />
                          </button>
                        )}
                        <span
                          className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {formatDate(msg.created_at)}
                        </span>
                      </div>

                      {/* Text Bubble */}
                      {msg.content && (
                        <div
                          className={`text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg leading-relaxed max-w-[88%] sm:max-w-[85%] break-words whitespace-pre-wrap select-text ${
                            isMe
                              ? 'bg-[#6366f1] text-white rounded-tr-xs'
                              : 'bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08] rounded-tl-xs'
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
                            const isAudio =
                              att.type?.startsWith('audio/') ||
                              (!att.type?.startsWith('video/') &&
                                /\.(webm|ogg|mp3|m4a|wav|aac)$/i.test(att.name || ''))
                            return (
                              <div key={attIdx} className="overflow-hidden rounded-lg">
                                {isImg ? (
                                  <div
                                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#e5e3dc] dark:border-white/[0.08] bg-black/5 dark:bg-black/30"
                                    onClick={() => setPreviewModalUrl(att.url)}
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name || 'Immagine allegata'}
                                      className="max-h-64 max-w-full rounded-lg object-cover group-hover:scale-102 transition-transform duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
                                      <Eye className="h-4 w-4" />
                                      <span>Ingrandisci</span>
                                    </div>
                                  </div>
                                ) : isAudio ? (
                                  <VoiceAudioPlayer att={att} isMe={isMe} />
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={att.name}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                                      isMe
                                        ? 'bg-[#6366f1] hover:bg-[#4f46e5] border-[#6366f1] text-white'
                                        : 'bg-[#f7f6f3] dark:bg-[#141417] hover:bg-zinc-100 dark:hover:bg-[#1b1b20] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`p-2 rounded-md shrink-0 ${
                                          isMe
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[#6366f1]/10 text-[#6366f1]'
                                        }`}
                                      >
                                        <FileText className="h-4 w-4" />
                                      </div>
                                      <div className="flex flex-col min-w-0 text-left">
                                        <span className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[260px]">
                                          {att.name}
                                        </span>
                                        <span className="text-[10px] opacity-75">
                                          {formatBytes(att.size || 0)}
                                        </span>
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
                      <div
                        className={`flex flex-wrap items-center gap-1.5 mt-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {Object.entries(reactions).map(([emoji, userIds]) => {
                          const hasReacted = currentUser && userIds.includes(currentUser.id)
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                                hasReacted
                                  ? 'bg-[#6366f1]/15 border-[#6366f1]/40 text-[#6366f1]'
                                  : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-300'
                              }`}
                              title={`Reagito da ${userIds.length} utente/i`}
                            >
                              <span>{emoji}</span>
                              <span className="font-semibold text-[10px]">{userIds.length}</span>
                            </button>
                          )
                        })}

                        <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="h-6 w-6 rounded-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-xs flex items-center justify-center transition-transform hover:scale-115 cursor-pointer"
                              title={`Reagisci con ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setActiveThreadId(msg.id)}
                            className="h-6 px-1.5 rounded-sm hover:bg-[#6366f1]/10 text-zinc-500 hover:text-[#6366f1] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Rispondi nel thread"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Rispondi</span>
                          </button>

                          {msg.content && (
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className={`h-6 px-1.5 rounded-sm text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                                copiedMessageId === msg.id
                                  ? 'bg-emerald-500/10 text-[#10b981]'
                                  : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-zinc-500 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                              }`}
                              title="Copia testo messaggio"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Copiato</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Copia</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Link Thread */}
                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveThreadId(msg.id)}
                          className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#6366f1] bg-[#6366f1]/10 hover:bg-[#6366f1]/15 border border-[#6366f1]/25 transition-colors w-fit cursor-pointer"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>
                            {replies.length} {replies.length === 1 ? 'risposta' : 'risposte'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-normal">• Vedi thread</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                {searchQuery.trim()
                  ? `Nessun messaggio trovato per "${searchQuery}".`
                  : isDirectMessage
                    ? `Inizia la conversazione privata con ${dmPartner?.full_name || 'questo membro'}.`
                    : `Nessun messaggio in #${activeChannel}. Inizia la conversazione!`}
              </div>
            )}
          </div>

          {/* Pending Files Preview Strip */}
          {pendingFiles.length > 0 && (
            <div className="p-2.5 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center gap-2 overflow-x-auto">
              {pendingFiles.map((file, idx) => {
                const isImg = file.type.startsWith('image/')
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-white dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] px-2.5 py-1.5 rounded-md text-xs shrink-0"
                  >
                    {isImg ? (
                      <ImageIcon className="h-3.5 w-3.5 text-[#6366f1] shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[120px] font-medium text-[#111113] dark:text-[#f4f4f5]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({formatBytes(file.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(idx)}
                      className="p-0.5 rounded-sm text-zinc-400 hover:text-rose-500 ml-1 cursor-pointer"
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
            <div className="absolute bottom-16 left-4 z-30 w-64 bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 border-b border-[#e5e3dc] dark:border-white/[0.08]">
                <AtSign className="h-3 w-3" />
                <span>Menziona membro</span>
              </div>
              {mentionCandidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectMention(c.name)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f3] dark:hover:bg-[#1f1f24] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-[#111113] dark:text-[#f4f4f5]">@{c.name}</span>
                  <span className="text-[10px] text-zinc-400 uppercase">{c.role}</span>
                </button>
              ))}
            </div>
          )}

          {/* Autocomplete Popup Comandi Slash */}
          {inputMessage.startsWith('/') &&
            !inputMessage.includes(' ') &&
            matchingSlashCommands.length > 0 && (
              <div className="absolute bottom-16 left-4 z-30 w-80 sm:w-96 bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e3dc] dark:border-white/[0.08]">
                  <Terminal className="h-3 w-3 text-[#6366f1]" />
                  <span>Comandi Rapidi (Slash Commands)</span>
                </div>
                <div className="divide-y divide-[#e5e3dc] dark:divide-white/[0.06]">
                  {matchingSlashCommands.map((cmd) => {
                    const CmdIcon = cmd.icon
                    return (
                      <button
                        key={cmd.command}
                        type="button"
                        onClick={() => handleSelectSlashCommand(cmd.command)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f6f3] dark:hover:bg-[#1f1f24] flex items-start gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="p-1 rounded-sm bg-[#6366f1]/10 text-[#6366f1] group-hover:bg-[#6366f1] group-hover:text-white transition-colors mt-0.5">
                          <CmdIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#6366f1]">
                              {cmd.command}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono truncate">
                              {cmd.example}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
                            {cmd.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          {/* Input Bar Principale */}
          <div className="p-2.5 sm:p-3.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white dark:bg-[#0d0d0f] border-t border-[#e5e3dc] dark:border-white/[0.08] shrink-0 relative space-y-2">
            {hasStudentParticipants && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  onClick={() => setNotifyStudentsEmailToggle((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                    notifyStudentsEmailToggle
                      ? 'bg-[#6366f1] text-white border-[#6366f1]'
                      : 'bg-[#f7f6f3] dark:bg-[#141417] text-zinc-600 dark:text-zinc-300 border-[#e5e3dc] dark:border-white/[0.08] hover:border-[#6366f1]'
                  }`}
                  title="Attiva per inviare un avviso email a tutti gli studenti iscritti con questo messaggio"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>
                    {notifyStudentsEmailToggle
                      ? 'Avviso Email Iscritti ATTIVO'
                      : 'Avvisa iscritti via Email'}
                  </span>
                </button>
                <span className="text-[10px] text-zinc-400">
                  Zero-Spam: i messaggi ordinari inviano solo Push/Badge. Usa il toggle o{' '}
                  <code className="text-[#6366f1]">@tutti</code> per gli avvisi importanti via Email.
                </span>
              </div>
            )}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#f7f6f3] dark:bg-[#141417] p-1.5 sm:p-2 rounded-md border border-[#e5e3dc] dark:border-white/[0.08]"
            >
              {isRecordingVoice ? (
                <>
                  <div className="flex-1 flex items-center gap-2.5 px-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 truncate">
                      Registrazione vocale {formatVoiceDuration(recordingSeconds)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => stopVoiceRecording(false)}
                    className="h-8 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 gap-1 shrink-0"
                    title="Annulla registrazione"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Annulla</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => stopVoiceRecording(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 sm:h-9 px-3 sm:px-4 gap-1.5 rounded-md shrink-0 border-0"
                    title="Invia messaggio vocale"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Invia Vocale</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSendingVoice || !currentUser}
                    title="Allega foto o documenti"
                    className="h-8 w-8 text-zinc-400 hover:text-[#6366f1] shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={startVoiceRecording}
                    disabled={isUploading || isSendingVoice || !currentUser}
                    title="Registra messaggio vocale"
                    className="h-8 w-8 text-zinc-400 hover:text-rose-500 shrink-0"
                  >
                    {isSendingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={mainInputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => handleInputChangeWithMentions(e.target.value, 'main')}
                    onPaste={handlePasteFiles}
                    placeholder={
                      pendingFiles.length > 0
                        ? 'Aggiungi una didascalia...'
                        : isDirectMessage
                          ? `Scrivi a ${dmPartner?.full_name || 'membro'}... (incolla o trascina file)`
                          : `Scrivi in #${activeChannel}... (incolla o trascina file, @ per menzionare)`
                    }
                    className="flex-1 text-xs sm:text-sm focus:outline-none bg-transparent px-2 text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-w-0"
                    disabled={!currentUser || isUploading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      (!inputMessage.trim() && pendingFiles.length === 0) ||
                      !currentUser ||
                      isUploading ||
                      isSendingVoice
                    }
                    className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs font-semibold h-8 px-3 sm:px-4 gap-1.5 rounded-md shrink-0 border-0 cursor-pointer"
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
                </>
              )}
            </form>
          </div>
        </div>

        {/* Right: Thread Lateral Panel */}
        {activeThreadParent && (
          <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:w-[360px] lg:w-[380px] shrink-0 border-l border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#111114] flex flex-col h-full shadow-2xl md:shadow-none">
            {/* Thread Header */}
            <div className="min-h-[52px] px-4 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between bg-white dark:bg-[#141417] shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Thread
                </h3>
                <span className="text-xs text-zinc-400">
                  {isDirectMessage ? 'DM' : `#${activeChannel}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                className="px-2 py-1 rounded-sm bg-[#f7f6f3] dark:bg-[#18181c] hover:text-rose-500 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-[#e5e3dc] dark:border-white/[0.08] cursor-pointer"
                title="Chiudi thread (Esc)"
              >
                <X className="h-3.5 w-3.5" />
                <span>Chiudi</span>
              </button>
            </div>

            {/* Thread Scrollable Content */}
            <div ref={threadContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-0">
              {/* Messaggio Padre Originale */}
              <div className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    fallback={
                      extractMessageMeta(activeThreadParent).senderName ||
                      activeThreadParent.sender?.full_name ||
                      '?'
                    }
                    src={
                      extractMessageMeta(activeThreadParent).senderStudentId
                        ? undefined
                        : activeThreadParent.sender?.avatar_url || undefined
                    }
                    className="h-6 w-6 text-[10px]"
                  />
                  {activeThreadParent.sender_id === currentUser?.id &&
                  !extractMessageMeta(activeThreadParent).senderStudentId ? (
                    <span className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5]">Tu</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openDirectMessageWith(
                          extractMessageMeta(activeThreadParent).senderStudentId ||
                            activeThreadParent.sender_id
                        )
                      }
                      className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5] hover:text-[#6366f1] hover:underline transition-colors text-left flex items-center gap-1 cursor-pointer"
                      title="Scrivi in privato"
                    >
                      <span>
                        {extractMessageMeta(activeThreadParent).senderName ||
                          activeThreadParent.sender?.full_name ||
                          'Utente'}
                      </span>
                    </button>
                  )}
                  <span
                    className="text-[10px] text-zinc-400 ml-auto"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {formatDate(activeThreadParent.created_at)}
                  </span>
                </div>
                <div className="text-xs text-[#111113] dark:text-zinc-200 leading-relaxed break-words">
                  {renderMessageContent(activeThreadParent.content, false)}
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {Object.entries(extractMessageMeta(activeThreadParent).reactions).map(
                    ([emoji, userIds]) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleToggleReaction(activeThreadParent.id, emoji)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] border border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#18181c] text-zinc-700 dark:text-zinc-300"
                      >
                        <span>{emoji}</span>
                        <span className="font-semibold">{userIds.length}</span>
                      </button>
                    )
                  )}
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleToggleReaction(activeThreadParent.id, emoji)}
                      className="h-5 w-5 rounded-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[11px] flex items-center justify-center cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separatore Risposte */}
              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-[#e5e3dc] dark:bg-white/[0.08] flex-1" />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {activeThreadReplies.length}{' '}
                  {activeThreadReplies.length === 1 ? 'Risposta' : 'Risposte'}
                </span>
                <div className="h-px bg-[#e5e3dc] dark:bg-white/[0.08] flex-1" />
              </div>

              {/* Elenco Risposte del Thread */}
              {activeThreadReplies.length > 0 ? (
                activeThreadReplies.map((reply) => {
                  const replyMeta = extractMessageMeta(reply)
                  const isMe = reply.sender_id === currentUser?.id && !replyMeta.senderStudentId
                  const { reactions: replyReactions } = replyMeta
                  return (
                    <div key={reply.id} className="flex items-start gap-2.5">
                      <Avatar
                        fallback={replyMeta.senderName || reply.sender?.full_name || '?'}
                        src={
                          replyMeta.senderStudentId
                            ? undefined
                            : reply.sender?.avatar_url || undefined
                        }
                        className="h-6 w-6 text-[10px] shrink-0 mt-0.5"
                      />
                      <div className="flex flex-col flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isMe ? (
                            <span className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5] truncate">
                              Tu
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openDirectMessageWith(
                                  extractMessageMeta(reply).senderStudentId || reply.sender_id
                                )
                              }
                              className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5] truncate hover:text-[#6366f1] hover:underline transition-colors text-left flex items-center gap-1 cursor-pointer"
                              title="Scrivi in privato"
                            >
                              <span>
                                {extractMessageMeta(reply).senderName ||
                                  reply.sender?.full_name ||
                                  'Utente'}
                              </span>
                            </button>
                          )}
                          <span
                            className="text-[9px] text-zinc-400"
                            style={{ fontFamily: 'var(--font-mono), monospace' }}
                          >
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <div
                          className={`text-xs p-2.5 rounded-lg leading-relaxed break-words whitespace-pre-wrap select-text ${
                            isMe
                              ? 'bg-[#6366f1] text-white'
                              : 'bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08]'
                          }`}
                        >
                          {renderMessageContent(reply.content, isMe)}
                        </div>

                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {Object.entries(replyReactions).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleToggleReaction(reply.id, emoji)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417]"
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
                              className="h-5 w-5 rounded-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[10px] flex items-center justify-center cursor-pointer"
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
                <div className="text-center py-6 text-xs text-zinc-400">
                  Nessuna risposta in questo thread. Sii il primo a rispondere!
                </div>
              )}
            </div>

            {/* Autocomplete Popup Menzioni per Thread */}
            {mentionQuery !== null && mentionTarget === 'thread' && mentionCandidates.length > 0 && (
              <div className="absolute bottom-16 right-4 z-30 w-64 bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-xl overflow-hidden py-1 max-h-44 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 border-b border-[#e5e3dc] dark:border-white/[0.08]">
                  <AtSign className="h-3 w-3" />
                  <span>Menziona membro</span>
                </div>
                {mentionCandidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectMention(c.name)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f3] dark:hover:bg-[#1f1f24] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-[#111113] dark:text-[#f4f4f5]">@{c.name}</span>
                    <span className="text-[10px] text-zinc-400 uppercase">{c.role}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thread Input Form */}
            <div className="p-3 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-white dark:bg-[#141417] shrink-0">
              <form onSubmit={handleSendThreadReply} className="flex items-center gap-2">
                <input
                  ref={threadInputRef}
                  type="text"
                  value={threadInputMessage}
                  onChange={(e) => handleInputChangeWithMentions(e.target.value, 'thread')}
                  placeholder="Rispondi al thread... (@ per menzionare)"
                  className="flex-1 text-xs focus:outline-none bg-[#f7f6f3] dark:bg-[#0d0d0f] p-2 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400 min-w-0"
                  disabled={isSendingThreadReply || !currentUser}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!threadInputMessage.trim() || isSendingThreadReply || !currentUser}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] h-8 px-3 rounded-md shrink-0 text-xs gap-1 border-0 cursor-pointer"
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

      {/* Modal Creazione Nuovo Canale Dinamico / Privato */}
      {showCreateChannelModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowCreateChannelModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e3dc] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-[#6366f1]/10 text-[#6366f1]">
                  <Hash className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Crea Nuovo Canale
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Organizza conversazioni per progetto o argomento
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateChannelModal(false)}
                className="p-1 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Canale (slug)
                </label>
                <div className="flex items-center bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-3 py-2 text-xs">
                  <span className="text-zinc-400 font-mono mr-1">#</span>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="es. progetto-alpha, clienti-vip"
                    className="flex-1 bg-transparent focus:outline-none text-[#111113] dark:text-[#f4f4f5] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Descrizione (opzionale)
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Di cosa si parla in questo canale..."
                  className="w-full bg-[#f7f6f3] dark:bg-[#0d0d0f] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-3 py-2 text-xs focus:outline-none text-[#111113] dark:text-[#f4f4f5]"
                />
              </div>

              {/* Switch Canale Privato */}
              <div className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className={`h-4 w-4 ${newChannelIsPrivate ? 'text-amber-500' : 'text-zinc-400'}`} />
                  <div>
                    <span className="text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] block">
                      Canale Privato
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {newChannelIsPrivate
                        ? 'Visibile e accessibile solo ai membri selezionati'
                        : 'Aperto a tutti i membri del team'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelIsPrivate}
                  onChange={(e) => setNewChannelIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e5e3dc] text-[#6366f1] focus:ring-[#6366f1] cursor-pointer"
                />
              </div>

              {newChannelIsPrivate && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Invita Membri Autorizzati
                  </label>
                  <div className="max-h-36 overflow-y-auto rounded-md border border-[#e5e3dc] dark:border-white/[0.08] p-2 space-y-1 bg-[#f7f6f3] dark:bg-[#0d0d0f]">
                    {teamMembers.map((m) => {
                      const isMe = m.id === currentUser?.id
                      const isChecked = isMe || newChannelMemberIds.includes(m.id)
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-1.5 rounded-sm text-xs cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05] ${
                            isMe ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              disabled={isMe}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewChannelMemberIds((prev) => [...prev, m.id])
                                } else {
                                  setNewChannelMemberIds((prev) => prev.filter((id) => id !== m.id))
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-[#e5e3dc] text-[#6366f1] focus:ring-[#6366f1]"
                            />
                            <span className="text-[#111113] dark:text-[#f4f4f5] font-medium">
                              {m.full_name} {isMe ? '(Tu - Creatore)' : ''}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                            {m.role}
                          </Badge>
                        </label>
                      )
                    })}
                  </div>

                  {enrolledStudents.length > 0 && (
                    <StudentMemberPicker
                      students={enrolledStudents}
                      selectedIds={newChannelMemberIds}
                      onToggleId={(stId) =>
                        setNewChannelMemberIds((prev) =>
                          prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
                        )
                      }
                      search={studentPickerSearch}
                      onSearchChange={setStudentPickerSearch}
                    />
                  )}
                </div>
              )}

              {/* Box Invito Collaboratore */}
              <div className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
                <button
                  type="button"
                  onClick={() => setShowInviteCollabSection(!showInviteCollabSection)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#6366f1] hover:underline cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    <span>+ Crea e Invita Collaboratore Esterno</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {showInviteCollabSection ? 'Chiudi' : 'Espandi'}
                  </span>
                </button>

                {showInviteCollabSection && (
                  <div className="pt-2 space-y-2.5 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Crea un account limitato alla sola chat e aggiungilo subito a questo canale.
                    </p>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-300 mb-0.5">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={collabFullName}
                        onChange={(e) => setCollabFullName(e.target.value)}
                        placeholder="es. Mario Rossi (Partner)"
                        className="w-full bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-300 mb-0.5">
                        Indirizzo Email *
                      </label>
                      <input
                        type="email"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        placeholder="mario.rossi@partner.com"
                        className="w-full bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-300 mb-0.5">
                        Password Temporanea
                      </label>
                      <input
                        type="text"
                        value={collabPassword}
                        onChange={(e) => setCollabPassword(e.target.value)}
                        placeholder="Collab!2026!"
                        className="w-full bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs font-mono text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Al primo login l&apos;utente dovrà impostare la propria password personale.
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isInvitingCollab || !collabFullName.trim() || !collabEmail.trim()}
                        onClick={handleInviteCollabInModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1 cursor-pointer border-0"
                      >
                        {isInvitingCollab ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        <span>Crea Account & Spunta</span>
                      </Button>
                    </div>

                    {inviteCollabResult && (
                      <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-700 dark:text-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                            Collaboratore creato e aggiunto!
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(inviteCollabResult.message)
                              setCollabCopied(true)
                              setTimeout(() => setCollabCopied(false), 2000)
                            }}
                            className="h-6 px-2 text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{collabCopied ? 'Copiato!' : 'Copia Messaggio'}</span>
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-[10px] bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08]">
                          {inviteCollabResult.message}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="text-xs h-8 border-[#e5e3dc] dark:border-white/[0.1]"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newChannelName.trim() || isCreatingChannel}
                  className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs h-8 gap-1.5 border-0"
                >
                  {isCreatingChannel ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Crea Canale</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestione Membri del Canale Privato / Custom */}
      {showManageMembersModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowManageMembersModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e3dc] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-[#6366f1]/10 text-[#6366f1]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Gestione Membri: #{activeChannel}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Seleziona chi può visualizzare e scrivere in questo canale
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageMembersModal(false)}
                className="p-1 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Membri Autorizzati ({manageMemberIds.length})
              </label>
              <div className="max-h-44 overflow-y-auto rounded-md border border-[#e5e3dc] dark:border-white/[0.08] p-2 space-y-1 bg-[#f7f6f3] dark:bg-[#0d0d0f]">
                {teamMembers.map((m) => {
                  const currentChannelItem = customChannels.find((c) => c.name === activeChannel)
                  const isCreator = currentChannelItem?.createdBy === m.id
                  const isChecked = isCreator || manageMemberIds.includes(m.id)
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-1.5 rounded-sm text-xs cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05] ${
                        isCreator ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={isCreator}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setManageMemberIds((prev) => [...prev, m.id])
                            } else {
                              setManageMemberIds((prev) => prev.filter((id) => id !== m.id))
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-[#e5e3dc] text-[#6366f1] focus:ring-[#6366f1]"
                        />
                        <span className="text-[#111113] dark:text-[#f4f4f5] font-medium">
                          {m.full_name} {isCreator ? '(Creatore)' : ''}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                        {m.role}
                      </Badge>
                    </label>
                  )
                })}
              </div>

              {enrolledStudents.length > 0 && (
                <StudentMemberPicker
                  students={enrolledStudents}
                  selectedIds={manageMemberIds}
                  onToggleId={(stId) =>
                    setManageMemberIds((prev) =>
                      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
                    )
                  }
                  search={studentPickerSearch}
                  onSearchChange={setStudentPickerSearch}
                />
              )}
            </div>

            {/* Box Invito Collaboratore Esterno */}
            <div className="p-3 rounded-md bg-[#f7f6f3] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] space-y-2">
              <span className="text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-[#10b981]" />
                <span>Invita nuovo Collaboratore in questo canale</span>
              </span>

              <div className="space-y-2 pt-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manageCollabFullName}
                    onChange={(e) => setManageCollabFullName(e.target.value)}
                    placeholder="Nome Completo *"
                    className="bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                  />
                  <input
                    type="email"
                    value={manageCollabEmail}
                    onChange={(e) => setManageCollabEmail(e.target.value)}
                    placeholder="Email Collaboratore *"
                    className="bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manageCollabPassword}
                    onChange={(e) => setManageCollabPassword(e.target.value)}
                    placeholder="Password temporanea"
                    className="flex-1 bg-white dark:bg-[#141417] rounded-md border border-[#e5e3dc] dark:border-white/[0.1] px-2.5 py-1.5 text-xs font-mono text-[#111113] dark:text-[#f4f4f5] focus:outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      isManageInviting ||
                      !manageCollabFullName.trim() ||
                      !manageCollabEmail.trim()
                    }
                    onClick={handleInviteCollabInManage}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 shrink-0 cursor-pointer border-0"
                  >
                    {isManageInviting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                    <span>Crea & Aggiungi</span>
                  </Button>
                </div>

                {manageCollabResult && (
                  <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-700 dark:text-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                        Collaboratore creato e inserito nel canale!
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(manageCollabResult.message)
                          setManageCollabCopied(true)
                          setTimeout(() => setManageCollabCopied(false), 2000)
                        }}
                        className="h-6 px-2 text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{manageCollabCopied ? 'Copiato!' : 'Copia Messaggio'}</span>
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[10px] bg-white dark:bg-[#141417] p-2 rounded-sm border border-[#e5e3dc] dark:border-white/[0.08]">
                      {manageCollabResult.message}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowManageMembersModal(false)}
                className="text-xs h-8 border-[#e5e3dc] dark:border-white/[0.1]"
              >
                Annulla
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingMembers}
                onClick={handleSaveManageMembers}
                className="bg-[#111113] hover:bg-zinc-800 text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-[#0d0d0f] text-xs h-8 gap-1.5 cursor-pointer border-0"
              >
                {isSavingMembers ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Salva Modifiche Membri</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Elenco Partecipanti Canale */}
      {showParticipantsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowParticipantsModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#141417] rounded-lg border border-[#e5e3dc] dark:border-white/[0.1] shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e3dc] dark:border-white/[0.08] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-[#6366f1]/10 text-[#6366f1]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    <span>Partecipanti</span>
                    <span className="text-[#6366f1]">#{activeChannel}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {currentChannelParticipants.length}{' '}
                    {currentChannelParticipants.length === 1 ? 'persona presente' : 'persone presenti'}{' '}
                    nel canale
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="p-1 rounded-sm text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={participantSearchQuery}
                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                placeholder="Filtra persone per nome o email..."
                className="w-full pl-9 pr-8 py-2 rounded-md border border-[#e5e3dc] dark:border-white/[0.1] bg-[#f7f6f3] dark:bg-[#0d0d0f] text-xs text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              />
              {participantSearchQuery && (
                <button
                  type="button"
                  onClick={() => setParticipantSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#e5e3dc] dark:divide-white/[0.06] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md min-h-0">
              {currentChannelParticipants
                .filter((p: ChannelParticipant) => {
                  if (!participantSearchQuery.trim()) return true
                  const q = participantSearchQuery.toLowerCase()
                  return (
                    p.full_name?.toLowerCase().includes(q) ||
                    (p.email && p.email.toLowerCase().includes(q)) ||
                    (p.code && p.code.toLowerCase().includes(q))
                  )
                })
                .map((person: ChannelParticipant) => {
                  const isMe = person.id === currentUser?.id
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-[#141417] hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a1f] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <Avatar
                            fallback={person.full_name || '?'}
                            className="h-8 w-8 text-xs font-semibold bg-[#f7f6f3] dark:bg-[#18181c] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08]"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-[#141417]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#111113] dark:text-[#f4f4f5] truncate">
                              {person.full_name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-semibold text-[#6366f1]">(Tu)</span>
                            )}
                            {person.code && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                {person.code}
                              </span>
                            )}
                          </div>
                          {person.email && (
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                              {person.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0.2 uppercase font-semibold ${
                            person.role === 'student'
                              ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                              : person.role === 'collaborator'
                                ? 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                                : 'border-[#6366f1]/30 text-[#6366f1] bg-[#6366f1]/10'
                          }`}
                        >
                          {person.role === 'student' ? 'Studente' : person.role}
                        </Badge>

                        {!isMe && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openDirectMessageWith(person.id)}
                            className="h-7 px-2.5 text-xs gap-1 border-[#e5e3dc] dark:border-white/[0.1] text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1] cursor-pointer"
                            title={`Avvia messaggio diretto 1-a-1 con ${person.full_name}`}
                          >
                            <MessageCircle className="h-3 w-3 text-[#6366f1]" />
                            <span>Messaggio</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08] text-[11px] text-zinc-400 shrink-0">
              <span>Clicca su &ldquo;Messaggio&rdquo; per aprire una chat 1-a-1 istantanea</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowParticipantsModal(false)}
                className="text-xs h-7 px-3 border-[#e5e3dc] dark:border-white/[0.1]"
              >
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Zoom Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-[#18181c] text-white hover:bg-zinc-700 transition-colors shadow-lg cursor-pointer"
              aria-label="Chiudi anteprima"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Anteprima a schermo intero"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  )
}
