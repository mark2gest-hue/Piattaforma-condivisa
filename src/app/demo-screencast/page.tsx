'use client'

import { useState, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Activity,
  Workflow,
  Search,
  Check,
  Play,
  FileCode2,
  Server,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DemoScreencastPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([
    '[00:01] ⚡ Nemotron Autonomous Agent initialized on node #1',
    '[00:03] 🎯 Target received: "Analisi Lead B2B & Generazione Offerta su Misura"',
    '[00:05] 📡 Connecting to Supabase Cloud DB: table `waitlist_leads`...',
  ])

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setActiveStep(1)
      setLogs((prev) => [
        ...prev,
        '[00:09] 🔍 Query executed: 24 new B2B leads detected with status "pending"',
        '[00:12] 🤖 Parsing business intent & company profile: Studio Rossi & Partners',
      ])
    }, 4000)

    const timer2 = setTimeout(() => {
      setActiveStep(2)
      setLogs((prev) => [
        ...prev,
        '[00:18] ⚡ Multi-Tool Dispatch: Resend API + Knowledge Vault RCCF Template',
        '[00:22] 📋 Task updated in Kanban: moved from "Da Fare" -> "In Corso"',
        '[00:26] 📄 Commercial proposal draft generated (584 words, 0 errors)',
      ])
    }, 10000)

    const timer3 = setTimeout(() => {
      setActiveStep(3)
      setLogs((prev) => [
        ...prev,
        '[00:30] 🚀 Human-in-the-Loop review triggered -> status set to "In Revisione AI/Team"',
        '[00:34] 🔔 Telegram notification sent to Team Group: "Offerta pronta per approvazione"',
        '[00:38] ✅ Autonomous cycle completed. Agent waiting for next trigger 24/7.',
      ])
    }, 18000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">
                NEXUS AI • Autonomous Command Center
              </span>
              <Badge variant="purple" className="text-[10px] font-mono px-2.5 py-0.5 animate-pulse bg-purple-500/20 text-purple-300 border-purple-500/30">
                LIVE PRODUCTION
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Corso 2: AI Pro — Orchestrazione Agenti Autonomi, Database Supabase & Tool Use 24/7
            </p>
          </div>
        </div>

        {/* Realtime KPI Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-mono">Agent Status:</span>
            <span className="text-emerald-400 font-bold font-mono">EXECUTING (NEMOTRON 550B)</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="text-xs font-mono text-slate-400">
            Uptime: <span className="text-white font-bold">99.98% (24/7)</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Kanban + Architecture Flow + Realtime Agent Terminal */}
      <main className="grid grid-cols-12 gap-6 my-auto py-6">
        {/* Left Column: Real Kanban Board Simulation (6 Cols) */}
        <div className="col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Bacheca Operativa Kanban • Agente Autonomo
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">4 Colonne Realtime</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Col 1: Da Fare */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Da Fare
                </span>
                <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">1</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-2 opacity-70">
                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-400">Routine</Badge>
                <h4 className="text-xs font-bold text-slate-300">Sync Settimanale Calendario</h4>
                <p className="text-[10px] text-slate-500">Aggiornamento automatico scadenze</p>
              </div>
            </div>

            {/* Col 2: In Corso (Nemotron) */}
            <div className="bg-purple-950/20 rounded-2xl border border-purple-500/40 p-3 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between pb-2 border-b border-purple-900/40 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  In Corso (AI)
                </span>
                <span className="font-mono text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200">1</span>
              </div>

              {/* Active Agent Card */}
              <div className="bg-slate-900/90 border border-purple-500/50 rounded-xl p-3.5 space-y-2.5 shadow-lg shadow-purple-950/50 transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" className="text-[9px] gap-1 px-1.5 py-0 bg-purple-600/30 text-purple-300 border-purple-500/50">
                    <Bot className="h-2.5 w-2.5" />
                    Nemotron Lead Agent
                  </Badge>
                  <span className="text-[10px] font-mono text-purple-400 animate-pulse">Running...</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  Analisi Lead B2B & Bozza Offerta Personalizzata
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Interrogazione DB Supabase, estrazione requisiti e redazione proposta automatica.
                </p>
                <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Priority: ⚡ Alta</span>
                  <span className="text-purple-300">Tokens: 1,420</span>
                </div>
              </div>
            </div>

            {/* Col 3: In Revisione (Human-in-the-Loop) */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  In Revisione
                </span>
                <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">1</span>
              </div>

              <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-3 space-y-2">
                <Badge variant="outline" className="text-[9px] border-indigo-500/40 text-indigo-300">Da Approvare</Badge>
                <h4 className="text-xs font-bold text-slate-200">Reel Marketing Settimana #37</h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Pronto per Telegram Team
                </div>
              </div>
            </div>
          </div>

          {/* Real n8n Workflow Canvas Visualizer */}
          <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-xs">
                  <Workflow className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                  n8n Workflow Automation Canvas
                  <span className="text-[10px] font-mono text-orange-400 font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                    https://n8n.mark2.cloud
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Workflow Active & Listening</span>
              </div>
            </div>

            {/* n8n Node Canvas Pipeline with Real Glowing Connected Nodes */}
            <div className="grid grid-cols-5 gap-2.5 items-center pt-1 font-mono text-xs">
              {/* Node 1: Webhook Trigger */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center space-y-1 relative group hover:border-orange-500 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10px] text-orange-400 font-bold">
                  <Zap className="h-3 w-3 text-orange-400" />
                  <span>Webhook</span>
                </div>
                <span className="font-bold text-white text-[11px] block truncate">Iscrizione Lead</span>
                <span className="text-[9px] text-slate-500 block font-sans">POST /webhook</span>
              </div>

              {/* Node 2: n8n Switch / Router */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center space-y-1 relative group hover:border-orange-500 transition-all">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold">
                  <Workflow className="h-3 w-3 text-amber-400" />
                  <span>n8n Switch</span>
                </div>
                <span className="font-bold text-white text-[11px] block truncate">Triage & Filtro</span>
                <span className="text-[9px] text-slate-500 block font-sans">Anti-Spam B2B</span>
              </div>

              {/* Node 3: AI Agent Node (Gemini 2.5 Flash) */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500 text-center space-y-1 relative shadow-lg shadow-purple-950/50">
                <div className="flex items-center justify-center gap-1 text-[10px] text-purple-300 font-bold">
                  <Bot className="h-3 w-3 text-purple-400" />
                  <span>Gemini Agent</span>
                </div>
                <span className="font-bold text-white text-[11px] block truncate">Analisi & Task</span>
                <span className="text-[9px] text-purple-300 block font-sans">Prompt RCCF</span>
              </div>

              {/* Node 4: Supabase Cloud Database */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-blue-500/50 text-center space-y-1 relative">
                <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400 font-bold">
                  <Database className="h-3 w-3 text-blue-400" />
                  <span>Supabase</span>
                </div>
                <span className="font-bold text-white text-[11px] block truncate">Archiviazione DB</span>
                <span className="text-[9px] text-slate-500 block font-sans">PostgreSQL RLS</span>
              </div>

              {/* Node 5: Output Dispatcher */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500 text-center space-y-1 relative">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Dispatch</span>
                </div>
                <span className="font-bold text-white text-[11px] block truncate">Telegram & Resend</span>
                <span className="text-[9px] text-emerald-300 block font-sans">Azione Eseguita</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Autonomous Terminal & Output Monitor (5 Cols) */}
        <div className="col-span-5 bg-slate-950/95 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl font-mono text-xs">
          {/* Terminal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] text-slate-400 font-bold ml-2">n8n-worker-daemon.log</span>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono border-orange-500/40 text-orange-400">
              n8n v2.8.4
            </Badge>
          </div>

          {/* Terminal Log Stream */}
          <div className="space-y-2 py-4 flex-1 overflow-hidden">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`leading-relaxed animate-in fade-in slide-in-from-bottom-1 ${
                  log.includes('✅')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('⚡') || log.includes('🤖')
                    ? 'text-purple-300'
                    : log.includes('🔍') || log.includes('n8n')
                    ? 'text-orange-300'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-orange-400 font-bold pt-1">
              <span className="animate-pulse">❯</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>

          {/* Bottom Card: Human in the loop confirmation */}
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-purple-300 font-bold">
              <span>n8n + KANBAN ORCHESTRATION</span>
              <span className="text-emerald-400">SYNCED</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              I webhook n8n intercettano gli eventi, gli agenti elaborano e aggiornano la bacheca in tempo reale.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>
          <span>TI AIUTO • Corso 2: AI Pro & Agenti Autonomi</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-purple-400">Zero Prompt Manuali</span>
          <span>•</span>
          <span className="text-emerald-400">Sistemi 24/7 Operativi</span>
        </div>
      </footer>
    </div>
  )
}
