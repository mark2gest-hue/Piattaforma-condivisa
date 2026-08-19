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
  Clock,
  Award,
  Video,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { sendSharedEmail } from './(dashboard)/posta/actions'
import { createClient } from '@/lib/supabase/client'

const MODULES_LIST = [
  { num: '01', title: 'Benvenuto in AI Start — Dimentica i tecnicismi e parti da zero', desc: 'Introduzione ai concetti chiave dell’Intelligenza Artificiale spiegati semplice.' },
  { num: '02', title: 'Come impostare il primo prompt senza commettere errori', desc: 'La struttura in 3 parti per ottenere risposte precise e senza allucinazioni.' },
  { num: '03', title: 'Delegare le task noiose dell’ufficio all’IA', desc: 'Come risparmiare ore ogni giorno automatizzando la gestione dati e l’organizzazione.' },
  { num: '04', title: 'Generare risposte email commerciali e professionali perfette', desc: 'Scrittura rapida di email formali, proposte di vendita e gestione obiezioni.' },
  { num: '05', title: 'Creazione contenuti, post social ed articoli con l’IA', desc: 'Potenziare la creatività mantenendo la propria voce ed il proprio stile.' },
  { num: '06', title: 'Riassumere documenti lunghi, contratti e PDF in 10 secondi', desc: 'Estrazione istantanea di punti chiave e sintesi esecutive da file complessi.' },
  { num: '07', title: 'Organizzare il tempo e le agende aziendali', desc: 'Pianificazione intelligente del calendario e gestione delle scadenze.' },
  { num: '08', title: 'Creare tabelle ed analizzare dati senza conoscere formule', desc: 'Elaborazione dati ed estrazione di insight da fogli di calcolo.' },
  { num: '09', title: 'Traduzione ed adattamento di testi internazionali', desc: 'Comunicazione fluida in più lingue per espandere il proprio raggio d’azione.' },
  { num: '10', title: 'La Chat con l’assistente @AI ed il supporto continuo', desc: 'Come interrogare l’IA in tempo reale mentre segui le lezioni.' },
  { num: '11', title: 'Creare Agenti AI personalizzati su misura', desc: 'Configurare assistenti virtuali dedicati alle tue esigenze specifiche.' },
  { num: '12', title: 'Automazioni senza codice (No-Code & Webhooks)', desc: 'Connettere l’IA ai tuoi strumenti senza scrivere una singola riga di codice.' },
  { num: '13', title: 'Trascrizione automatica di riunioni e vocali', desc: 'Trasformare registrazioni audio e video in verbali riassunti e pronti all’uso.' },
  { num: '14', title: 'Generare immagini e grafica per le presentazioni', desc: 'Creare elementi visivi di impatto per slide e materiale di marketing.' },
  { num: '15', title: 'Cybersecurity e privacy dei dati con l’IA', desc: 'Utilizzare gli strumenti tecnologici in totale sicurezza e conformità.' },
  { num: '16', title: 'Creare preventivi e proposte B2B in tempo reale', desc: 'Velocizzare il ciclo di vendita preparando offerte personalizzate.' },
  { num: '17', title: 'Integrazione dell’IA nel lavoro di team', desc: 'Condividere prompt, risorse e flussi di lavoro con i propri collaboratori.' },
  { num: '18', title: 'Analisi dei clienti e sentiment analysis', desc: 'Comprendere al meglio i bisogni ed i feedback dei propri clienti.' },
  { num: '19', title: 'Workflow avanzati e gestione dei progetti', desc: 'Strutturare progetti complessi coordinando task ed automazioni.' },
  { num: '20', title: 'Esame finale e Rilascio Certificato AI Start', desc: 'Verifica pratica delle competenze acquisite ed attestato di completamento.' },
]

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
  const [openCurriculum, setOpenCurriculum] = useState(false)

  const handleStudentAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
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

    router.push(`/corsi?tab=login&code=${encodeURIComponent(generatedCode)}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                aiutiamoci.cloud <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Ti AIuto</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Corso Pratico AI Start</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 border border-slate-800 rounded-xl bg-slate-900/60"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Riscatta Codice</span>
            </button>

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              <span>Iscriviti Ora</span>
            </button>

            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 px-2 py-2 transition-colors hidden sm:flex items-center gap-1"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="text-[11px]">Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge className="py-1.5 px-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full gap-2 inline-flex items-center">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Trasforma la curiosità in competenza operativa in 20 video
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            AI Start — Domina l'Intelligenza Artificiale da Zero
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            L'Intelligenza Artificiale non è magia, è uno strumento. Impara a delegare la noia, potenziare la creatività e gestire il tempo. Spiegato semplice, senza tecnicismi.
          </p>

          {/* 3 CALL TO ACTION PRINCIPALI */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-8 rounded-xl gap-2 shadow-xl shadow-indigo-600/30 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Inizia il Corso Completo</span>
            </Button>

            <Button
              onClick={() => setIsStudentModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold h-12 px-6 rounded-xl gap-2 text-sm"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Hai un codice? Accedi</span>
            </Button>
          </div>
        </div>

        {/* SECTION 1: PERCHÉ ISCRIVERSI (3 PILLARI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Delegare la Noia</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Risparmia ore di lavoro ogni settimana automatizzando la stesura di email, il riassunto di documenti lunghi ed il calcolo dati.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Potenziare la Creatività</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genera idee, bozze di articoli, grafiche e presentazioni d'impatto senza mai bloccarti davanti ad una pagina bianca.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Assistente @AI Integrato</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Poni qualsiasi domanda in chat durante lo studio: l'assistente IA risponde istantaneamente per guidarti passo-passo.
            </p>
          </div>
        </div>

        {/* SECTION 2: PROGRAMMA COMPLETO DEI 20 MODULI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 lg:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <Badge variant="purple" className="text-[10px] uppercase font-bold mb-2">Programma Formativo</Badge>
              <h2 className="text-2xl font-bold text-white">I 20 Moduli Video di AI Start</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-semibold">20 Lezioni • Certificato Finale</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES_LIST.map((mod) => (
              <div key={mod.num} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">{mod.num}.</span>
                  <h4 className="text-xs font-bold text-white truncate">{mod.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CALL TO ACTION FINALE */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl font-black text-white">Inizia Oggi il tuo Percorso in AI Start</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Unisciti agli studenti già operativi. Riceverai subito il tuo codice personale di accesso ed il supporto dell'assistente in chat.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-8 rounded-xl gap-2 shadow-xl shadow-indigo-600/30 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Iscriviti Subito</span>
            </Button>
            <Button
              onClick={() => setIsStudentModalOpen(true)}
              variant="outline"
              className="border-slate-700 bg-slate-900/80 text-white font-bold h-12 px-6 rounded-xl gap-2 text-sm"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Accedi col tuo Codice</span>
            </Button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© 2026 <strong>aiutiamoci.cloud</strong> — Ti AIuto. Tutti i diritti riservati.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsStudentModalOpen(true)} className="hover:text-slate-300">Area Studenti</button>
            <Link href="/login" className="hover:text-slate-300">Team Login</Link>
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
