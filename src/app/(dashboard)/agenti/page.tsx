'use client'

import { useEffect } from 'react'
import { Bot, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AgentiAIPage() {
  useEffect(() => {
    // Reindirizzamento automatico alla nuova piattaforma
    const timer = setTimeout(() => {
      window.location.href = 'https://agenti-aiutiamoci.vercel.app/'
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <Bot className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuova Piattaforma Dedicata</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hub Agenti AI</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            La sezione Agenti AI è stata completamente riprogettata ed è ora disponibile all’indirizzo:
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-purple-300 font-semibold shadow-inner">
          agenti-aiutiamoci.vercel.app
        </div>

        <div className="pt-2">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 py-5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200"
          >
            <a href="https://agenti-aiutiamoci.vercel.app/" target="_blank" rel="noopener noreferrer">
              <span>Accedi alla Piattaforma</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

        <p className="text-[11px] text-slate-500 animate-pulse">
          Reindirizzamento automatico in corso...
        </p>
      </div>
    </div>
  )
}
