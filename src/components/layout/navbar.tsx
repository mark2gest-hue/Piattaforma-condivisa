'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  LogOut,
  Bot,
  Video,
  GraduationCap,
  Users,
  Calendar,
  KanbanSquare,
  Megaphone,
  Folder,
  Sparkles,
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
  onToggleMobileMenu?: () => void
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
  onToggleMobileMenu,
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
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [cmdSearchQuery, setCmdSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setIsCommandOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        {/* Mobile Toggle & Context */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Apri Menu Navigazione"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="md:hidden font-bold text-sm tracking-tight text-blue-600 dark:text-blue-400">Team Hub</span>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Workspace Condiviso</span>
            </Badge>
          </div>
        </div>

        {/* Center Quick Search / Command Palette Trigger */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-6">
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="w-full h-9 pl-3 pr-2 flex items-center justify-between text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-xs"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">Cerca pagine, studenti, task o strumenti...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3 relative">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Quick AI Agents Studio Button */}
          <Link
            href="/agenti/"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition-all shadow-xs"
            title="Apri l'Orchestratore e la Squadra Agenti AI"
          >
            <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Agenti AI</span>
            <span className="text-[9px] px-1 py-0.2 bg-purple-500/20 rounded font-mono uppercase">HQ</span>
          </Link>

          {/* Quick Video Studio Factory Button (Single-Sign-On con token sicuro) */}
          <a
            href={`https://video.aiutiamoci.cloud/?auth_pin=2026&user=${
              (userName || '').toLowerCase().includes('lorenzo')
                ? 'lorenzo'
                : (userName || '').toLowerCase().includes('stefano')
                ? 'stefano'
                : 'marco'
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-xs"
            title="Apri Video Studio Factory (HyperFrames & Neural Video)"
          >
            <Video className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Video Studio</span>
            <span className="text-[9px] px-1 py-0.2 bg-cyan-500/20 rounded font-mono uppercase">Factory</span>
          </a>

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

          {/* User Card & Logout */}
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

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="ml-1 h-8 px-2.5 text-xs text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Disconnetti ed esci dalla piattaforma"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-semibold">Esci</span>
            </Button>
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

      {/* COMMAND PALETTE MODAL (CMD + K) */}
      {isCommandOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Cerca */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <Search className="h-5 w-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={cmdSearchQuery}
                onChange={(e) => setCmdSearchQuery(e.target.value)}
                placeholder="Digita dove vuoi andare o un'azione (es. studenti, video, lavori, agenti)..."
                className="w-full text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
                ESC
              </kbd>
            </div>

            {/* Lista Scorciatoie & Risultati */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
              {[
                { title: 'Corsi Formativi & Masterclass', subtitle: 'Area didattica, video e checkpoint', href: '/corsi', icon: GraduationCap, badge: 'Studenti' },
                { title: 'Zona Compiti & Missioni', subtitle: 'Consegna esercitazioni e test esame', href: '/zona-compiti', icon: ShieldCheck, badge: 'Certificati' },
                { title: 'Squadra Agenti AI (Studio 3D)', subtitle: 'Cockpit interattivo scrivanie e bot', href: '/agenti/', icon: Bot, badge: 'Studio AI' },
                { title: 'Servizi AI & Soluzioni PMI', subtitle: 'Catalogo consulenza e offerte B2B', href: '/servizi-ai', icon: Sparkles, badge: 'Soluzioni' },
                { title: 'Lavori & Kanban Task', subtitle: 'Board operativa e flussi di lavoro', href: '/lavori', icon: KanbanSquare, badge: 'Team' },
                { title: 'Rubrica Clienti & CRM', subtitle: 'Anagrafiche contatti e aziende', href: '/clienti', icon: Users, badge: 'CRM' },
                { title: 'Calendario & Eventi', subtitle: 'Scadenze, meeting e pianificazione', href: '/calendario', icon: Calendar, badge: 'Agenda' },
                { title: 'Posta Condivisa', subtitle: 'Webmail Aruba e comunicazioni', href: '/posta', icon: Mail, badge: 'Email' },
                { title: 'Marketing & Social Dispatch', subtitle: 'Campagne 1-Click e automazioni', href: '/growth-studio', icon: Megaphone, badge: 'Marketing' },
                { title: 'Archivio Documenti & Storage', subtitle: 'File aziendali e deliverable', href: '/file', icon: Folder, badge: 'File' },
              ]
                .filter(item => {
                  if (!cmdSearchQuery.trim()) return true;
                  const q = cmdSearchQuery.toLowerCase();
                  return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q);
                })
                .map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setIsCommandOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Naviga con un clic</span>
              <span>Aiutiamoci Hub</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
