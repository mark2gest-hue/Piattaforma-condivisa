'use client'

import { Bell, Search, PlusCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavbarProps {
  userRole?: string
  userName?: string
  userEmail?: string
}

export function Navbar({
  userRole = 'dev',
  userName = 'Marco (Dev)',
  userEmail = 'marco@team.domain.com',
}: NavbarProps) {
  return (
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

      {/* Center Quick Search (Simulated for MVP) */}
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
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Quick New Task / Item */}
        <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
          <PlusCircle className="h-4 w-4" />
          <span>Nuova Attività</span>
        </Button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifiche"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Avatar
            fallback={userName}
            className="h-8 w-8 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-semibold border-blue-200 dark:border-blue-800"
          />
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{userName}</span>
              <Badge
                variant={userRole === 'dev' ? 'purple' : 'info'}
                className="text-[9px] px-1.5 py-0 uppercase"
              >
                {userRole}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight mt-0.5">{userEmail}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
