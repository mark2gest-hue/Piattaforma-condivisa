'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  X,
  MessageSquare,
  Mail,
  CheckCircle2,
  Volume2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound, requestNotificationPermission } from '@/lib/notifications'
import { Project } from '@/types/index'

interface NavbarProps {
  userRole?: string
  userName?: string
  userEmail?: string
  avatarUrl?: string | null
}

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  type: 'chat' | 'email' | 'task'
  read: boolean
}

export function Navbar({
  userRole = 'dev',
  userName = 'Marco (Dev)',
  userEmail = 'marco@team.domain.com',
  avatarUrl = null,
}: NavbarProps) {
  // Current user state
  const [currentUser, setCurrentUser] = useState({
    name: userName,
    email: userEmail,
    role: userRole,
    avatarUrl: avatarUrl,
  })

  // Notification Panel State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Nuovo Messaggio in #generale',
      desc: 'Sincronizzazione Supabase Realtime attiva',
      time: 'Adesso',
      type: 'chat',
      read: false,
    },
    {
      id: 'n-2',
      title: 'Sistema Notifiche Audio & Browser',
      desc: 'Notifiche sonore attive quando la finestra è ridotta a icona',
      time: '5m fa',
      type: 'task',
      read: false,
    },
  ])

  // New Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [taskStatus, setTaskStatus] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isCreatingTask, setIsCreatingTask] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setCurrentUser({
      name: userName,
      email: userEmail,
      role: userRole,
      avatarUrl: avatarUrl,
    })
  }, [userName, userEmail, userRole, avatarUrl])

  useEffect(() => {
    fetchProjects()
    fetchCurrentUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchCurrentUser()
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const resolveUserName = (pName?: string | null, metaName?: string | null, email?: string | null) => {
    if (email && email.toLowerCase() === 'gerelmo@gmail.com') return 'Marco'
    if (pName && pName.trim() && !pName.includes('@') && pName.toLowerCase() !== 'gerelmo') return pName
    if (metaName && metaName.trim() && !metaName.includes('@') && metaName.toLowerCase() !== 'gerelmo') return metaName
    if (email) {
      if (email.toLowerCase().includes('gerelmo') || email.toLowerCase().includes('marco')) return 'Marco'
      const namePart = email.split('@')[0]
      return namePart.charAt(0).toUpperCase() + namePart.slice(1)
    }
    return 'Marco'
  }

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const resolvedName = resolveUserName(profile?.full_name, user.user_metadata?.full_name, user.email)

      if (profile) {
        setCurrentUser({
          name: resolvedName,
          email: profile.email || user.email || '',
          role: profile.role || user.user_metadata?.role || 'dev',
          avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url || null,
        })
      } else {
        setCurrentUser({
          name: resolvedName,
          email: user.email || '',
          role: user.user_metadata?.role || 'dev',
          avatarUrl: user.user_metadata?.avatar_url || null,
        })
      }
    }
  }

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*')
    if (data) setProjects(data)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    setIsCreatingTask(true)
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await (supabase as any).from('tasks').insert({
      title: taskTitle,
      description: taskDesc || null,
      status: taskStatus,
      priority: taskPriority,
      project_id: selectedProjectId || null,
      created_by: userData.user?.id || null,
    }).select().single()

    if (error) {
      alert(`Errore creazione task: ${error.message}`)
    } else {
      playNotificationSound('chat')
      alert(`Attività "${taskTitle}" creata con successo nel Kanban!`)
      setIsTaskModalOpen(false)
      setTaskTitle('')
      setTaskDesc('')
    }
    setIsCreatingTask(false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const testAudioSound = () => {
    requestNotificationPermission()
    playNotificationSound('chat')
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 md:px-8 backdrop-blur shadow-xs transition-colors duration-200">
        {/* Mobile Title / Global Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Workspace Condiviso</span>
            </Badge>
          </div>
        </div>

        {/* Center Quick Search */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca task, file, clienti o messaggi..."
              className="w-full h-9 pl-9 pr-4 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3 relative">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Quick New Task Button */}
          <Button
            size="sm"
            onClick={() => setIsTaskModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuova Attività</span>
          </Button>

          {/* Notifications Bell Button */}
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen)
              requestNotificationPermission()
            }}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Centro Notifiche"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Dropdown Centro Notifiche */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Centro Notifiche</span>
                  {unreadCount > 0 && (
                    <Badge variant="info" className="text-[9px] px-1.5 py-0">
                      {unreadCount} nuove
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={testAudioSound}
                    className="h-7 w-7 text-slate-500 hover:text-blue-600"
                    title="Testa Suono Notifica"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="h-7 w-7 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs flex items-start gap-3 transition-colors ${
                      n.read ? 'opacity-70 bg-white dark:bg-slate-900' : 'bg-blue-50/50 dark:bg-blue-950/30 font-medium'
                    }`}
                  >
                    {n.type === 'chat' && <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                    {n.type === 'email' && <Mail className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />}
                    {n.type === 'task' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                    
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Segna tutte come lette
                </button>
              </div>
            </div>
          )}

          {/* User Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Avatar
              src={currentUser.avatarUrl}
              fallback={currentUser.name}
              className="h-8 w-8 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-semibold border-blue-200 dark:border-blue-800"
            />
            <div className="hidden md:flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                <Badge
                  variant={currentUser.role === 'dev' ? 'purple' : currentUser.role === 'admin' ? 'warning' : 'info'}
                  className="text-[9px] px-1.5 py-0 uppercase"
                >
                  {currentUser.role}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight mt-0.5">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Creazione Rapida Nuova Attività */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Attività nel Kanban</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTaskModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titolo Attività *</label>
                <Input
                  autoFocus
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Es. Sviluppare agente AI per il supporto"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Descrizione (Opzionale)</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Dettagli ed istruzioni per il compito..."
                  className="w-full text-xs p-2.5 rounded-md border border-input bg-background dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Stato Iniziale</label>
                  <select
                    value={taskStatus}
                    onChange={(e: any) => setTaskStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background dark:bg-slate-800 dark:border-slate-700 px-2 text-xs"
                  >
                    <option value="todo">Da Fare</option>
                    <option value="in_progress">In Corso</option>
                    <option value="done">Completato</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priorità</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background dark:bg-slate-800 dark:border-slate-700 px-2 text-xs"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Progetto Collegato</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background dark:bg-slate-800 dark:border-slate-700 px-2 text-xs"
                >
                  <option value="">Nessun progetto specifico</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isCreatingTask} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    'Crea Attività'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
