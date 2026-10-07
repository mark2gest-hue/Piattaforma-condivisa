'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Users,
  Send,
  Paperclip,
  Hash,
  Sparkles,
  Loader2,
  Menu,
  X,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/types/index'
import { requestNotificationPermission, sendDesktopNotification } from '@/lib/notifications'
import { notifyChatMessageAction } from '@/app/actions/notifications'

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

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState('generale')
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileChannels, setShowMobileChannels] = useState(false)

  // Attachment States
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  // Fetch initial user, team members, and messages for channel
  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      requestNotificationPermission()
      
      const { data: { user } } = await supabase.auth.getUser()
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
      setLoading(false)
    }

    initChat()
  }, [activeChannel])

  // Setup Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel=eq.${activeChannel}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          const senderProfile = teamMembers.find(p => p.id === newMessage.sender_id)
          
          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: senderProfile,
          }
          
          setMessages((prev) => [...prev, messageWithSender])

          if (currentUser && newMessage.sender_id !== currentUser.id) {
            sendDesktopNotification(
              `Messaggio da ${senderProfile?.full_name || 'Team'} in #${activeChannel}`,
              { body: newMessage.content || 'Nuovo allegato' },
              'chat'
            )
          }
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputMessage.trim() && pendingFiles.length === 0) || !currentUser || isUploading) return

    setIsUploading(true)
    let uploadedAttachments: ChatAttachment[] = []

    if (pendingFiles.length > 0) {
      uploadedAttachments = await uploadAttachments(pendingFiles)
    }

    const messageContent = inputMessage.trim()
    setInputMessage('')
    setPendingFiles([])

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
      const notifyText = messageContent || (uploadedAttachments.length > 0 ? `📎 Ha inviato ${uploadedAttachments.length} allegato/i` : '')
      notifyChatMessageAction(activeChannel, notifyText, currentUser.full_name).catch((err) =>
        console.error('Telegram chat notify error:', err)
      )
    }
  }

  const currentChannelObj = CHANNELS.find((c) => c.name === activeChannel) || CHANNELS[0]

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100vh-8.5rem)] space-y-3 sm:space-y-4 min-h-0">
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            Chat di Team Realtime
          </h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comunicazione istantanea sincronizzata via Supabase Realtime per i membri del team.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMobileChannels(true)}
            className="md:hidden text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
          >
            <Menu className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>#{activeChannel}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </Button>
          <Badge variant="success" className="py-0.5 sm:py-1 px-2.5 sm:px-3 text-[11px] sm:text-xs flex items-center gap-1.5 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Realtime Connesso
          </Badge>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden relative">
        
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
            fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out
            md:static md:z-auto md:w-auto md:shadow-none md:translate-x-0 md:flex md:col-span-4 lg:col-span-3 md:border-r border-slate-200 dark:border-slate-800 md:bg-slate-50/50 md:dark:bg-slate-900/60 overflow-y-auto min-h-0 h-full
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
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch.name)
                      setShowMobileChannels(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">#{ch.name}</span>
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
                <div key={member.id} className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{member.full_name}</span>
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

        {/* Right: Message Stream */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full min-h-0 bg-slate-50/20 dark:bg-slate-950/40 relative overflow-hidden">
          {/* Channel Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0 z-10">
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
                <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{currentChannelObj.desc}</p>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div ref={chatContainerRef} className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto min-h-0 overscroll-contain">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id
                const msgAttachments = (msg.attachments && Array.isArray(msg.attachments)) ? (msg.attachments as unknown as ChatAttachment[]) : []

                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 sm:gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
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
                        <div className={`text-xs sm:text-sm p-2.5 sm:p-3 rounded-2xl shadow-xs leading-relaxed max-w-[88%] sm:max-w-[85%] break-words ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-xs' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                        }`}>
                          {msg.content}
                        </div>
                      )}

                      {/* Attachments Rendering */}
                      {msgAttachments.length > 0 && (
                        <div className="space-y-2 max-w-[88%] sm:max-w-[85%]">
                          {msgAttachments.map((att, attIdx) => {
                            const isImg = att.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.name || '')
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
                                        <span className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[260px]">{att.name}</span>
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
                  <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs shrink-0 shadow-xs">
                    {isImg ? <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" /> : <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    <span className="truncate max-w-[120px] font-medium text-slate-800 dark:text-slate-200">{file.name}</span>
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

          {/* Input Bar */}
          <div className="p-2.5 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
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
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={pendingFiles.length > 0 ? `Aggiungi una didascalia...` : `Scrivi in #${activeChannel}...`}
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
      </div>

      {/* Image Preview Zoom Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
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

