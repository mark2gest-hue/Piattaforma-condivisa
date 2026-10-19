'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Building2,
  ArrowRight,
  Key,
  Lock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LegalModal, CookieBanner } from '@/components/legal/LegalModal'
import { verifyStudentCodeAction } from '@/app/actions/student'

export default function GatewayPage() {
  const router = useRouter()
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentCode, setStudentCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'cookies' | 'terms' | 'disclaimer' | null>(null)

  const handleStudentAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
    if (cleanCode.startsWith('REF-')) {
      setCodeError('Questo è un link di invito/referral, non un codice di accesso. Usa il codice univoco personale ricevuto via email.')
      return
    }

    setIsVerifyingCode(true)
    try {
      const res = await verifyStudentCodeAction(cleanCode)
      if (res.success && res.student) {
        const dbStudent = res.student
        const rawTier = dbStudent.access_tier
        const tier = rawTier === 'ai-start' || rawTier === 'ai-pro' || rawTier === 'both'
          ? rawTier
          : dbStudent.code.startsWith('AI-PRO-')
            ? 'ai-pro'
            : dbStudent.code.startsWith('AI-ALL-')
              ? 'both'
              : 'ai-start'
        const studentObj = {
          name: dbStudent.student_name,
          code: dbStudent.code,
          accessTier: tier,
          sessionToken: res.sessionToken,
          cohortId: (dbStudent as any).cohort_id || null,
        }
        try {
          localStorage.setItem('ti_aiuto_active_student', JSON.stringify(studentObj))
        } catch (e) {}
        router.push(`/corsi?code=${encodeURIComponent(cleanCode)}`)
      } else {
        setCodeError(res.error || 'Codice non valido o non trovato. Controlla il codice ricevuto via email.')
      }
    } catch (err: any) {
      setCodeError(err.message || 'Errore durante la verifica del codice.')
    } finally {
      setIsVerifyingCode(false)
    }
  }

  return (
    <div
      className="dark min-h-screen text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white overflow-x-hidden relative"
      style={{
        backgroundColor: '#050811',
        backgroundImage: 'radial-gradient(110% 90% at 50% 35%, #131c31 0%, #080d1a 50%, #030509 100%)',
      }}
    >
      
      {/* 1. Sfondo con Griglia Ingegneristica a Basso Contrasto */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 38%, #000 35%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 38%, #000 35%, transparent 100%)',
          }}
        />
      </div>

      {/* 2. Header Minimale con Scala Visiva Corretta */}
      <header className="relative z-30 border-b border-white/5 bg-[#080d18]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo_full_dark.png"
                alt="Aiutiamoci Hub"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  aiutiamoci.cloud
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Gateway Digitale</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCodeError('')
                setIsStudentModalOpen(true)
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Key className="h-3.5 w-3.5 text-blue-400" />
              <span>Ho un codice</span>
            </button>

            <Link
              href="/login"
              className="text-slate-300 hover:text-white px-3.5 py-1.5 transition-colors flex items-center gap-1.5 border border-white/10 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-xs font-medium h-9"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Accedi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero & Le Due Grandi Card Stile Apple / Bang & Olufsen */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        
        {/* Titolo Principale in Scala Alta */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.12]">
            L'intelligenza artificiale al lavoro per te.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Due percorsi dedicati. Scegli da dove partire.
          </p>
        </div>

        {/* Le 2 Card ad Alta Profondità Apple con Alone Diffuso */}
        <div className="relative max-w-5xl mx-auto w-full">
          {/* Alone Chiaro Zenitale Soft (Backlight Ambientale del Mockup) */}
          <div
            className="absolute -inset-4 sm:-inset-8 rounded-[40px] pointer-events-none opacity-70 blur-3xl"
            style={{
              background: 'radial-gradient(ellipse at 50% 45%, rgba(65, 105, 180, 0.28) 0%, rgba(30, 58, 110, 0.15) 50%, transparent 75%)',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full">
          
          {/* CARD 1: ACADEMY & FORMAZIONE */}
          <div
            className="group relative rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between space-y-8"
            style={{
              background: 'linear-gradient(180deg, #131c30 0%, #0a0f1d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 0 40px -10px rgba(70, 120, 220, 0.25), 0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 60px 120px -20px rgba(0, 0, 0, 0.98)',
            }}
          >
            <div className="space-y-6">
              
              {/* Header Card */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center p-1.5 shadow-sm">
                  <img
                    src="/images/logo_icon_dark.png"
                    alt="Aiutiamoci Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-[1.75rem] font-bold text-white tracking-tight">
                  Aiutiamoci Academy
                </h2>
              </div>

              {/* Sintesi */}
              <div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Impara a usare l'AI nel lavoro quotidiano, con corsi pratici e certificazione europea.
                </p>
              </div>

              {/* Punti Elenco */}
              <div className="space-y-3 pt-5 border-t border-white/5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>AI Start (Fondamenta)</strong>: 20 lezioni pratiche da zero</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Formazione su Misura</strong>: Percorsi dedicati per team aziendali</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Tutor @AI 24/7</strong>: Assistente continuo per esercizi e dubbi</span>
                </div>
              </div>
            </div>

            {/* Pulsante Navigazione */}
            <div className="pt-2">
              <Link href="/academy" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12.5 rounded-xl gap-2 text-sm shadow-lg shadow-blue-950/60 transition-all cursor-pointer">
                  <span>Vai a Aiutiamoci Accademy</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* CARD 2: AIUTIAMOCI IMPRESA (mark2.cloud) */}
          <div
            className="group relative rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between space-y-8"
            style={{
              background: 'linear-gradient(180deg, #131c30 0%, #0a0f1d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 0 40px -10px rgba(70, 120, 220, 0.25), 0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 60px 120px -20px rgba(0, 0, 0, 0.98)',
            }}
          >
            <div className="space-y-6">
              
              {/* Header Card */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center p-1.5 shadow-sm">
                  <img
                    src="/images/logo_icon_dark.png"
                    alt="Aiutiamoci Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-[1.75rem] font-bold text-white tracking-tight">
                  Aiutiamoci Impresa
                </h2>
              </div>

              {/* Sintesi */}
              <div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Agenti autonomi, monitoraggio e automazioni su misura per far lavorare la tecnologia al posto tuo.
                </p>
              </div>

              {/* Punti Elenco */}
              <div className="space-y-3 pt-5 border-t border-white/5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Orchestratore di Agenti</strong>: Assistenti vocali, CRM e preventivi</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>NetworkDiag Ops Pro</strong>: Monitoraggio reti, server e DNS h24</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Integrazione su Misura</strong>: Connessione con gestionali e WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Pulsante Navigazione */}
            <div className="pt-2">
              <a
                href="https://www.mark2.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-slate-800/90 hover:bg-slate-700/90 text-white border border-white/10 font-semibold h-12.5 rounded-xl gap-2 text-sm shadow-lg shadow-black/60 transition-all cursor-pointer">
                  <span>Vai a Aiutiamoci Impresa</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </Button>
              </a>
            </div>
          </div>

        </div>
        </div>

        {/* Micro-banner di Garanzia e Trasparenza in basso */}
        <div className="mt-14 sm:mt-16 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Conforme GDPR & Dati Protetti</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div>Zero vincoli contrattuali</div>
          <span className="hidden sm:inline">•</span>
          <div>Assistenza diretta</div>
        </div>

      </main>

      {/* 4. Footer Minimale */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#070b14] py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">aiutiamoci.cloud</span>
            <span>• Ecosistema Digitale</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <button onClick={() => setLegalModalType('privacy')} className="hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setLegalModalType('cookies')} className="hover:text-slate-200 transition-colors cursor-pointer">Cookie Policy</button>
            <button onClick={() => setLegalModalType('terms')} className="hover:text-slate-200 transition-colors cursor-pointer">Termini di Servizio</button>
          </div>
        </div>
      </footer>

      {/* Modal Login Studente Rapido con Codice */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Area Studenti — Hai già il codice?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStudentAccess} className="p-6 space-y-4 text-xs">
              <p className="text-slate-400 text-xs leading-relaxed">
                Inserisci il tuo codice di accesso personale (ricevuto via email o dal corso precedente) per sbloccare subito le 20 video lezioni e i contenuti.
              </p>

              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Codice Univoco di Accesso *</label>
                <Input
                  autoFocus
                  required
                  value={studentCode}
                  onChange={(e) => {
                    setStudentCode(e.target.value)
                    if (codeError) setCodeError('')
                  }}
                  placeholder="Es. AI-START-8F92 oppure DEMO2026"
                  className="text-center font-mono uppercase tracking-widest font-bold text-sm h-12 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              {codeError && (
                <p className="text-red-400 text-xs font-semibold text-center bg-red-950/40 p-2.5 rounded-xl border border-red-900/40">
                  {codeError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isVerifyingCode}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifica codice in corso...</span>
                  </>
                ) : (
                  <span>Verifica ed Entra al Corso</span>
                )}
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
