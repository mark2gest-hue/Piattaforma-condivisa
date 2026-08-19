'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Send,
  Hash,
  Paperclip,
  Users,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/types/index'
import { requestNotificationPermission, sendDesktopNotification } from '@/lib/notifications'

type MessageWithSender = Message & { sender?: Profile }

const CHANNELS = [
  { id: 'generale', name: 'generale', desc: 'Comunicazioni generali e allineamenti', icon: Hash },
  { id: 'progetti', name: 'progetti', desc: 'Discussioni sui progetti in corso', icon: Hash },
]

export default function TeamChatPage() {
  const [activeChannel, setActiveChannel] = useState('generale')
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      requestNotificationPermission()
      
      // Get current logged in user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Get all team members to map sender_ids in realtime events
      const { data: profiles } = await supabase.from('profiles').select('*')
      if (profiles) setTeamMembers(profiles)

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

          // Riproduce il suono e mostra notifica desktop se il messaggio è inviato da un altro membro del team
          if (currentUser && newMessage.sender_id !== currentUser.id) {
            sendDesktopNotification(
              `Messaggio da ${senderProfile?.full_name || 'Team'} in #${activeChannel}`,
              { body: newMessage.content },
              'chat'
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannel, teamMembers])

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !currentUser) return

    const messageContent = inputMessage.trim()
    setInputMessage('') // optimistic clear

    const { error } = await (supabase as any).from('messages').insert({
      channel: activeChannel,
      content: messageContent,
      sender_id: currentUser.id,
      is_system: false,
    })

    if (error) {
      console.error('Error sending message:', error)
      // Potresti voler gestire l'errore ripristinando il messaggio nell'input
    }
  }

  const currentChannelObj = CHANNELS.find((c) => c.name === activeChannel) || CHANNELS[0]

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Chat di Team Realtime
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comunicazione istantanea sincronizzata via Supabase Realtime per i membri del team.
          </p>
        </div>
        <Badge variant="success" className="py-1 px-3 flex items-center gap-1.5 w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Realtime Connesso
        </Badge>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        {/* Left: Channels & Team List */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 bg-slate-50/50 p-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
              Canali Tematici
            </div>
            <div className="space-y-1">
              {CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.name
                const Icon = ch.icon
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-200/60'
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
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center justify-between">
              <span>Team</span>
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-2 text-xs">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-2 py-1.5 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="font-semibold text-slate-800 truncate max-w-[100px]">{member.full_name}</span>
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
        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between bg-slate-50/20 relative">
          {/* Channel Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur z-10 sticky top-0">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-blue-600" />
                {currentChannelObj.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentChannelObj.desc}</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar
                      fallback={msg.sender?.full_name || '?'}
                      src={msg.sender?.avatar_url || undefined}
                      className="h-8 w-8 bg-blue-100 text-blue-800 font-semibold text-xs shrink-0 mt-1 border border-blue-200"
                    />
                    <div className={`flex flex-col flex-1 space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-bold text-slate-900">
                          {isMe ? 'Tu' : msg.sender?.full_name || 'Utente Sconosciuto'}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(msg.created_at)}</span>
                      </div>
                      <div className={`text-sm p-3 rounded-2xl shadow-sm leading-relaxed max-w-[85%] ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
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

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner"
            >
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Scrivi un messaggio in #${activeChannel}...`}
                className="flex-1 text-sm focus:outline-none bg-transparent px-2 placeholder:text-slate-400"
                disabled={!currentUser}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputMessage.trim() || !currentUser}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 gap-1.5 shadow-sm rounded-lg shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                Invia
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
