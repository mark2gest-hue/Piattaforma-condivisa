'use client'

import {
  Workflow,
  Zap,
  Bot,
  Database,
  Send,
  CheckCircle2,
  Play,
  Activity,
  Sparkles,
} from 'lucide-react'

export default function N8nWorkflowDemoPage() {
  return (
    <div className="h-screen w-screen bg-[#0e1117] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top n8n Navigation Bar */}
      <header className="h-14 bg-[#141824] border-b border-slate-800 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#ea4b71] flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md shadow-[#ea4b71]/30">
              n8n
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                Orchestrazione Agente Autonomo B2B
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ACTIVE 24/7
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">https://n8n.mark2.cloud • production</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c2234] border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Executions:</span>
            <span className="text-white font-bold">1,842 successe / 0 errori</span>
          </div>
          <button className="flex items-center gap-1.5 bg-[#ea4b71] hover:bg-[#d93860] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-[#ea4b71]/30 transition-all">
            <Play className="h-3.5 w-3.5 fill-current" />
            Test Workflow
          </button>
        </div>
      </header>

      {/* Main n8n Visual Workflow Canvas */}
      <main className="flex-1 relative bg-[radial-gradient(#2a324b_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center p-12">
        {/* Connected SVG Pipeline Cables */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="n8n-wire-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea4b71" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          <path
            d="M 270 540 C 350 540, 370 540, 450 540"
            fill="none"
            stroke="url(#n8n-wire-grad)"
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />
          <path
            d="M 670 540 C 750 540, 770 540, 850 540"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />
          <path
            d="M 1070 540 C 1150 540, 1170 540, 1250 540"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />
          <path
            d="M 1470 540 C 1550 540, 1570 540, 1650 540"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />
        </svg>

        {/* 5 Real n8n Visual Nodes */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-[1550px] gap-6">
          
          {/* NODE 1: Webhook Trigger */}
          <div className="w-56 bg-[#181d2c] border-2 border-[#ea4b71] rounded-2xl p-4 shadow-2xl shadow-[#ea4b71]/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="text-[10px] font-mono text-[#ea4b71] uppercase tracking-wider font-bold">Trigger</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="py-4 flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-[#ea4b71]/20 border border-[#ea4b71]/40 flex items-center justify-center">
                <Zap className="h-6 w-6 text-[#ea4b71]" />
              </div>
              <h3 className="font-bold text-sm text-white">Webhook Ingestion</h3>
              <p className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md w-full truncate">
                POST /lead-capture
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Event received</span>
            </div>
          </div>

          {/* NODE 2: n8n Router & Triage */}
          <div className="w-56 bg-[#181d2c] border border-amber-500/80 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">Switch / Router</span>
              <span className="text-[10px] font-mono text-slate-400">Rule-based</span>
            </div>
            <div className="py-4 flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Workflow className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-sm text-white">Triage & Filtro</h3>
              <p className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md w-full truncate">
                Score B2B &gt; 80 / No Spam
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400 flex items-center justify-center gap-1">
              <span>Passed: 100% Leads</span>
            </div>
          </div>

          {/* NODE 3: AI Agent (Nemotron / Gemini) */}
          <div className="w-60 bg-[#1e1a38] border-2 border-purple-500 rounded-2xl p-4 shadow-2xl shadow-purple-500/30 ring-2 ring-purple-500/20 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
              AI Brain Core
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60 pt-1">
              <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold">Autonomous Agent</span>
              <span className="text-[10px] font-mono text-purple-400 animate-pulse">Running</span>
            </div>
            <div className="py-4 flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-purple-600/30 border border-purple-500 flex items-center justify-center shadow-inner">
                <Bot className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-bold text-sm text-white">Nemotron Lead Agent</h3>
              <p className="text-[11px] text-purple-200 bg-purple-950/80 px-2 py-1 rounded-md w-full truncate font-mono">
                RCCF Prompt + Tool Call
              </p>
            </div>
            <div className="pt-2 border-t border-purple-900/50 text-[10px] font-mono text-purple-300 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Proposta Generata</span>
            </div>
          </div>

          {/* NODE 4: Supabase Cloud DB */}
          <div className="w-56 bg-[#181d2c] border border-blue-500/80 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">Database</span>
              <span className="text-[10px] font-mono text-blue-300">RLS Secured</span>
            </div>
            <div className="py-4 flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-sm text-white">Supabase Cloud</h3>
              <p className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md w-full truncate">
                table: waitlist_leads
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-blue-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Record salvato</span>
            </div>
          </div>

          {/* NODE 5: Telegram / Resend Dispatch */}
          <div className="w-56 bg-[#181d2c] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-xl shadow-emerald-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Dispatcher</span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">24/7 Action</span>
            </div>
            <div className="py-4 flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Send className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-sm text-white">Telegram & Resend</h3>
              <p className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md w-full truncate">
                Notify Team + Client Mail
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Notifica recapitata</span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Status Bar in Canvas */}
      <footer className="h-10 bg-[#141824] border-t border-slate-800 px-6 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            n8n Daemon Worker Engine v2.8.4
          </span>
          <span>•</span>
          <span>Zero Manutenzione Manuale</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Latency: 28ms</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">100% Health Status</span>
        </div>
      </footer>
    </div>
  )
}
