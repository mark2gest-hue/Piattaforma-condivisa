'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  KanbanSquare,
  Mail,
  MessageSquare,
  FolderOpen,
  Video,
  Sparkles,
  Users,
  Layers,
  Calendar as CalendarIcon,
  GraduationCap,
  Award,
  Network,
  Megaphone,
  ExternalLink,
  Cpu,
  FileCode2,
  LogOut,
  Bot,
  Pin,
  PinOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  isOpenMobile?: boolean
  onCloseMobile?: () => void
  isPinned?: boolean
  onTogglePin?: () => void
}

export function Sidebar({
  isOpenMobile = false,
  onCloseMobile,
  isPinned = false,
  onTogglePin,
}: SidebarProps) {
  const pathname = usePathname()
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const isExpanded = isPinned || isHovered
  const [sidebarProjects, setSidebarProjects] = useState<Array<{ id: string; title: string; status: string }>>([
    { id: '1', title: 'Corsi Formativi', status: 'Attivo' },
    { id: '2', title: 'Consulenze B2B', status: 'In corso' },
    { id: '3', title: 'Agenti AI Dev', status: 'Sprint' },
  ])
  const [teamCount, setTeamCount] = useState<number>(3)
  const [teamSubtitle, setTeamSubtitle] = useState<string>('2 Dev • 1 Business')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [userNameSlug, setUserNameSlug] = useState<string>('marco')
  const supabase = createClient()

  // Chiudi drawer al cambio pagina su mobile
  useEffect(() => {
    if (isOpenMobile && onCloseMobile) {
      onCloseMobile()
    }
  }, [pathname])

  useEffect(() => {
    fetchUnreadEmails()
    fetchProjects()
    fetchTeamMembers()

    // Verifica ruolo utente: Mira è riservata solo a Marco/Admin docenti
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const isMarco = user.email?.toLowerCase().includes('gerelmo') || user.email?.toLowerCase().includes('marco')
        const { data: profile } = await (supabase as any).from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
        setIsAdmin(isMarco || profile?.role === 'admin' || profile?.role === 'dev')
        
        const fullName = (profile?.full_name || user.email || '').toLowerCase()
        if (fullName.includes('lorenzo')) {
          setUserNameSlug('lorenzo')
        } else if (fullName.includes('stefano')) {
          setUserNameSlug('stefano')
        } else {
          setUserNameSlug('marco')
        }
      }
    }
    checkUserRole()

    // Realtime subscription per nuove email e nuovi progetti
    const channel = supabase
      .channel('sidebar-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_emails' },
        () => fetchUnreadEmails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchProjects()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchTeamMembers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUnreadEmails = async () => {
    const { count } = await (supabase as any)
      .from('shared_emails')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (count !== null && count !== undefined) {
      setUnreadEmailCount(count)
    }
  }

  const fetchProjects = async () => {
    const { data } = await (supabase as any)
      .from('projects')
      .select('id, title, status')
      .limit(4)

    if (data && data.length > 0) {
      setSidebarProjects(data)
    }
  }

  const fetchTeamMembers = async () => {
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('role, is_agent, is_active')

    if (profiles && profiles.length > 0) {
      // Conta solo i membri reali del team (escludendo gli agenti AI e disattivati)
      const realMembers = profiles.filter((p: any) => !p.is_agent && p.is_active !== false)
      setTeamCount(realMembers.length)
      const devs = realMembers.filter((p: any) => p.role === 'dev').length
      const admins = realMembers.filter((p: any) => p.role === 'admin').length
      const others = realMembers.length - devs - admins

      const parts = []
      if (devs > 0) parts.push(`${devs} Dev`)
      if (admins > 0) parts.push(`${admins} Admin`)
      if (others > 0) parts.push(`${others} Altri`)
      setTeamSubtitle(parts.join(' • ') || 'Team Attivo')
    }
  }

  const navGroups = [
    {
      label: 'Operatività',
      items: [
        {
          title: 'Lavori',
          subtitle: 'Kanban & Attività',
          href: '/lavori',
          icon: KanbanSquare,
          badge: null,
        },
        {
          title: 'Rubrica Clienti',
          subtitle: 'Anagrafica & Ricerca',
          href: '/clienti',
          icon: Users,
          badge: 'CRM',
        },
        {
          title: 'Calendario',
          subtitle: 'Scadenze & Eventi',
          href: '/calendario',
          icon: CalendarIcon,
          badge: null,
        },
        {
          title: 'Posta Condivisa',
          subtitle: 'Email del Dominio',
          href: '/posta',
          icon: Mail,
          badge: unreadEmailCount > 0 ? `${unreadEmailCount} Nuove` : null,
        },
        {
          title: 'Chat',
          subtitle: 'Messaggi Team',
          href: '/chat',
          icon: MessageSquare,
          badge: null,
        },
        {
          title: 'Videocall',
          subtitle: 'Stanza WebRTC',
          href: '/videocall',
          icon: Video,
          badge: 'Live',
        },
      ],
    },
    {
      label: 'Formazione',
      items: [
        {
          title: 'Corsi Formativi',
          subtitle: 'Lezioni, Zoom & Compiti',
          href: '/corsi',
          icon: GraduationCap,
          badge: 'Studenti',
        },
        {
          title: 'Zona Compiti',
          subtitle: 'Missioni & Attestati',
          href: '/zona-compiti',
          icon: Award,
          badge: 'Certificati',
        },
        {
          title: 'Servizi AI & Soluzioni',
          subtitle: 'Consulenza & Sviluppo PMI',
          href: '/servizi-ai',
          icon: Sparkles,
          badge: 'Soluzioni',
        },
        {
          title: 'Squadra Agenti AI',
          subtitle: 'Orchestratore Studio 3D',
          href: '/workshop-agenti',
          icon: Bot,
          badge: 'Studio AI',
        },
        ...(isAdmin
          ? [
              {
                title: 'Mira Lab',
                subtitle: 'Laboratorio Docente Agenti',
                href: '/workshop-agenti',
                icon: Cpu,
                badge: 'Admin',
              },
            ]
          : []),
      ],
    },
    {
      label: 'Progetti & Marketing',
      items: [
        {
          title: 'Marketing & Social Dispatch',
          subtitle: 'Lorenzo & Stefano • Autopilot',
          href: '/growth-studio',
          icon: Megaphone,
          badge: '1-Click',
        },
        {
          title: 'Video Studio Factory',
          subtitle: 'Neural Video & HyperFrames',
          href: `https://video.aiutiamoci.cloud/?auth_pin=2026&user=${userNameSlug}`,
          icon: Video,
          badge: 'Factory',
        },
      ],
    },
    {
      label: 'Risorse & Hub',
      items: [
        {
          title: 'File',
          subtitle: 'Documenti & Storage',
          href: '/files',
          icon: FolderOpen,
          badge: null,
        },
        {
          title: 'Secondo Cervello',
          subtitle: 'Prompt & Knowledge Hub',
          href: '/cervello',
          icon: Network,
          badge: 'Vault',
        },
        {
          title: 'Convertitore AI',
          subtitle: 'DocToMark • PDF, Word ⇆ MD',
          href: '/convert/',
          icon: FileCode2,
          badge: 'Tool',
        },
      ],
    },
  ]

  const renderSidebarInner = (expanded: boolean) => (
    <div className="flex-1 flex flex-col justify-between px-2.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
      <div className="space-y-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div
              className={cn(
                'px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-all duration-200',
                expanded ? 'opacity-100 h-4 mb-1' : 'opacity-0 h-0 overflow-hidden m-0'
              )}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const isExternal = item.href.startsWith('http')
              const isActive = !isExternal && (pathname === item.href || (item.href !== '/lavori' && pathname.startsWith(item.href)))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={() => {
                    if (isOpenMobile && onCloseMobile) onCloseMobile()
                  }}
                  title={!expanded ? item.title : undefined}
                  className={cn(
                    'group relative flex items-center rounded-xl py-2 font-medium transition-all duration-200',
                    expanded ? 'px-3 justify-between' : 'px-0 justify-center w-full',
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)] border border-blue-400/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700/60 border border-transparent'
                  )}
                >
                  {/* Neon Glow Active Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r shadow-[0_0_8px_#22d3ee]" />
                  )}

                  <div className={cn('flex items-center', expanded ? 'gap-3 min-w-0' : 'justify-center')}>
                    <div className="relative flex items-center justify-center">
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                        )}
                      />
                      {/* Compact Dot Badge when collapsed */}
                      {!expanded && item.badge && (
                        <span
                          className={cn(
                            'absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-slate-900',
                            item.badge === 'Live'
                              ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse'
                              : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                          )}
                        />
                      )}
                    </div>

                    {expanded && (
                      <div className="flex flex-col text-left min-w-0 animate-in fade-in duration-200">
                        <span className="text-xs leading-none flex items-center gap-1.5 font-semibold truncate text-slate-100">
                          {item.title}
                          {isExternal && <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-200 inline opacity-70 shrink-0" />}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] mt-0.5 leading-none truncate',
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          )}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    )}
                  </div>

                  {expanded && item.badge && (
                    <span
                      className={cn(
                        'text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap shrink-0 text-center transition-all animate-in fade-in duration-200',
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                          : item.badge === 'AI'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                          : isActive
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Quick Category Summary (solo se espansa) */}
      {expanded && (
        <div className="mt-6 pt-3 border-t border-slate-800/80 px-1 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Ambito Progetti</span>
            <Layers className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="space-y-1 text-xs">
            {sidebarProjects.map((p, idx) => (
              <div key={p.id || idx} className="flex items-center justify-between py-1 px-2 rounded bg-slate-800/40 text-slate-300">
                <span className="flex items-center gap-2 truncate">
                  <span className={`h-2 w-2 rounded-full ${idx % 3 === 0 ? 'bg-indigo-400' : idx % 3 === 1 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="truncate">{p.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-1">{p.status || 'Attivo'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team & User Footer con Logout e Pin Toggle */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
        {expanded ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 truncate">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-200">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200">Team ({teamCount})</span>
                <span className="text-[10px] text-slate-400 truncate">{teamSubtitle}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onTogglePin && (
                <button
                  onClick={onTogglePin}
                  title={isPinned ? 'Sblocca Dock fluida' : 'Fissa Sidebar aperta'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    isPinned ? 'text-cyan-400 bg-cyan-500/15' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  )}
                >
                  {isPinned ? <Pin className="h-3.5 w-3.5 rotate-45" /> : <PinOff className="h-3.5 w-3.5" />}
                </button>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
                title="Disconnetti / Esci"
                className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            {onTogglePin && (
              <button
                onClick={onTogglePin}
                title={isPinned ? 'Sblocca Dock' : 'Fissa Sidebar'}
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                <Pin className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              title="Disconnetti / Esci"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fluid Neon Dock Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'hidden md:flex md:flex-col fixed top-3 bottom-3 left-3 z-40',
          'bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)]',
          'transition-all duration-300 ease-out',
          isExpanded ? 'w-64 shadow-[0_15px_40px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20' : 'w-[68px]'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl transition-all duration-200 overflow-hidden',
            isExpanded ? 'px-4 gap-3' : 'justify-center px-0'
          )}
        >
          <Link href="/lavori" className="flex items-center gap-3 group">
            <img
              src="/images/logo_icon_dark.png"
              alt="AI Logo"
              className="h-8 w-8 object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in duration-200 truncate">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  aiutiamoci <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">Hub</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">Piattaforma & Corsi AI</span>
              </div>
            )}
          </Link>
        </div>
        {renderSidebarInner(isExpanded)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-slate-900 text-slate-100 border-r border-slate-800 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo_icon_dark.png"
                  alt="AI Logo"
                  className="h-9 w-9 object-contain shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-white">aiutiamoci</span>
                  <span className="text-[10px] text-slate-400">Piattaforma Condivisa</span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
                title="Chiudi Menu"
              >
                <span className="text-lg font-bold leading-none px-1">✕</span>
              </button>
            </div>
            {renderSidebarInner(true)}
          </aside>
        </div>
      )}
    </>
  )
}
