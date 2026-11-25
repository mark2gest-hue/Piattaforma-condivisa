'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isFullBleedView =
    pathname?.startsWith('/chat') ||
    pathname?.startsWith('/assistenza') ||
    pathname?.startsWith('/lavori') ||
    pathname?.startsWith('/clienti') ||
    pathname?.startsWith('/calendario') ||
    pathname?.startsWith('/posta') ||
    pathname?.startsWith('/cervello') ||
    pathname?.startsWith('/files') ||
    pathname?.startsWith('/videocall')
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
    <div
      className={`${
        isFullBleedView ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      } bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5] flex transition-colors duration-200`}
    >
      {/* Sidebar: Dorsale architettonica flush a filo sinistro e Mobile drawer */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isPinned={isSidebarPinned}
        onTogglePin={togglePin}
      />

      {/* Main Content Area: allineata alla sidebar flush */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out ${
          isSidebarPinned ? 'md:pl-64' : 'md:pl-[68px]'
        } ${isFullBleedView ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''}`}
      >
        <Navbar
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main
          className={
            isFullBleedView
              ? 'flex-1 min-h-0 p-0 overflow-hidden w-full'
              : 'flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto'
          }
        >
          {children}
        </main>
      </div>
    </div>
  )
}
