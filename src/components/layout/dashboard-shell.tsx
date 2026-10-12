'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'

interface DashboardShellProps {
  userName: string
  userRole: string
  userEmail: string
  avatarUrl: string | null
  children: React.ReactNode
}

export function DashboardShell({
  userName,
  userRole,
  userEmail,
  avatarUrl,
  children,
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)

  // Load pinned state preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_pinned')
    if (saved === 'true') {
      setIsSidebarPinned(true)
    }
  }, [])

  const togglePin = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_pinned', String(next))
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar: Desktop fluid neon dock e Mobile drawer */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isPinned={isSidebarPinned}
        onTogglePin={togglePin}
      />

      {/* Main Content Area: guadagna ~180px di spazio orizzontale in modalità dock (pl-20) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out ${
          isSidebarPinned ? 'md:pl-68' : 'md:pl-[84px]'
        }`}
      >
        <Navbar
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
