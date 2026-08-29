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
  Star,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Check,
  Send,
  BellRing,
  Network,
  Share2,
  Layers,
  Database,
  Workflow,
  Terminal,
  FileCode2,
  Binary,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { enrollStudentAction, joinWaitlistAction, submitCourseRegistrationAction } from '@/app/actions/student'

const MODULES_LIST = [
  { num: '01', title: '1. Benvenuti nel Futuro', category: 'Modulo 1 – Fondamenta', desc: 'Introduzione ai concetti chiave ed alla rivoluzione dell’Intelligenza Artificiale.' },
  { num: '02', title: '2. Breve Storia dell\'Evoluzione', category: 'Modulo 1 – Fondamenta', desc: 'Come l\'IA è evoluta e quali opportunità concrete offre oggi nel lavoro.' },
  { num: '03', title: '3. Sconfiggere il Foglio Bianco', category: 'Modulo 1 – Fondamenta', desc: 'Superare il blocco iniziale ed iniziare ad interagire subito con gli strumenti IA.' },
  { num: '04', title: '4. Il Linguaggio della Chiarezza', category: 'Modulo 2 – Prompting', desc: 'La struttura per comunicare in modo chiaro e preciso con i modelli IA.' },
  { num: '05', title: '5. La Formula Segreta RCCF', category: 'Modulo 2 – Prompting', desc: 'Ruolo, Contesto, Contenuto e Formato: la formula per prompt perfetti.' },
  { num: '06', title: '6. Iterazione', category: 'Modulo 2 – Prompting', desc: 'Affinare le risposte ed istruire l’IA attraverso dialoghi ed iterazioni successive.' },
  { num: '07', title: '7. ChatGPT, Claude, Gemini, Perplexity', category: 'Modulo 3 – Strumenti', desc: 'Panoramica comparativa dei migliori modelli di IA generativa e quando usarli.' },
  { num: '08', title: '8. Scrivere senza Sforzo', category: 'Modulo 3 – Strumenti', desc: 'Redazione rapida di email, post, testi formali e comunicazioni commerciali.' },
  { num: '09', title: '9. Dipingere con le Parole', category: 'Modulo 3 – Strumenti', desc: 'Tecniche di prompting per la generazione di immagini e contenuti visivi.' },
  { num: '10', title: '10. Anatomia di un Prompt Visivo', category: 'Modulo 3 – Strumenti', desc: 'Strutturare prompt grafici d\'impatto per slide, presentazioni e marketing.' },
  { num: '11', title: '11. Presentazioni in 5 Minuti', category: 'Modulo 3 – Strumenti', desc: 'Creare slide e materiale per riunioni e clienti in tempo record con l\'IA.' },
  { num: '12', title: '12. Analisi Dati per Excel', category: 'Modulo 4 – Pratica', desc: 'Elaborazione dati, tabelle e grafici senza dover conoscere formule complesse.' },
  { num: '13', title: '13. L\'Agenda Intelligente', category: 'Modulo 4 – Pratica', desc: 'Pianificazione automatica delle priorità, del calendario e delle scadenze.' },
  { num: '14', title: '14. Studiare e Imparare ELI5', category: 'Modulo 4 – Pratica', desc: 'Apprendimento rapido e semplificazione di argomenti complessi con l\'IA.' },
  { num: '15', title: '15. Allucinazioni: Quando l\'IA mente', category: 'Modulo 4 – Pratica', desc: 'Come riconoscere gli errori dell\'IA e verificare le fonti in totale sicurezza.' },
  { num: '16', title: '16. Privacy e Sicurezza', category: 'Modulo 5 – Futuro', desc: 'Protezione dei dati aziendali e personali secondo le norme di sicurezza.' },
  { num: '17', title: '17. Il Lavoro che Cambia', category: 'Modulo 5 – Futuro', desc: 'L\'impatto dell\'IA sulle professioni e come posizionarsi per il futuro.' },
  { num: '18', title: '18. Creare il proprio Workflow', category: 'Modulo 5 – Futuro', desc: 'Strutturare un flusso di lavoro personalizzato ed automatizzato al 100%.' },
  { num: '19', title: '19. La Tua Nuova Superpotenza', category: 'Modulo 5 – Futuro', desc: 'Integrare l\'IA come alleato quotidiano per moltiplicare la produttività.' },
  { num: '20', title: '20. Riepilogo Corso AI', category: 'Modulo 5 – Futuro', desc: 'Sintesi del percorso formativo, attestato finale e prossimi passi.' },
]

