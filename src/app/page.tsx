'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  GraduationCap,
  Users,
  ShieldCheck,
  PlayCircle,
  Key,
  ArrowRight,
  CheckCircle2,
  Lock,
  Bot,
  Mail,
  Zap,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { sendSharedEmail } from './(dashboard)/posta/actions'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form Iscrizione Rapida
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Login Studente Rapido con Codice
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentCode, setStudentCode] = useState('')
  const [codeError, setCodeError] = useState('')

  const handleStudentAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
    // Reindirizza al portale corsi con il codice
    router.push(`/corsi?tab=login&code=${encodeURIComponent(cleanCode)}`)
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || !emailInput.trim()) return
    setIsRegistering(true)

    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    const generatedCode = `AI-START-${randomHex}`

    // Salvataggio su Supabase
    await (supabase as any).from('student_codes').insert({
      code: generatedCode,
      student_name: nameInput.trim(),
      student_email: emailInput.trim(),
      course_title: "AI Start - Domina l'IA da Zero",
    })

    // Notifica Kanban Team
    await (supabase as any).from('tasks').insert({
      title: `Nuova Iscrizione Landing: ${nameInput.trim()}`,
      description: `Studente iscritto da aiutiamoci.cloud. Codice assegnato: ${generatedCode}. Email: ${emailInput.trim()}`,
      status: 'todo',
      priority: 'high',
    })

    // Invio Email via Resend SDK
    await sendSharedEmail({
      to: emailInput.trim(),
      subject: `Benvenuto in AI Start! Il tuo Codice di Accesso: ${generatedCode}`,
      body: `Gentile ${nameInput.trim()},\n\ngrazie per esserti iscritto a "AI Start - Domina l'Intelligenza Artificiale da Zero"!\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO per accedere alle 20 lezioni video ed alla Chat con l'assistente @AI:\n👉 CODICE: ${generatedCode}\n\nAccedi alla piattaforma inserendo questo codice nell'Area Studenti.\n\nCordiali saluti,\nTeam Ti AIuto (aiutiamoci.cloud)`,
    })

    alert(`Iscrizione completata con successo! Il tuo Codice di Accesso è: ${generatedCode}. Ti abbiamo inviato una mail di conferma.`)
    setIsRegistering(false)
    setIsEnrollModalOpen(false)

    // Vai al portale corsi
    router.push(`/corsi?tab=login&code=${encodeURIComponent(generatedCode)}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header & Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                aiutiamoci.cloud <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Ti AIuto</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Formazione AI & Piattaforma Condivisa</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Area Studenti</span>
            </button>

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2"
            >
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <span>Nuova Iscrizione</span>
            </button>

            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Piattaforma Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge className="py-1.5 px-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full gap-2 inline-flex items-center">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Corso Pratico in 20 Video Lezioni senza tecnicismi
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            AI Start — Domina l'Intelligenza Artificiale da Zero
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            L'Intelligenza Artificiale non è magia, è uno strumento. Impara a delegare la noia, potenziare la creatività e gestire il tempo con 20 lezioni guidate ed un assistente virtuale <strong className="text-white">@AI</strong> sempre al tuo fianco.
          </p>
        </div>

        {/* GLI 3 ACCESSI PRINCIPALI (GATEWAY CARDS) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          {/* Card 1: AREA STUDENTI */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 transition-all duration-200 group hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">1. Sei già uno Studente?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inserisci il tuo Codice Univoco di Accesso (es. <code className="text-blue-400 font-mono">AI-START-8F92</code>) per sbloccare le 20 lezioni video e la Chat con l'assistente @AI.
              </p>
            </div>

            <Button
              onClick={() => setIsStudentModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 rounded-xl gap-2 shadow-lg shadow-blue-600/20"
            >
              <span>Accedi alle Lezioni</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Card 2: ISCRIVITI AL CORSO */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 transition-all duration-200 group hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">2. Vuoi Iscriverti ora?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compila l'iscrizione rapida per ricevere immediatamente il tuo Codice di Accesso personale via mail ed iniziare subito le 20 lezioni.
              </p>
            </div>

            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl gap-2 shadow-lg shadow-indigo-600/20"
            >
              <span>Iscriviti a AI Start</span>
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          {/* Card 3: PIATTAFORMA TEAM */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 transition-all duration-200 group hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">3. Piattaforma Team Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Area riservata per il team di lavoro: Kanban attività, Posta condivisa, Chat interna, Videocall WebRTC, Agenti AI e Calendario.
              </p>
            </div>

            <Link href="/login" className="w-full">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 rounded-xl gap-2 shadow-lg shadow-purple-600/20"
              >
                <span>Accedi alla Dashboard</span>
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 pt-12 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono">20 Video</div>
            <div className="text-xs text-slate-400">Modulo pratico passo-passo</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-blue-400 font-mono">Assistente @AI</div>
            <div className="text-xs text-slate-400">Supporto 24/7 in chat</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-indigo-400 font-mono">HTML5 Streaming</div>
            <div className="text-xs text-slate-400">Senza cookie di terze parti</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-400 font-mono">Resend & Supabase</div>
            <div className="text-xs text-slate-400">Notifiche ed email istantanee</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 <strong>aiutiamoci.cloud</strong> — Ti AIuto. Tutti i diritti riservati.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/corsi" className="hover:text-slate-300 transition-colors">Portale Corsi</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Login Team</Link>
          </div>
        </div>
      </footer>

      {/* MODAL 1: LOGIN CODICE STUDENTE */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Area Studenti — Riscatta Codice</h3>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStudentAccess} className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Codice Univoco di Accesso *</label>
                <Input
                  autoFocus
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Es. AI-START-8F92 oppure DEMO2026"
                  className="text-center font-mono uppercase tracking-widest font-bold text-sm h-12 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-600/20">
                Sblocca 20 Video & Accedi
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM ISCRIZIONE RAPIDA */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Iscrizione a AI Start</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Nome e Cognome *</label>
                <Input
                  autoFocus
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Indirizzo Email *</label>
                <Input
                  required
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Es. mario.rossi@azienda.it"
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <Button type="submit" disabled={isRegistering} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-600/20">
                {isRegistering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generazione Codice ed Invio Mail...
                  </>
                ) : (
                  'Conferma Iscrizione & Ricevi Codice'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
