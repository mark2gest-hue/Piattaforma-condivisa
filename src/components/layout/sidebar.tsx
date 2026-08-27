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
  Bot,
  GraduationCap,
  Network,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0)
  const [sidebarProjects, setSidebarProjects] = useState<Array<{ id: string; title: string; status: string }>>([
    { id: '1', title: 'Corsi Formativi', status: 'Attivo' },
    { id: '2', title: 'Consulenze B2B', status: 'In corso' },
    { id: '3', title: 'Agenti AI Dev', status: 'Sprint' },
  ])
  const supabase = createClient()

  useEffect(() => {
    fetchUnreadEmails()
    fetchProjects()

    const channel = supabase
      .channel('sidebar:changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emails' },
        () => {
          fetchUnreadEmails()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchProjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, title, status').order('created_at', { ascending: true })
    if (data && data.length > 0) {
      setSidebarProjects(data.map((p: any) => ({
        id: p.id,
        title: p.title ? p.title.replace(/^[^\w\s]*\s*/, '') : 'Progetto',
        status: p.status === 'active' ? 'Attivo' : p.status || 'Attivo',
      })))
    }
  }

  const fetchUnreadEmails = async () => {
    const { count, error } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'received')

    if (!error && count !== null) {
      setUnreadEmailCount(count)
    }
  }

  const navItems = [
    {
      title: 'Lavori',
      subtitle: 'Kanban & Attività',
      href: '/lavori',
      icon: KanbanSquare,
      badge: null,
    },
    {
      title: 'Corsi & Studenti',
      subtitle: 'Catalogo & Iscritti',
      href: '/corsi',
      icon: GraduationCap,
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
      badge: unreadEmailCount > 0 ? String(unreadEmailCount) : null,
    },
    {
      title: 'Chat',
      subtitle: 'Messaggi Team',
      href: '/chat',
      icon: MessageSquare,
      badge: null,
    },
    {
      title: 'File',
      subtitle: 'Documenti & Risorse',
      href: '/files',
      icon: FolderOpen,
      badge: null,
    },
    {
      title: 'Videocall',
      subtitle: 'Stanza WebRTC',
      href: '/videocall',
      icon: Video,
      badge: 'Live',
    },
    {
      title: 'Secondo Cervello',
      subtitle: 'Prompt & Knowledge Hub',
      href: '/cervello',
      icon: Network,
      badge: 'Vault',
    },
    {
      title: 'Marketing & Campagne',
      subtitle: 'APEX • Funnel & Social',
      href: '/marketing',
      icon: Megaphone,
      badge: 'Growth',
    },
    {
      title: 'Agenti AI',
      subtitle: 'Assistenti & Automazioni',
      href: '/agenti',
      icon: Bot,
      badge: 'AI',
    },
  ]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            Team Hub <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">v1.0</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Corsi • Consulenze • AI</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col justify-between px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Aree di Lavoro
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/lavori' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm leading-none">{item.title}</span>
                    <span
                      className={cn(
                        'text-[10px] mt-0.5 leading-none',
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
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      item.badge === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                        : item.badge === 'AI'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600 text-white'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Quick Category Summary */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 space-y-2">
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

        {/* Team Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 px-1">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-slate-200">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200">Team (4 Membri)</span>
              <span className="text-[10px] text-slate-400">2 Dev • 2 Business</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
