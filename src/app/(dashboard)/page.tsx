'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/lavori')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <span className="text-xs text-slate-400">Reindirizzamento a /lavori...</span>
    </div>
  )
}
