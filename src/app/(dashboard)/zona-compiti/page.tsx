'use client'

import React from 'react'
import { StudentTasksZone } from '@/app/workshop-agenti/components/StudentTasksZone'

export default function ZonaCompitiPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <span>🎓</span>
          <span>Zona Compiti Personale & Certificazioni</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          La tua area formativa riservata. Esegui le 5 missioni del tuo corso, ricevi la valutazione di Mira in tempo reale e sblocca il tuo Attestato Ufficiale.
        </p>
      </div>

      <StudentTasksZone provider="gemini" />
    </div>
  )
}
