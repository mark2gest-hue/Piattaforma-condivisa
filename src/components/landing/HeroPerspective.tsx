'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Bot,
  Zap,
  Layers,
  CheckCircle2,
  BarChart3,
  Flame,
  ChevronRight,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Building2,
  ExternalLink
} from 'lucide-react'

export function CinematicHeroPerspective() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(10)
  const [rotateY, setRotateY] = useState(-6)
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'academy'>('overview')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Dynamic smooth tilt
    setRotateX(- (y / rect.height) * 16 + 6)
    setRotateY((x / rect.width) * 16 - 4)
  }

  const handleMouseLeave = () => {
    // Reset to default cinematic subtle tilt
    setRotateX(10)
    setRotateY(-6)
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 sm:my-14">
      
      {/* 3D Perspective Interactive Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow Halo Underlay */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-pink-500/20 rounded-[40px] blur-3xl opacity-70 pointer-events-none" />

        {/* Floating Neon Button in the Top Right (Direct Mike Design Insp.) */}
        <div className="absolute -top-5 right-6 sm:right-12 z-30 animate-bounce duration-1000">
          <Link
            href="/growth-studio"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-[0_0_35px_rgba(236,72,153,0.7),0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(236,72,153,0.9)] hover:scale-105 transition-all duration-300 border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-white animate-spin" />
            <span>+ New AI Insight</span>
          </Link>
        </div>

        {/* Main Cinematic Glassmorphic Board */}
        <div className="relative rounded-[32px] bg-[#070b18]/90 border border-blue-500/30 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_40px_100px_rgba(0,0,0,0.9),0_0_60px_rgba(59,130,246,0.15)] overflow-hidden">
          
          {/* Top Bar / Header of Mockup */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
              </div>
              <div className="h-4 w-[1px] bg-slate-800 mx-1" />
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-blue-400 font-bold">aiutiamoci.cloud</span>
                <span>/</span>
                <span className="text-slate-300 font-semibold">intelligence-hub</span>
              </div>
            </div>

            {/* Quick Filter Navigation */}
            <div className="flex items-center gap-1.5 bg-[#0e172e] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'agents'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agenti & Flussi
              </button>
              <button
                onClick={() => setActiveTab('academy')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'academy'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Corsi Academy
              </button>
            </div>
          </div>

          {/* Grid Layout inspired by Video */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
            
            {/* Col 1: Metric 1 - Opportunities / Growth Pill */}
            <div className="md:col-span-4 rounded-2xl bg-[#0c1427]/80 border border-blue-500/20 p-5 shadow-lg relative overflow-hidden group hover:border-blue-400/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adozione Processi AI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 text-xs font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <TrendingUp className="w-3 h-3" />
                  +3.1%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white font-mono tracking-tight">12</span>
                <span className="text-xs text-slate-400">Agenti Operativi Attivi</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automazioni scalabili collegate a CRM, centralino vocale e discovery di flusso per PMI.
              </p>
              {/* Neon Glow Bar Behind */}
              <div className="absolute -bottom-6 -right-6 w-32 h-16 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Col 2: Metric 2 - Interviews / Studenti Formati */}
            <div className="md:col-span-4 rounded-2xl bg-[#0c1427]/80 border border-indigo-500/20 p-5 shadow-lg relative overflow-hidden group hover:border-indigo-400/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completamento Corsi</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 text-xs font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <TrendingUp className="w-3 h-3" />
                  +11%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white font-mono tracking-tight">48</span>
                <span className="text-xs text-slate-400">Studenti Certificati</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Formazione pratica senza teoria astratta con Tutor AI dedicato 24/7 ed esercitazioni sul campo.
              </p>
              <div className="absolute -bottom-6 -right-6 w-32 h-16 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Col 3: Metric 3 - Conversion Rate & Progress Bar (As in Video) */}
            <div className="md:col-span-4 rounded-2xl bg-[#0c1427]/80 border border-cyan-500/20 p-5 shadow-lg relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efficienza Operativa</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">ROI 4.8x</span>
              </div>
              <div className="text-sm font-bold text-white mb-2">
                Riduzione Tempi di Lavoro
              </div>
              
              {/* Glowing Neon Progress Bar */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Ottimizzazione Workflow</span>
                  <span className="text-cyan-300 font-bold">72%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-1000"
                    style={{ width: '72%' }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Risparmio medio di 18 ore settimanali per team.
              </p>
            </div>

            {/* Middle Section: Glowing 3D Bar Chart & Neon Polyline (As in Mike Design Video) */}
            <div className="md:col-span-8 rounded-2xl bg-[#0a1122]/90 border border-blue-500/25 p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>Opportunity & Adoption Landscape</span>
                  </h3>
                  <p className="text-xs text-slate-400">Crescita mensile e impatto dei flussi automatizzati</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Gen — Giu 2026</span>
              </div>

              {/* Simulated 3D Glowing Pill Bars and Overlay Chart */}
              <div className="relative h-44 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 px-4">
                
                {/* SVG Neon Line Chart Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 120">
                  <path
                    d="M 20 85 L 90 60 L 160 30 L 240 75 L 310 20 L 380 40"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]"
                  />
                  {/* Glowing Dots */}
                  <circle cx="20" cy="85" r="4.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_6px_#ec4899]" />
                  <circle cx="90" cy="60" r="4.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_6px_#ec4899]" />
                  <circle cx="160" cy="30" r="5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_8px_#ec4899]" />
                  <circle cx="240" cy="75" r="4.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_6px_#ec4899]" />
                  <circle cx="310" cy="20" r="5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_10px_#ec4899]" />
                  <circle cx="380" cy="40" r="4.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2" className="drop-shadow-[0_0_6px_#ec4899]" />
                </svg>

                {/* 3D Cyan Glowing Bars */}
                {[
                  { month: 'GEN', h: '35%', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
                  { month: 'FEB', h: '60%', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]' },
                  { month: 'MAR', h: '88%', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.85)]' },
                  { month: 'APR', h: '45%', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
                  { month: 'MAG', h: '95%', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.9)]' },
                  { month: 'GIU', h: '75%', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 z-10 h-full justify-end">
                    <div
                      className={`w-full max-w-[42px] bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-300 rounded-2xl ${bar.glow} transition-all duration-500 hover:scale-y-105`}
                      style={{ height: bar.h }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4: Quick Action Panel / Dual Route Gateway */}
            <div className="md:col-span-4 rounded-2xl bg-[#0a1122]/90 border border-indigo-500/25 p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Accesso Immediato</span>
                </div>
                <h4 className="text-base font-bold text-white">Scegli la tua direzione</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Accedi direttamente ai percorsi di formazione o scopri come automatizzare la tua impresa con i nostri agenti.
                </p>
              </div>

              <div className="space-y-2.5 pt-4">
                <Link
                  href="/academy"
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-xs font-bold text-white transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Aiutiamoci Academy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="https://www.mark2.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-xs font-bold text-white transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Soluzioni per Imprese</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
