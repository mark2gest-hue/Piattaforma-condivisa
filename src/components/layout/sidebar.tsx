'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Users,
  KanbanSquare,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
  Video,
  GraduationCap,
  Award,
  Bot,
  Megaphone,
  Network,
  FolderOpen,
  FileCode2,
  ExternalLink,
  ChevronDown,
  LogOut,
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
  const [teamCount, setTeamCount] = useState<number>(3)
  const [teamSubtitle, setTeamSubtitle] = useState<string>('2 Dev • 1 Business')
  const [userNameSlug, setUserNameSlug] = useState<string>('marco')
  const supabase = createClient()

  // Definizione dei 4 Macro-Gruppi Fluidi
  const navGroups = [
    {
      id: 'operativita',
      label: 'CRM & Operatività',
      subtitle: 'Clienti, Lavori, Posta & Call',
      icon: Briefcase,
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30',
      activeColor: 'bg-blue-600/90 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]',
      items: [
        {
          title: 'Rubrica & CRM',
          subtitle: 'Anagrafica & Pipeline',
          href: '/clienti',
          icon: Users,
          badge: 'CRM',
        },
        {
          title: 'Lavori',
          subtitle: 'Kanban & Attività',
          href: '/lavori',
          icon: KanbanSquare,
          badge: null,
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
      id: 'formazione',
      label: 'Formazione Academy',
      subtitle: 'Corsi, Compiti & Agenti 3D',
      icon: GraduationCap,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      activeColor: 'bg-purple-600/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      items: [
        {
          title: 'Corsi Formativi',
          subtitle: 'Lezioni, Dispense & Registro',
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
          title: 'Squadra Agenti AI',
          subtitle: 'Orchestratore & Mira Lab 3D',
          href: '/workshop-agenti',
          icon: Bot,
          badge: 'Studio AI',
        },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing & Video',
      subtitle: 'Autopilot Social & Video AI',
      icon: Megaphone,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      activeColor: 'bg-amber-600/90 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      items: [
        {
          title: 'Marketing & Social',
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
      id: 'risorse',
      label: 'Risorse & Hub',
      subtitle: 'Secondo Cervello, File & Tool',
      icon: Network,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      activeColor: 'bg-emerald-600/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      items: [
        {
          title: 'Secondo Cervello',
          subtitle: 'Prompt & Knowledge Hub',
          href: '/cervello',
          icon: Network,
          badge: 'Vault',
        },
        {
          title: 'File & Documenti',
          subtitle: 'Archivio Cloud & Storage',
          href: '/files',
          icon: FolderOpen,
          badge: null,
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

  // Calcola il gruppo a cui appartiene la pagina corrente
  const activeGroup = navGroups.find((g) =>
    g.items.some((item) =>
      item.href.startsWith('http')
        ? false
        : pathname === item.href || (item.href !== '/lavori' && pathname.startsWith(item.href))
    )
  )
  const activeGroupId = activeGroup?.id || 'operativita'

  // Stato del gruppo attualmente aperto (espanso)
  const [openGroupId, setOpenGroupId] = useState<string>(activeGroupId)

  // Sincronizza il gruppo aperto quando cambia la pagina
  useEffect(() => {
    if (activeGroupId) {
      setOpenGroupId(activeGroupId)
    }
  }, [pathname, activeGroupId])

  // Chiudi drawer al cambio pagina su mobile
  useEffect(() => {
    if (isOpenMobile && onCloseMobile) {
      onCloseMobile()
    }
  }, [pathname])

  useEffect(() => {
    fetchUnreadEmails()
    fetchTeamMembers()

    const checkUserSlug = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

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
    checkUserSlug()

    // Realtime subscription per nuove email e modifiche profilo team
    const channel = supabase
      .channel('sidebar-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_emails' },
        () => fetchUnreadEmails()
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

  const fetchTeamMembers = async () => {
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('role, is_agent, is_active')

    if (profiles && profiles.length > 0) {
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

  const renderSidebarInner = (expanded: boolean) => (
    <div className="flex-1 flex flex-col justify-between px-2.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
      {/* SE LA SIDEBAR È COLLASSATA (expanded = false): Mostra le 4 Macro-Icone in colonna */}
      {!expanded ? (
        <div className="flex flex-col items-center gap-3 pt-2">
          {navGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupActive = group.id === activeGroupId
            const hasUnread = group.id === 'operativita' && unreadEmailCount > 0

            return (
              <button
                key={group.id}
                onClick={() => {
                  setIsHovered(true)
                  setOpenGroupId(group.id)
                }}
                onMouseEnter={() => {
                  setIsHovered(true)
                  setOpenGroupId(group.id)
                }}
                title={`${group.label} • ${group.subtitle}`}
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 group',
                  isGroupActive
                    ? 'bg-blue-600/90 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)] border border-blue-400/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                )}
              >
                <GroupIcon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                    isGroupActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                  )}
                />
                {/* Active Indicator Bar */}
                {isGroupActive && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r shadow-[0_0_8px_#22d3ee]" />
                )}
                {/* Notification Badge */}
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] ring-2 ring-slate-900 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      ) : (
        /* SE LA SIDEBAR È ESPANSA (expanded = true): Mostra i 4 Macro-Gruppi con Header e Sotto-Voci Fluide */
        <div className="space-y-2.5">
          {navGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupOpen = openGroupId === group.id
            const isGroupActive = group.id === activeGroupId
            const hasUnread = group.id === 'operativita' && unreadEmailCount > 0

            return (
              <div
                key={group.id}
                onMouseEnter={() => setOpenGroupId(group.id)}
                className={cn(
                  'rounded-xl border transition-all duration-200 overflow-hidden',
                  isGroupOpen
                    ? 'bg-slate-950/50 border-slate-700/60 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-slate-800/40'
                )}
              >
                {/* Header Card di Gruppo */}
                <button
                  onClick={() => setOpenGroupId(isGroupOpen ? '' : group.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors group cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                        isGroupActive
                          ? 'bg-blue-600/30 text-cyan-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-800/70 text-slate-400 border-slate-700/50 group-hover:text-slate-200'
                      )}
                    >
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          'text-xs font-bold leading-tight truncate',
                          isGroupActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        )}
                      >
                        {group.label}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight truncate">
                        {group.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {hasUnread && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                        {unreadEmailCount}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-400 transition-transform duration-200',
                        isGroupOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                  </div>
                </button>

                {/* Sotto-Menu Fluido con animazione Grid a 60fps */}
                <div
                  className={cn(
                    'grid transition-all duration-200 ease-out',
                    isGroupOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 px-2 pb-2 pt-1 border-t border-slate-800/60 ml-2 mr-2">
                      {group.items.map((item) => {
                        const isExternal = item.href.startsWith('http')
                        const isActive =
                          !isExternal &&
                          (pathname === item.href ||
                            (item.href !== '/lavori' && pathname.startsWith(item.href)))
                        const ItemIcon = item.icon

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            onClick={() => {
                              if (isOpenMobile && onCloseMobile) onCloseMobile()
                            }}
                            className={cn(
                              'group/item relative flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-all duration-150',
                              isActive
                                ? 'bg-blue-600/90 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400/40 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                            )}
                          >
                            {/* Glow bar laterale su voce attiva */}
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-400 rounded-r shadow-[0_0_6px_#22d3ee]" />
                            )}

                            <div className="flex items-center gap-2.5 min-w-0">
                              <ItemIcon
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-transform duration-150 group-hover/item:scale-110',
                                  isActive ? 'text-white' : 'text-slate-400 group-hover/item:text-cyan-300'
                                )}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold leading-tight text-slate-100 truncate flex items-center gap-1">
                                  {item.title}
                                  {isExternal && (
                                    <ExternalLink className="h-3 w-3 text-slate-400 group-hover/item:text-slate-200 inline opacity-70 shrink-0" />
                                  )}
                                </span>
                                <span
                                  className={cn(
                                    'text-[10px] leading-tight truncate',
                                    isActive ? 'text-blue-100' : 'text-slate-400'
                                  )}
                                >
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>

                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap shrink-0 text-center ml-2',
                                  item.badge === 'Live'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                                    : isActive
                                    ? 'bg-white text-blue-600 shadow-xs'
                                    : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Team & User Footer con Pin e Logout */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
        {expanded ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-200">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">Team ({teamCount})</span>
                <span className="text-[10px] text-slate-400 truncate">{teamSubtitle}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onTogglePin && (
                <button
                  onClick={onTogglePin}
                  title={isPinned ? 'Sblocca Dock fluida' : 'Fissa Sidebar aperta'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors cursor-pointer',
                    isPinned
                      ? 'text-cyan-400 bg-cyan-500/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
                className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
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
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
      {/* Desktop Fluid Neon Dock Sidebar (w-[68px] collassata -> w-72 espansa) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setOpenGroupId(activeGroupId)
        }}
        className={cn(
          'hidden md:flex md:flex-col fixed top-3 bottom-3 left-3 z-40',
          'bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)]',
          'transition-all duration-300 ease-out',
          isExpanded
            ? 'w-72 shadow-[0_15px_40px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20'
            : 'w-[68px]'
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
                  aiutiamoci{' '}
                  <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">
                    Hub
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  Piattaforma & Corsi AI
                </span>
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
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 cursor-pointer"
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
