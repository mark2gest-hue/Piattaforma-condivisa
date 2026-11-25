'use client'

import React from 'react'
import { GraduationCap } from 'lucide-react'
import { StudentTasksZone } from '@/app/workshop-agenti/components/StudentTasksZone'

export default function ZonaCompitiPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#e5e3dc] dark:border-white/[0.08] pb-4">
        <h1 className="text-2xl font-bold text-[#111113] dark:text-[#f4f4f5] tracking-tight flex items-center gap-2.5 font-[family-name:var(--font-jakarta)]">
          <GraduationCap className="w-6 h-6 text-[#6366f1] shrink-0" />
          <span>Zona Compiti Personale & Certificazioni</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          La tua area formativa riservata. Esegui le 5 missioni del tuo corso, ricevi la valutazione di Mira in tempo reale e sblocca il tuo Attestato Ufficiale.
        </p>
      </div>

      <StudentTasksZone provider="gemini" />
    </div>
  )
}
