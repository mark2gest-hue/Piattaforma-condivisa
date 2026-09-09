'use client'

import React from 'react'
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
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

  const urgentCount = tasks.filter((t) => {
    const isUrgentPriority = t.priority === 'urgent'
    const isExpired = t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    return isUrgentPriority || isExpired
  }).length

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 md:p-5 shadow-xs space-y-3">
      {/* Saluto e Domanda Guida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Buongiorno, {userName}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                • Cockpit Operativo
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cosa richiede la tua attenzione oggi:
            </p>
          </div>
        </div>

        {/* Stato del Sistema Live */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistemi: Supabase & AI Connessi</span>
        </div>
      </div>

      {/* 4 Widget Metriche & Situazioni da Attenzionare */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Urgenti / Scadute */}
        <button
          onClick={() => onFilterPriority && onFilterPriority('urgent')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            urgentCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-400'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
              Urgente / Scaduti
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {urgentCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            {urgentCount > 0 ? 'Richiede azione immediata' : 'Nessuna scadenza critica'}
          </span>
        </button>

        {/* In Revisione AI / Team */}
        <button
          onClick={() => onFilterStatus && onFilterStatus('review')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            reviewCount > 0
              ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 hover:border-purple-400'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
              In Revisione AI
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {reviewCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            {reviewCount > 0 ? 'Pronti per approvazione' : 'Nessun task in attesa'}
          </span>
        </button>

        {/* Attività In Corso */}
        <button
          onClick={() => onFilterStatus && onFilterStatus('in_progress')}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-left hover:border-indigo-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
              In Corso
            </span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {inProgressCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Lavori attivi nel team
          </span>
        </button>

        {/* Da Fare */}
        <button
          onClick={() => onFilterStatus && onFilterStatus('todo')}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-left hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Da Fare
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {todoCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            In coda di assegnazione
          </span>
        </button>
      </div>
    </div>
  )
}
