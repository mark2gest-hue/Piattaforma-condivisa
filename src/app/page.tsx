'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  Key,
  Bot,
  Layers,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Lock,
  ExternalLink,
  Cpu,
  Flame,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LegalModal, CookieBanner } from '@/components/legal/LegalModal'

export default function GatewayPage() {
  const router = useRouter()
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentCode, setStudentCode] = useState('')
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'cookies' | 'terms' | 'disclaimer' | null>(null)

  const handleStudentAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
    if (cleanCode.startsWith('REF-')) {
      alert('Questo è un link di invito/referral, non un codice di accesso valido per entrare al corso. Per accedere usa il codice univoco personale ricevuto via email.')
      return
    }

    router.push(`/corsi?tab=login&code=${encodeURIComponent(cleanCode)}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      {/* Background Dynamic Glowing Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-emerald-600/20 via-teal-600/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header Navigation Bar */}
      <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo_full_dark.png"
                alt="Aiutiamoci Hub"
                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                  aiutiamoci.cloud
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Ecosistema AI & Formazione</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setIsStudentModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl h-9 px-3 gap-1.5 font-semibold"
            >
              <Key className="h-3.5 w-3.5 text-indigo-400" />
              <span>Area Studenti</span>
            </Button>

            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 px-3 py-1.5 transition-colors flex items-center gap-1.5 border border-slate-800/80 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold h-9"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT GATEWAY HERO */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Intestazione Centrale */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-14">
          <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider">
            Scegli la tua porta d'accesso
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            L'Intelligenza Artificiale al servizio di <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Persone ed Imprese</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Due percorsi dedicati per accelerare il tuo futuro: impara a dominare i modelli generativi o integra agenti AI su misura nella tua azienda.
          </p>
        </div>

        {/* 2 PORTE MACRO (SPLIT CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
          
          {/* PORTA 1: AIUTIAMOCI ACADEMY (Formazione & Studenti) */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 transition-all duration-300 p-6 sm:p-9 flex flex-col justify-between shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:-translate-y-1 overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl group-hover:bg-indigo-600/25 transition-all pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Badge & Icona */}
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                  Per Privati & Professionisti
                </Badge>
              </div>

              {/* Titoli */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Aiutiamoci Academy
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Percorsi pratici di formazione step-by-step per imparare a usare l'IA nel lavoro quotidiano, con certificazione ufficiale e tutor intelligente.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>AI Start (Fondamenta)</strong>: 20 video lezioni, dispense PDF, tutor @AI e certificazione europea</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>AI Pro (Agentistica & B2B)</strong>: Creazione di Agenti Autonomi, sistemi multi-agente, RAG e flussi operativi</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Tutor @AI 24/7 & Community</strong>: Supporto continuo durante lo studio ed esercizi pratici</span>
                </div>
              </div>
            </div>

            {/* Azioni Academy */}
            <div className="pt-8 space-y-3 relative z-10">
              <Link href="/academy" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold h-13 rounded-2xl gap-2 shadow-xl shadow-indigo-600/30 text-sm sm:text-base transition-all group-hover:scale-[1.01]">
                  <span>Entra in Aiutiamoci Academy</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsStudentModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 text-xs text-slate-300 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Key className="h-3.5 w-3.5 text-indigo-400" />
                <span>Hai già un codice d'accesso? Accedi all'Area Corsi</span>
              </button>
            </div>
          </div>

          {/* PORTA 2: AIUTIAMOCI PER LE IMPRESE (B2B / Mark2.cloud) */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all duration-300 p-6 sm:p-9 flex flex-col justify-between shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-1 overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl group-hover:bg-emerald-600/25 transition-all pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Badge & Icona */}
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                  Per Imprese & Professionisti
                </Badge>
              </div>

              {/* Titoli */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Aiutiamoci per le Imprese
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Soluzioni personalizzate, audit di processo e sviluppo di agenti AI autonomi per moltiplicare l'efficienza e ridurre i costi aziendali.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Audit di Flusso & Discovery</strong>: Analisi rapida dei colli di bottiglia e ROI dei progetti AI</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Agenti & Centralini AI</strong>: Automazione del customer care, gestione documenti e presa appuntamenti</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Integrazione su Misura</strong>: Connessione con CRM, ERP, WhatsApp Business e gestionali aziendali</span>
                </div>
              </div>
            </div>

            {/* Azioni Imprese */}
            <div className="pt-8 space-y-3 relative z-10">
              <a
                href="https://www.mark2.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold h-13 rounded-2xl gap-2 shadow-xl shadow-emerald-600/30 text-sm sm:text-base transition-all group-hover:scale-[1.01]">
                  <span>Scopri le Soluzioni Imprese</span>
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>

              <a
                href="https://auditflow.mark2.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 text-xs text-slate-300 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Richiedi un Audit Rapido di Fattibilità AI</span>
              </a>
            </div>
          </div>

        </div>

        {/* Banner di Garanzia & Fiducia Bottom */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto text-center border border-slate-800/60 rounded-2xl p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Infrastruttura Sicura & Conforme GDPR</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-400" />
              <span>Tecnologia AI di Ultima Generazione</span>
            </div>
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-purple-400" />
              <span>Supporto e Docenza Qualificata</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 mt-12 text-center text-xs text-slate-400 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">aiutiamoci.cloud</span>
            <span>• Ecosistema Digitale Mark2</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setLegalModalType('privacy')} className="hover:text-slate-200 transition-colors">Privacy Policy</button>
            <button onClick={() => setLegalModalType('cookies')} className="hover:text-slate-200 transition-colors">Cookie Policy</button>
            <button onClick={() => setLegalModalType('terms')} className="hover:text-slate-200 transition-colors">Termini di Servizio</button>
          </div>
        </div>
      </footer>

      {/* Modal Login Studente Rapido con Codice */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Key className="h-5 w-5" />
                <h3 className="font-bold text-white text-lg">Area Studenti</h3>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStudentAccess} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Inserisci il tuo Codice Univoco
                </label>
                <input
                  type="text"
                  placeholder="Es. AI-START-8F92"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase tracking-wider outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400">
                  Il codice univoco che hai ricevuto via email dopo l'iscrizione.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl gap-2 text-sm"
              >
                <span>Accedi alle Lezioni</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modale Legale */}
      <LegalModal
        isOpen={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
      <CookieBanner onOpenPolicy={() => setLegalModalType('cookies')} />
    </div>
  )
}
