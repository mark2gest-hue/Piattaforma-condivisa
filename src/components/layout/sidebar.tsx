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
  LifeBuoy,
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
import { BuildVersionBadge } from '@/components/layout/build-version-badge'
import { getOpenSupportTicketsCountAction } from '@/app/actions/support'
import { getChatUnreadSummaryAction } from '@/app/actions/chat'

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
  const [openSupportTicketsCount, setOpenSupportTicketsCount] = useState<number>(0)
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const isExpanded = isPinned || isHovered
  const [teamCount, setTeamCount] = useState<number>(3)
  const [teamSubtitle, setTeamSubtitle] = useState<string>('2 Dev • 1 Business')
  const [userNameSlug, setUserNameSlug] = useState<string>('marco')
  const [currentUserRole, setCurrentUserRole] = useState<string>('member')
  const supabase = createClient()

  // Definizione dei 4 Macro-Gruppi Fluidi
  const navGroups = [
    {
      id: 'operativita',
      label: 'CRM & Operatività',
      subtitle: 'Clienti, Lavori, Posta & Call',
      icon: Briefcase,
      items: [
        {
          title: 'Rubrica & CRM',
          subtitle: 'Anagrafica & Pipeline',
          href: '/clienti',
          icon: Users,
          badge: null,
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
          badge: unreadChatCount > 0
            ? `${unreadChatCount} ${unreadChatCount === 1 ? 'Nuovo' : 'Nuovi'}`
            : null,
        },
        {
          title: 'Assistenza',
          subtitle: 'Ticket Studenti & B2B',
          href: '/assistenza',
          icon: LifeBuoy,
          badge: openSupportTicketsCount > 0
            ? `${openSupportTicketsCount} ${openSupportTicketsCount === 1 ? 'Aperto' : 'Aperti'}`
            : null,
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
      items: [
        {
          title: 'Corsi Formativi',
          subtitle: 'Lezioni, Dispense & Registro',
          href: '/corsi',
          icon: GraduationCap,
          badge: null,
        },
        {
          title: 'Zona Compiti',
          subtitle: 'Missioni & Attestati',
          href: '/zona-compiti',
          icon: Award,
          badge: null,
        },
        {
          title: 'Squadra Agenti AI',
          subtitle: 'Orchestratore & Mira Lab 3D',
          href: '/workshop-agenti',
          icon: Bot,
          badge: null,
        },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing & Video',
      subtitle: 'Autopilot Social & Video AI',
      icon: Megaphone,
      items: [
        {
          title: 'Marketing & Social',
          subtitle: 'Lorenzo & Stefano • Autopilot',
          href: '/growth-studio',
          icon: Megaphone,
          badge: null,
        },
        {
          title: 'Video Studio Factory',
          subtitle: 'Neural Video & HyperFrames',
          href: `https://video.aiutiamoci.cloud/?auth_pin=2026&user=${userNameSlug}`,
          icon: Video,
          badge: null,
        },
      ],
    },
    {
      id: 'risorse',
      label: 'Risorse & Hub',
      subtitle: 'Secondo Cervello, File & Tool',
      icon: Network,
      items: [
        {
          title: 'Secondo Cervello',
          subtitle: 'Prompt & Knowledge Hub',
          href: '/cervello',
          icon: Network,
          badge: null,
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
          badge: null,
        },
      ],
    },
  ]

  // Filtro di isolamento Zero-Leak per Collaboratori Esterni (Guest / Collaborator)
  const visibleNavGroups = navGroups
    .map((group) => {
      if (currentUserRole !== 'collaborator') return group
      const filteredItems = group.items.filter((item) =>
        ['/lavori', '/calendario', '/chat', '/videocall', '/files'].some((allowed) =>
          item.href === allowed || item.href.startsWith(allowed + '/')
        )
      )
      return { ...group, items: filteredItems }
    })
    .filter((group) => group.items.length > 0)

  // Calcola il gruppo a cui appartiene la pagina corrente
  const activeGroup = visibleNavGroups.find((g) =>
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

  const fetchOpenSupportTickets = async () => {
    try {
      const res = await getOpenSupportTicketsCountAction()
      if (res.success) {
        setOpenSupportTicketsCount(res.openCount)
      }
    } catch {
      // ignore
    }
  }

  const fetchUnreadChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setUnreadChatCount(0)
        return
      }
      let lastReadMap: Record<string, string> = {}
      try {
        lastReadMap = JSON.parse(
          localStorage.getItem(`aiutiamoci_chat_last_read_${user.id}`) || '{}'
        )
      } catch {
        lastReadMap = {}
      }
      const res = await getChatUnreadSummaryAction(lastReadMap)
      if (res.success) {
        setUnreadChatCount(res.totalUnread)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchUnreadEmails()
    fetchTeamMembers()
    fetchOpenSupportTickets()
    fetchUnreadChat()

    const checkUserSlug = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()

        const role =
          user.user_metadata?.role === 'collaborator'
            ? 'collaborator'
            : profile?.role || user.user_metadata?.role || 'member'
        setCurrentUserRole(role)

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

    const handleChatReadEvent = () => {
      fetchUnreadChat()
    }
    window.addEventListener('aiutiamoci:chat-read', handleChatReadEvent)

    // Realtime subscription per nuove email, ticket assistenza, chat e modifiche profilo team
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchOpenSupportTickets()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchUnreadChat()
      )
      .subscribe()

    return () => {
      window.removeEventListener('aiutiamoci:chat-read', handleChatReadEvent)
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    fetchUnreadChat()
    if (currentUserRole === 'collaborator') {
      setOpenSupportTicketsCount(0)
      return
    }
    fetchOpenSupportTickets()
  }, [pathname, currentUserRole])

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

  const operativitaUnread =
    currentUserRole === 'collaborator'
      ? unreadChatCount
      : unreadEmailCount + openSupportTicketsCount + unreadChatCount

  const renderSidebarInner = (expanded: boolean) => (
    <div className="flex-1 flex flex-col justify-between px-2.5 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
      {/* SE LA SIDEBAR È COLLASSATA (expanded = false): Mostra le 4 Macro-Icone in colonna */}
      {!expanded ? (
        <div className="flex flex-col items-center gap-3 pt-2">
          {visibleNavGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupActive = group.id === activeGroupId
            const hasUnread = group.id === 'operativita' && operativitaUnread > 0

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
                  'relative flex h-11 w-11 items-center justify-center rounded-md transition-colors duration-200 group',
                  isGroupActive
                    ? 'bg-[#1f1f24] text-[#f4f4f5] border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-[#f4f4f5] hover:bg-[#18181c] border border-transparent'
                )}
              >
                <GroupIcon
                  className={cn(
                    'h-5 w-5 transition-colors duration-200',
                    isGroupActive ? 'text-[#f4f4f5]' : 'text-zinc-400 group-hover:text-[#f4f4f5]'
                  )}
                />
                {/* Active Indicator Bar */}
                {isGroupActive && (
                  <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#6366f1] rounded-r" />
                )}
                {/* Notification Badge */}
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#111113]" />
                )}
              </button>
            )
          })}
        </div>
      ) : (
        /* SE LA SIDEBAR È ESPANSA (expanded = true): Mostra i Macro-Gruppi con Header e Sotto-Voci Fluide */
        <div className="space-y-2">
          {visibleNavGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupOpen = openGroupId === group.id
            const isGroupActive = group.id === activeGroupId
            const hasUnread = group.id === 'operativita' && operativitaUnread > 0

            return (
              <div
                key={group.id}
                onMouseEnter={() => setOpenGroupId(group.id)}
                className={cn(
                  'rounded-md border transition-colors duration-200 overflow-hidden',
                  isGroupOpen
                    ? 'bg-[#18181c] border-white/[0.08]'
                    : 'bg-transparent border-transparent hover:bg-[#18181c]/70'
                )}
              >
                {/* Header Card di Gruppo */}
                <button
                  onClick={() => setOpenGroupId(isGroupOpen ? '' : group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2.5 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                        isGroupActive
                          ? 'bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/35'
                          : 'bg-[#1f1f24] text-zinc-400 border-white/[0.08] group-hover:text-[#f4f4f5]'
                      )}
                    >
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          'text-xs font-semibold leading-tight truncate',
                          isGroupActive ? 'text-[#f4f4f5]' : 'text-[#f4f4f5]/85 group-hover:text-[#f4f4f5]'
                        )}
                      >
                        {group.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 leading-tight truncate">
                        {group.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {hasUnread && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {operativitaUnread}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isGroupOpen ? 'rotate-180 text-[#6366f1]' : 'text-zinc-400 group-hover:text-[#f4f4f5]'
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
                    <div className="space-y-1 px-2 pb-2 pt-1.5 border-t border-white/[0.08] mx-2">
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
                              'group/item relative flex items-center justify-between rounded-md px-2.5 py-1.5 transition-colors duration-150 border',
                              isActive
                                ? 'bg-[#1f1f24] text-[#f4f4f5] border-white/[0.08] font-semibold'
                                : 'text-zinc-400 hover:bg-[#1f1f24]/80 hover:text-[#f4f4f5] border-transparent'
                            )}
                          >
                            {/* Barretta netta laterale su voce attiva */}
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#6366f1] rounded-r" />
                            )}

                            <div className="flex items-center gap-2.5 min-w-0">
                              <ItemIcon
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-colors duration-150',
                                  isActive ? 'text-[#6366f1]' : 'text-zinc-400 group-hover/item:text-[#f4f4f5]'
                                )}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold leading-tight text-[#f4f4f5] truncate flex items-center gap-1">
                                  {item.title}
                                  {isExternal && (
                                    <ExternalLink className="h-3 w-3 text-zinc-400 group-hover/item:text-[#f4f4f5] inline opacity-75 shrink-0" />
                                  )}
                                </span>
                                <span
                                  className={cn(
                                    'text-[10px] leading-tight truncate',
                                    isActive ? 'text-[#f4f4f5]/75' : 'text-zinc-400'
                                  )}
                                >
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>

                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[9px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wider whitespace-nowrap shrink-0 text-center ml-2 border',
                                  (item.href === '/assistenza' && openSupportTicketsCount > 0) ||
                                    (item.href === '/posta' && unreadEmailCount > 0) ||
                                    (item.href === '/chat' && unreadChatCount > 0)
                                    ? 'bg-rose-600 text-white border-rose-400/50'
                                    : item.badge === 'Live'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                      : 'bg-[#1f1f24] text-[#f4f4f5] border-white/[0.08]'
                                )}
                                style={{ fontFamily: 'var(--font-mono), monospace' }}
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
      <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2">
        {expanded ? (
          <div className="flex items-center justify-between p-2 rounded-md bg-[#18181c] border border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1f1f24] border border-white/[0.08] text-[#f4f4f5]">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#f4f4f5] truncate">Team ({teamCount})</span>
                <span className="text-[10px] text-zinc-400 truncate">{teamSubtitle}</span>
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
                      ? 'text-[#6366f1] bg-[#6366f1]/15'
                      : 'text-zinc-400 hover:text-[#f4f4f5] hover:bg-[#1f1f24]'
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
                className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                className="p-2 rounded-md text-zinc-400 hover:text-[#6366f1] hover:bg-[#18181c] transition-colors cursor-pointer"
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
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        <BuildVersionBadge
          compact={!expanded}
          className="w-full justify-center px-1.5 bg-[#18181c] text-zinc-400 border-white/[0.08]"
        />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Slim Dock Sidebar (w-[68px] collassata -> w-64 espansa, dorsale flush a filo sinistro) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setOpenGroupId(activeGroupId)
        }}
        className={cn(
          'hidden md:flex md:flex-col fixed top-0 bottom-0 left-0 z-40',
          'bg-[#111113] border-r border-white/[0.08]',
          'transition-all duration-300 ease-out',
          isExpanded ? 'w-64' : 'w-[68px]',
          isHovered && !isPinned && 'shadow-[12px_0_32px_rgba(0,0,0,0.45)]'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center h-14 border-b border-white/[0.08] bg-[#111113] transition-all duration-200 overflow-hidden shrink-0',
            isExpanded ? 'px-4 gap-3' : 'justify-center px-0'
          )}
        >
          <Link href="/lavori" className="flex items-center gap-3 group min-w-0">
            <img
              src="/images/brand/icon-dark.svg"
              alt="AIutiamoci"
              className="h-8 w-8 object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {isExpanded && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-sm tracking-tight text-[#f4f4f5]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    <span className="text-[#6366f1]">AI</span>utiamoci
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.14em] text-zinc-400 border border-white/[0.12] px-1.5 py-0.5 rounded-sm"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    WORKSPACE
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium truncate">
                  Piattaforma &amp; Corsi AI
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
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <aside className="relative flex flex-col w-64 max-w-[85vw] h-full bg-[#111113] text-[#f4f4f5] border-r border-white/[0.08] z-10 shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08] bg-[#111113] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/images/brand/icon-dark.svg"
                  alt="AIutiamoci"
                  className="h-8 w-8 object-contain shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm tracking-tight text-[#f4f4f5]"
                      style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                      <span className="text-[#6366f1]">AI</span>utiamoci
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-[0.14em] text-zinc-400"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      WORKSPACE
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Piattaforma Condivisa</span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-zinc-400 hover:text-[#f4f4f5] rounded-md bg-[#18181c] cursor-pointer"
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