const FAQS = [
  { q: 'Serve saper programmare o avere competenze tecniche?', a: 'Assolutamente no! AI Start è stato progettato appositamente per chi parte da zero. Spieghiamo tutto in modo chiaro, senza tecnicismi.' },
  { q: 'Come funziona l’accesso alle lezioni video?', a: 'Al momento dell’iscrizione riceverai un Codice Univoco personale (es. AI-START-8F92). Inserendolo nell’Area Studenti sbloccherai subito tutti i 20 video ed il player HTML5.' },
  { q: 'Cos’è l’Assistente @AI in Chat?', a: 'È il tuo tutor virtuale integrato nella piattaforma. Durante la visione delle lezioni puoi digitare @AI per porre qualsiasi domanda e ricevere risposte istantanee.' },
  { q: 'Quando uscirà il Corso Avanzato AI Pro?', a: 'Il percorso avanzato "AI Pro & Agenti Autonomi B2B" è attualmente in fase di preparazione. Puoi iscriverti alla lista d’attesa in un click per ricevere un invito prioritario ed un coupon sconto!' },
]

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form Iscrizione & Questionario AI Start
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [aiExperience, setAiExperience] = useState('Qualche prova (tipo ChatGPT ogni tanto)')
  const [objective, setObjective] = useState('Migliorare il lavoro o il business')
  const [blocker, setBlocker] = useState('Non so da dove iniziare')
  const [expectation, setExpectation] = useState('Voglio sperimentare e capire')
  const [isRegistering, setIsRegistering] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  // Login Studente Rapido con Codice
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentCode, setStudentCode] = useState('')

  // Lista d'attesa Corso Avanzato AI Pro
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  // Demo Prompt Simulator Interattivo
  const [demoPromptInput, setDemoPromptInput] = useState('')
  const [demoResponse, setDemoResponse] = useState<string | null>(null)
  const [isDemoThinking, setIsDemoThinking] = useState(false)

  // Accordion FAQ aperto
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0)

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

    const result = await submitCourseRegistrationAction({
      name: nameInput.trim(),
      email: emailInput.trim(),
      ai_experience: aiExperience,
      objective: objective,
      blocker: blocker,
      expectation: expectation,
      raw_answers: {
        experience: aiExperience,
        goal: objective,
        blocker: blocker,
        mindset: expectation,
      }
    })

    setIsRegistering(false)

    if (!result.success) {
      alert(`Errore durante l'invio della richiesta: ${result.error}`)
      return
    }

    setEnrollSuccess(true)
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistEmail.trim()) return

    await joinWaitlistAction(waitlistEmail.trim())

    setWaitlistSuccess(true)
    setTimeout(() => {
      setIsWaitlistModalOpen(false)
      setWaitlistSuccess(false)
      setWaitlistEmail('')
    }, 2000)
  }

  const handleRunDemoPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoPromptInput.trim()) return

    setIsDemoThinking(true)
    setDemoResponse(null)

    setTimeout(() => {
      setDemoResponse(
        `✨ RISPOSTA DELL'ASSISTENTE @AI:\n\nEcco la soluzione per: "${demoPromptInput}"\n\n1. RUOLO: Esperto di produttività aziendale.\n2. STRATEGIA: Inserisci le informazioni chiave nel prompt usando elenchi puntati.\n3. RISULTATO: L'IA elabora il testo in pochi secondi senza errori.\n\nNel corso "AI Start" impariamo 20 tecniche simili per velocizzare il lavoro quotidiano!`
      )
      setIsDemoThinking(false)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Dynamic Light Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-purple-600/30 via-pink-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header Navigation Bar */}
      <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5 truncate">
                aiutiamoci.cloud <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 shrink-0">Ti AIuto</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Formazione ed Agenti IA</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold shrink-0">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-slate-800 rounded-xl bg-slate-900/80 hover:bg-slate-800"
              title="Hai già il codice? Entra qui"
            >
              <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400 shrink-0" />
              <span className="hidden md:inline">Hai già il codice? Entra qui</span>
              <span className="md:hidden">Codice</span>
            </button>

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap"
            >
              <span>Iscriviti<span className="hidden sm:inline"> Ora</span></span>
            </button>

            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 px-1 sm:px-2 py-1.5 sm:py-2 transition-colors hidden sm:flex items-center gap-1"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="text-[11px]">Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className="py-1.5 px-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full gap-2 inline-flex items-center">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Corso Pratico in 20 Video Lezioni senza tecnicismi
            </Badge>

            <button
              type="button"
              onClick={() => setIsWaitlistModalOpen(true)}
              className="py-1.5 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold rounded-full gap-1.5 inline-flex items-center transition-all cursor-pointer hover:scale-105 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>🚀 Prossimo Lancio: <strong className="text-white underline decoration-purple-400">AI Pro</strong> (Agenti & Automazioni) • Entra in Lista</span>
            </button>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Domina l'Intelligenza Artificiale <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">da Zero</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            L'Intelligenza Artificiale non è magia, è uno strumento. Impara a delegare la noia, potenziare la creatività e gestire il tempo con 20 lezioni guidate ed un assistente virtuale <strong className="text-white">@AI</strong> sempre al tuo fianco.
          </p>

          {/* CTA MAIN BUTTONS */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold h-13 px-8 rounded-2xl gap-2 shadow-2xl shadow-indigo-600/40 text-base transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-5 w-5" />
              <span>Inizia il Corso Completo</span>
            </Button>

            <Button
              onClick={() => setIsStudentModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold h-13 px-6 rounded-2xl gap-2 text-sm"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Hai già il codice? Entra qui</span>
            </Button>
          </div>
        </div>

        {/* HERO SHOWCASE IMAGE BANNER WITH OVERLAY */}
        <div className="relative max-w-5xl mx-auto rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-500/20 overflow-hidden group">
          <img
            src="/images/ai_start_course_banner.jpg"
            alt="AI Start Platform Showcase"
            className="w-full h-[320px] sm:h-[450px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-8 sm:p-12">
            <div className="space-y-2 max-w-xl text-left">
              <Badge className="bg-indigo-600 text-white border-0 text-[10px] uppercase font-bold">Interfaccia Studente & Player HD</Badge>
              <h3 className="text-xl sm:text-2xl font-black text-white">Player Video HTML5 & Assistente @AI in tempo reale</h3>
              <p className="text-xs text-slate-300 leading-relaxed hidden sm:block">
                Fruisci delle lezioni con audio e video in streaming senza cookie di terze parti e poni domande all'IA durante lo studio.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION SELETTORE DEI CORSI (CORSO 1 DISPONIBILE vs CORSO 2 AVANZATO PRO) */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="purple" className="text-[10px] uppercase font-bold tracking-widest">I Nostri Percorsi Formativi</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Scegli il livello più adatto a te</h2>
            <p className="text-xs sm:text-sm text-slate-400">Dai primi passi fino allo sviluppo di Agenti IA avanzati per le aziende.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* CORSO 1: AI START (DISPONIBILE ORA) */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl shadow-indigo-500/10 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>Più Popolare • Disponibile Ora</span>
              </div>

              {/* Banner Immagine Corso 1 */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 relative mt-2">
                <img
                  src="/images/ai_start_course_banner.jpg"
                  alt="AI Start Banner"
                  className="w-full h-44 object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" className="text-[10px] uppercase">Livello Principiante / Intermedio</Badge>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">€ 69</span>
                    <span className="block text-[10px] text-emerald-400 font-semibold">Gratuito con Codice Studente</span>
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  AI Start — Domina l'Intelligenza Artificiale da Zero
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  20 lezioni video pratiche per automatizzare il lavoro quotidiano, gestire email, sintetizzare documenti ed utilizzare l'assistente @AI.
                </p>

                <div className="space-y-2 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>20 Video Lezioni in alta definizione</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Chat integrata con assistente IA @AI 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Accesso a vita tramite Codice Univoco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Attestato di completamento finale</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEnrollModalOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Iscriviti a AI Start</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* CORSO 2: AI PRO B2B (PROSSIMAMENTE / LISTA D'ATTESA) */}
            <div className="bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 relative flex flex-col justify-between group hover:border-purple-500/40 transition-all overflow-hidden">
              <div className="absolute -top-3.5 left-6 bg-slate-800 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1 z-10">
                <Cpu className="h-3 w-3 text-purple-400" />
                <span>Prossimamente • Corso Avanzato</span>
              </div>

              {/* Banner Immagine Corso 2 */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 relative mt-2">
                <img
                  src="/images/ai_pro_b2b_course_banner.jpg"
                  alt="AI Pro B2B Banner"
                  className="w-full h-44 object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase bg-slate-800 text-slate-300">Livello Avanzato B2B</Badge>
                  <Badge variant="warning" className="text-[9px] uppercase">Lista d'Attesa</Badge>
                </div>

                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  AI Pro & Agenti Autonomi B2B
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Progettazione avanzata di Agenti AI autonomi, integrazione via API, RAG personalizzati e workflow complessi per aziende.
                </p>

                <div className="space-y-2 text-xs text-slate-400 pt-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Architetture Agenti autonomi & Multi-Agenti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Integrazione API Supabase, Resend & Webhooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Caso studio reale: Automazione processi PMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Coupon sconto lancio riservato agli iscritti</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsWaitlistModalOpen(true)}
                variant="outline"
                className="w-full border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 text-purple-300 font-bold h-12 rounded-xl gap-2"
              >
                <BellRing className="h-4 w-4 text-purple-400" />
                <span>Iscriviti alla Lista d'Attesa</span>
              </Button>
            </div>
          </div>
        </div>

        {/* VETRINA INTERATTIVA: SECONDO CERVELLO & NEURAL KNOWLEDGE GRAPH */}
        <SecondBrainSection />

        {/* DEMO PROMPT SIMULATOR INTERATTIVO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div className="text-center space-y-2">
            <Badge variant="purple" className="text-[10px] uppercase font-bold">Prova dal Vivo</Badge>
            <h3 className="text-2xl font-bold text-white">Metti alla prova l'Assistente @AI</h3>
            <p className="text-xs text-slate-400">Scrivi una domanda o una richiesta per vedere come risponde l'IA.</p>
          </div>

          <form onSubmit={handleRunDemoPrompt} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={demoPromptInput}
                onChange={(e) => setDemoPromptInput(e.target.value)}
                placeholder="Es. Scrivi un prompt per riassumere le risposte commerciali..."
                className="bg-slate-950 border-slate-800 text-white text-xs h-11"
              />
              <Button type="submit" disabled={isDemoThinking || !demoPromptInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-6 gap-2">
                {isDemoThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Prova</span>
              </Button>
            </div>

            {demoResponse && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                {demoResponse}
              </div>
            )}
          </form>
        </div>

        {/* PROGRAMMA COMPLETO 20 MODULI AI START */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 lg:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <Badge variant="purple" className="text-[10px] uppercase font-bold mb-2">Programma Formativo AI Start</Badge>
              <h2 className="text-2xl font-bold text-white">I 20 Moduli Video di AI Start</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-semibold">20 Lezioni • Player HTML5 HD</span>
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

        {/* FAQ ACCORDION */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Domande Frequenti (FAQ)</h2>
            <p className="text-xs text-slate-400">Tutto quello che c'è da sapere su AI Start e sui nostri corsi.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-slate-800 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
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
            <button onClick={() => setIsWaitlistModalOpen(true)} className="hover:text-slate-300">Corso Avanzato AI Pro</button>
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
                <h3 className="font-bold text-sm text-white">Area Studenti — Hai già il codice?</h3>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
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
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Es. AI-8QASM3 oppure DEMO2026"
                  className="text-center font-mono uppercase tracking-widest font-bold text-sm h-12 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-600/20">
                Accedi al Corso
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM QUESTIONARIO & ISCRIZIONE AI START */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-800 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Richiesta di Iscrizione: AI Start</h3>
              </div>
              <button
                onClick={() => {
                  setIsEnrollModalOpen(false)
                  setEnrollSuccess(false)
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {enrollSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-lg text-white">Richiesta Ricevuta con Successo!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Grazie <strong>{nameInput}</strong>. Abbiamo registrato le tue risposte al questionario.
                  <br /><br />
                  Il nostro team verificherà la tua richiesta e ti invieremo un&apos;email a <strong>{emailInput}</strong> con il tuo <strong>Codice di Accesso personale</strong> non appena il profilo sarà approvato.
                </p>
                <Button
                  onClick={() => {
                    setIsEnrollModalOpen(false)
                    setEnrollSuccess(false)
                    setNameInput('')
                    setEmailInput('')
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2 rounded-xl mt-2"
                >
                  Ho Capito
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Compila questo breve questionario per richiedere l&apos;accesso gratuito al corso e alle registrazioni video.
                </p>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Nome e Cognome *</label>
                  <Input
                    autoFocus
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Es. Mario Rossi"
                    className="bg-slate-950 border-slate-800 text-white text-xs"
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
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Esperienza attuale con l&apos;AI *</label>
                  <select
                    value={aiExperience}
                    onChange={(e) => setAiExperience(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Mai">Mai usata</option>
                    <option value="Qualche prova (tipo ChatGPT ogni tanto)">Qualche prova (tipo ChatGPT ogni tanto)</option>
                    <option value="Li uso abbastanza spesso">Li uso abbastanza spesso</option>
                    <option value="Li uso ogni giorno">Li uso ogni giorno</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Il tuo Obiettivo principale *</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Migliorare il lavoro o il business">Migliorare il lavoro o il business</option>
                    <option value="Trovare idee e fare brainstorming">Trovare idee e fare brainstorming</option>
                    <option value="Scrivere testi e contenuti">Scrivere testi e contenuti</option>
                    <option value="Altro">Altro / Curiosità personale</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Cosa ti blocca o trovi più difficile? *</label>
                  <select
                    value={blocker}
                    onChange={(e) => setBlocker(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Non so da dove iniziare">Non so da dove iniziare</option>
                    <option value="Non capisco come usarla nel mio lavoro">Non capisco come usarla nel mio lavoro</option>
                    <option value="Ho paura di usarla male">Ho paura di usarla male</option>
                    <option value="Non ho tempo">Non ho tempo da dedicarci</option>
                    <option value="Non ottengo risultati utili">Non ottengo risultati utili</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Cosa ti aspetti dal percorso? *</label>
                  <select
                    value={expectation}
                    onChange={(e) => setExpectation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Voglio sperimentare e capire">Voglio sperimentare e capire</option>
                    <option value="Voglio risultati pratici subito">Voglio risultati pratici subito</option>
                    <option value="Voglio imparare le basi con calma">Voglio imparare le basi con calma</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-600/20 mt-4"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Invio della Richiesta...
                    </>
                  ) : (
                    'Invia Richiesta di Registrazione'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: LISTA D'ATTESA CORSO AVANZATO AI PRO */}
      {isWaitlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Lista d'Attesa: AI Pro B2B</h3>
              </div>
              <button onClick={() => setIsWaitlistModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {waitlistSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-base text-white">Sei in lista d'attesa!</h4>
                <p className="text-xs text-slate-400">Ti invieremo un invito prioritario ed un coupon sconto non appena le lezioni saranno pronte.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="p-6 space-y-4 text-xs">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Lascia la tua email per ricevere una notifica prioritaria ed il coupon sconto del 30% al lancio del Corso Avanzato.
                </p>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Indirizzo Email *</label>
                  <Input
                    autoFocus
                    required
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Es. nome@azienda.it"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-purple-600/20">
                  Iscriviti alla Lista d'Attesa
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface BrainNodeData {
  id: string
  title: string
  subtitle: string
  category: string
  icon: any
  badge: string
  badgeColor: string
  color: string
  glowColor: string
  description: string
  highlights: string[]
  exampleSnippet: string
  syncDetails: string
}

const BRAIN_NODES: BrainNodeData[] = [
  {
    id: 'core',
    title: '🧠 AI Second Brain Hub',
    subtitle: 'Il Nucleo Centrale di Conoscenza',
    category: 'Nucleo Centrale',
    icon: Sparkles,
    badge: 'Motore 24/7',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    color: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    description: 'Il cuore intelligente che coordina prompt, memorie degli agenti, dispense dei corsi e progetti del team in un grafo vivente e costantemente aggiornato.',
    highlights: [
      'Memoria condivisa e permanente per tutti gli assistenti AI',
      'Nessun dato duplicato: una sola fonte di verità per tutto il team',
      'Interrogazione istantanea in linguaggio naturale via chat'
    ],
    exampleSnippet: `// Interrogazione semantica del Secondo Cervello:
queryBrain("Qual è la formula per l'email commerciale B2B approvata per il Cliente Rossi?")
→ ⚡ Risposta generata in 400ms con fonti collegate: [[Modulo_08_Email]], [[Cliente_Rossi_B2B]]`,
    syncDetails: 'Sincronizzazione in tempo reale su Supabase Cloud PostgreSQL.'
  },
  {
    id: 'prompt',
    title: '📚 Prompt Library & Frameworks',
    subtitle: '50+ Formule Collaudate sul Campo',
    category: 'Libreria Operativa',
    icon: Terminal,
    badge: 'Framework RCCF',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'Un archivio strutturato di prompt ad alte prestazioni: formula RCCF, Reverse Prompting, template per copywriting, analisi Excel avanzata e prompt visivi.',
    highlights: [
      'Formula Segreta RCCF: Ruolo + Contesto + Contenuto + Formato',
      'Prompt per pulizia dati e formule Excel (CERCA.X, Macro VBA)',
      'Prompt visivi fotorealistici per Midjourney, DALL-E e Canva'
    ],
    exampleSnippet: `### 🎯 Prompt Formula RCCF (Modulo 5):
**[RUOLO]** Senior Copywriter B2B
**[CONTESTO]** Lancio offerta software di automazione per PMI italiane
**[CONTENUTO]** Sequenza di 3 email di follow-up persuasive senza sembrare invadenti
**[FORMATO]** Markdown con Oggetto, Corpo e Call-to-Action chiara`,
    syncDetails: 'Pronto da copiare in 1 click o esportare nel tuo Obsidian Vault.'
  },
  {
    id: 'aistart',
    title: '🎓 Corso AI Start (20 Moduli)',
    subtitle: 'Fondamenta & Produttività Personale',
    category: 'Formazione Base',
    icon: GraduationCap,
    badge: '20 Video HD',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Il percorso pratico passo-passo per chi parte da zero: superare il foglio bianco, dominare i modelli linguistici e risparmiare 10 ore di lavoro ogni settimana.',
    highlights: [
      '20 lezioni video in alta risoluzione con sottotitoli',
      'Assistente @AI dedicato attivo su ogni modulo 24/7',
      'Attestato Ufficiale Verificato in Full HD al completamento'
    ],
    exampleSnippet: `// Argomenti chiave inclusi:
1. Benvenuti nel Futuro • 2. Breve Storia • 3. Foglio Bianco • 4. Chiarezza • 5. RCCF
6. Iterazione • 7. Modelli (Claude, ChatGPT, Gemini, Perplexity) • 8. Scrivere senza Sforzo
9. Dipingere con le Parole • 12. Excel • 15. Allucinazioni • 18. Workflow Personale`,
    syncDetails: 'Player HTML5 integrato con tracciamento automatico dei progressi.'
  },
  {
    id: 'aipro',
    title: '⚡ AI Pro & Agenti Autonomi',
    subtitle: 'Automazioni Aziendali Avanzate B2B',
    category: 'Formazione Avanzata',
    icon: Cpu,
    badge: 'Prossimo Lancio',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    color: 'from-purple-600 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Progettazione di architetture multi-agente, integrazione webhook, flussi n8n e sistemi RAG per connettere l’IA ai database e ai software aziendali.',
    highlights: [
      'Costruzione di Agenti Autonomi con memoria persistente',
      'Integrazione Webhook, trigger automatici e API REST',
      'Casi studio reali di automazione per PMI e professionisti'
    ],
    exampleSnippet: `// Architettura Agente Autonomo:
[Nuova Email Ricevuta] 
  → 🧠 Agente Analisi Intento (Gemini Flash)
  → 📋 Creazione Automatica Task su Bacheca Kanban
  → ✉️ Bozza di Risposta Commerciale Generata in 2s
  → 🔔 Notifica al Team`,
    syncDetails: 'Lista d’attesa attiva con coupon sconto prioritario.'
  },
  {
    id: 'obsidian',
    title: '🔮 Obsidian & Markdown Native',
    subtitle: 'Collegamenti Bidirezionali & Zero Lock-in',
    category: 'Ecosistema Conoscenza',
    icon: Network,
    badge: '[[Wikilinks]]',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    color: 'from-violet-500 to-indigo-700',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    description: 'Tutti i contenuti sono strutturati in Markdown `.md` puro con collegamenti bidirezionali `[[link]]`: puoi aprirli su Obsidian per navigare la mappa concettuale interattiva.',
    highlights: [
      'File aperti e leggibili: i tuoi dati restano per sempre tuoi',
      'Visualizzazione a Grafo delle Relazioni (Graph View)',
      'Esportazione in 1 click del Vault completo pronto all’uso'
    ],
    exampleSnippet: `// Esempio di Nota Interconnessa Obsidian:
# [[Lezione 05 - Formula RCCF]]
Vedi anche: [[Lezione 08 - Scrivere senza Sforzo]], [[Template Email B2B]]
Utilizzato da: [[Agente Copywriter]], [[Progetto Consulenza Rossi]]

> "La precisione del vincolo determina la qualità dell'output."`,
    syncDetails: 'Piena compatibilità con l’app desktop e mobile di Obsidian.'
  },
  {
    id: 'cloud',
    title: '🔒 Proton Drive & Cloud Sicuro',
    subtitle: 'Crittografia E2E & Database Supabase',
    category: 'Sicurezza & Cloud',
    icon: ShieldCheck,
    badge: 'Zero Retention',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'Protezione massima: sincronizzazione sicura con Proton Drive crittografato end-to-end e database ad alta affidabilità su Supabase Cloud.',
    highlights: [
      'Nessun addestramento dei modelli sui tuoi dati riservati',
      'Backup continuo e sincronizzazione multi-dispositivo',
      'Conformità GDPR e protezione dei file aziendali'
    ],
    exampleSnippet: `// Protocollo di Sicurezza & Cloud Sync:
[Cloud Database Supabase] ⟷ [Cartella Sincronizzata Proton Drive E2E]
  • Crittografia Zero-Knowledge
  • Accesso multi-device protetto (Mac, PC, Smartphone)
  • Backup automatico delle note e dei compiti`,
    syncDetails: 'Crittografia a riposo e in transito con chiavi private.'
  }
]

function SecondBrainSection() {
  const [activeNodeId, setActiveNodeId] = useState<string>('core')
  const activeNode = BRAIN_NODES.find((n) => n.id === activeNodeId) || BRAIN_NODES[0]

  return (
    <div className="relative bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden space-y-10">
      {/* Background Neural Glow Beams */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-xs">
          <Network className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span>L'Ecosistema Interconnesso • Visione Secondo Cervello</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Non un semplice corso, ma il tuo{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Secondo Cervello
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Tutti i nodi sono interconnessi: le lezioni alimentano la <strong>Prompt Library</strong>, l’assistente <strong>@AI</strong> ricorda il contesto operativo, e le tue note si sincronizzano con <strong>Obsidian</strong> e <strong>Proton Drive</strong>.
        </p>
      </div>

      {/* INTERACTIVE NEURAL KNOWLEDGE GRAPH & INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Neural Nodes Graph Interactive Map */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-950/80 rounded-3xl border border-slate-800 relative min-h-[440px] overflow-hidden">
          {/* Radial Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px] opacity-30 pointer-events-none" />

          {/* SVG Neural Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Animated Pulses */}
            <circle cx="50%" cy="50%" r="140" fill="none" stroke="url(#neuralGrad)" strokeWidth="1" strokeDasharray="4 6" className="animate-spin opacity-30" style={{ animationDuration: '40s' }} />
            <circle cx="50%" cy="50%" r="85" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin opacity-40" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
          </svg>

          {/* Interactive Nodes Orbit */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-5 w-full">
            {/* Central Node */}
            <button
              type="button"
              onClick={() => setActiveNodeId('core')}
              className={`p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center gap-3 transition-all hover:scale-105 border-2 ${
                activeNodeId === 'core' ? 'border-white ring-4 ring-indigo-500/40 scale-105' : 'border-indigo-400/40'
              }`}
            >
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black tracking-wide uppercase">Core AI Brain</span>
                <span className="text-[10px] text-indigo-100 font-normal">Nucleo Interconnesso</span>
              </div>
            </button>

            {/* Orbiting Satellite Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md pt-2">
              {BRAIN_NODES.filter((n) => n.id !== 'core').map((node) => {
                const isSelected = activeNodeId === node.id
                const IconComponent = node.icon

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNodeId(node.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative group overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-400 ring-2 ring-indigo-500/40 shadow-lg scale-102'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`h-7 w-7 rounded-lg bg-gradient-to-tr ${node.color} text-white flex items-center justify-center shadow-xs`}>
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">[[.md]]</span>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {node.title.replace(/^[^\w\s]*\s*/, '')}
                      </span>
                      <span className="block text-[10px] text-slate-400 line-clamp-1">
                        {node.category}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <span className="text-[10px] text-slate-500 font-mono mt-4 relative z-10">
            💡 Clicca su qualsiasi nodo per esplorare la connessione sinaptica
          </span>
        </div>

        {/* Right Side: Live Node Inspector Panel */}
        <div className="lg:col-span-6 bg-slate-950/90 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Header of Active Node */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${activeNode.color} text-white flex items-center justify-center shadow-lg`}>
                <activeNode.icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {activeNode.category}
                </span>
                <h3 className="text-xl font-black text-white leading-tight">
                  {activeNode.title}
                </h3>
                <span className="text-xs text-slate-400">
                  {activeNode.subtitle}
                </span>
              </div>
            </div>

            <Badge className={`text-[10px] uppercase font-mono px-2.5 py-1 ${activeNode.badgeColor}`}>
              {activeNode.badge}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeNode.description}
          </p>

          {/* Key Highlights */}
          <div className="space-y-2 text-xs text-slate-300">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              ✨ Caratteristiche Chiave:
            </span>
            {activeNode.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          {/* Live Code / Snippet Preview */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Struttura del Nodo</span>
              <span className="text-emerald-400 font-semibold">{activeNode.syncDetails}</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {activeNode.exampleSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

