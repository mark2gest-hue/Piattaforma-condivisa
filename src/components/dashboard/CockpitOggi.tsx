'use client'

import React from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
} from 'lucide-react'
import { Task } from '@/types/index'

interface CockpitOggiProps {
  tasks: Task[]
  onFilterStatus?: (status: string) => void
  onFilterPriority?: (priority: string) => void
  userName?: string
}

export function CockpitOggi({
  tasks,
  onFilterStatus,
  onFilterPriority,
  userName = 'Marco',
}: CockpitOggiProps) {
  const now = new Date()

  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const reviewCount = tasks.filter((t) => t.status === 'review').length
  const doneCount = tasks.filter((t) => t.status === 'done').length

  const urgentCount = tasks.filter((t) => {
    const isUrgentPriority = t.priority === 'urgent'
    const isExpired =
      t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    return isUrgentPriority || isExpired
  }).length

  const resolvedName =
    userName && userName.toLowerCase().includes('gerelmo') ? 'Marco' : userName

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3.5">
      {/* Header compatto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h2
            className="text-sm sm:text-base font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            Buongiorno, {resolvedName}
          </h2>
          <span className="text-xs text-slate-500 dark:text-[#94a3b8]">
            · Cockpit Operativo
          </span>
        </div>

        {/* Stato Live Sobrio */}
        <div
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:text-[#94a3b8] self-start sm:self-auto px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0" />
          <span>SUPABASE &amp; AI CONNESSI</span>
        </div>
      </div>

      {/* 5 Metriche su una sola riga */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => onFilterPriority?.('urgent')}
          className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75 hover:border-[#6366f1]/50 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                urgentCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-[#94a3b8]'
              }`}
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Urgenti / Scaduti
            </span>
            <AlertCircle
              className={`w-3.5 h-3.5 shrink-0 ${
                urgentCount > 0
                  ? 'text-rose-500'
                  : 'text-slate-400 dark:text-[#94a3b8]'
              }`}
            />
          </div>
          <div
            className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {urgentCount}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterStatus?.('todo')}
          className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75 hover:border-[#6366f1]/50 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Da Fare
            </span>
            <ListTodo className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
          <div
            className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {todoCount}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterStatus?.('in_progress')}
          className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75 hover:border-[#6366f1]/50 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              In Corso
            </span>
            <Clock className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
          </div>
          <div
            className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {inProgressCount}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterStatus?.('review')}
          className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75 hover:border-[#6366f1]/50 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              In Revisione AI
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
          </div>
          <div
            className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {reviewCount}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onFilterStatus?.('done')}
          className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090d16]/75 hover:border-[#6366f1]/50 text-left transition-colors cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Completati
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          </div>
          <div
            className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {doneCount}
          </div>
        </button>
      </div>
    </div>
  )
}
