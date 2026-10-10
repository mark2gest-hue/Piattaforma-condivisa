'use client'

import { useState, useEffect } from 'react'
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
import {
  enrollStudentAction,
  joinWaitlistAction,
  submitCourseRegistrationAction,
  checkStudentRegistrationByEmailAction,
} from '@/app/actions/student'
import { LegalModal, CookieBanner } from '@/components/legal/LegalModal'
import { decodeReferralCode } from '@/lib/referral-mask'

// Link Pagamento Esterno ATOMA (configurabile da .env)
const ATOMA_PAYMENT_URL = process.env.NEXT_PUBLIC_ATOMA_PAYMENT_URL || 'https://www.atoma.com/product/ai-operativa-per-il-lavoro-percorso-pratico-di-16-ore/'

const FAQS = [
  { q: 'I corsi rilasciano una certificazione ufficiale?', a: 'Certamente! I nostri percorsi formativi rilasciano la Certificazione delle Competenze a livello europeo, emessa in collaborazione con l\'Ente Certificatore ATOMA tramite docente qualificato ed autorizzato.' },
  { q: 'Serve saper programmare o avere competenze tecniche?', a: 'Assolutamente no! AI Start è stato progettato appositamente per chi parte da zero. Spieghiamo tutto in modo chiaro, senza tecnicismi.' },
  { q: 'Come funziona l’accesso alle lezioni video?', a: 'Al momento dell’iscrizione riceverai un Codice Univoco personale (es. AI-START-8F92). Inserendolo nell’Area Studenti sbloccherai subito tutti i 20 video ed il player HTML5.' },
  { q: 'Cos’è l’Assistente @AI in Chat?', a: 'È il tuo tutor virtuale integrato nella piattaforma. Durante la visione delle lezioni puoi digitare @AI per porre qualsiasi domanda e ricevere risposte istantanee.' },
  { q: 'Quando uscirà il Corso Avanzato AI Pro?', a: 'Il percorso avanzato "AI Pro & Agenti Autonomi B2B" è attualmente in fase di preparazione. Puoi iscriverti alla lista d’attesa in un click per ricevere un invito prioritario ed un coupon sconto!' },
]

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form Iscrizione & Questionario AI Start
  // Form Iscrizione Semplificato AI Start
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [referrerName, setReferrerName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  // Modal Pagamento Diretto ATOMA
  const [isDirectPaymentModalOpen, setIsDirectPaymentModalOpen] = useState(false)
  const [directPaymentEmail, setDirectPaymentEmail] = useState('')
  const [isCheckingPaymentEmail, setIsCheckingPaymentEmail] = useState(false)
  const [paymentEmailError, setPaymentEmailError] = useState<string | null>(null)
  const [verifiedStudentName, setVerifiedStudentName] = useState<string | null>(null)

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

  // Tab Anteprima Showcase Piattaforma Studenti
  const [showcaseTab, setShowcaseTab] = useState<'player' | 'chat' | 'certificate'>('player')

  // Modale Legale (Privacy, Cookies, Termini, Disclaimer)
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'cookies' | 'terms' | 'disclaimer' | null>(null)

  // Rilevamento automatico Referral da URL (?ref=TOKEN)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const refUrl = urlParams.get('ref') || urlParams.get('referral')
        const savedRef = sessionStorage.getItem('course_referral_code')
        const activeRef = refUrl || savedRef

        if (activeRef) {
          const decoded = decodeReferralCode(activeRef.trim())
          setReferrerName(decoded)
          sessionStorage.setItem('course_referral_code', activeRef.trim())
        }
      }
    } catch {
      // safe fallback
    }
  }, [])

  const handleStudentAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
    // Se qualcuno prova a incollare un token referral "REF-..." come codice studente, viene bloccato
    if (cleanCode.startsWith('REF-')) {
      alert('Questo è un link di invito/referral, non un codice di accesso valido per entrare al corso. Per accedere usa il codice univoco personale ricevuto via email.')
      return
    }

    router.push(`/corsi?tab=login&code=${encodeURIComponent(cleanCode)}`)
  }

  // Verifica email prima del pagamento: se l'email esiste, mostra il tasto di pagamento
  const handleDirectPaymentCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = directPaymentEmail.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      setPaymentEmailError('Inserisci un indirizzo email valido.')
      return
    }

    setIsCheckingPaymentEmail(true)
    setPaymentEmailError(null)
    setVerifiedStudentName(null)

    const res = await checkStudentRegistrationByEmailAction(clean)
    setIsCheckingPaymentEmail(false)

    if (res.exists) {
      setVerifiedStudentName(res.name || 'Studente')
    } else {
      setPaymentEmailError('Questa email non risulta ancora registrata. Prima di accedere al pagamento compila la registrazione gratuita per riservare il posto e ricevere il codice!')
    }
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || !emailInput.trim()) return
    setIsRegistering(true)

    const result = await submitCourseRegistrationAction({
      name: nameInput.trim(),
      email: emailInput.trim(),
      ai_experience: 'Partecipante Masterclass',
      objective: 'Applicare l\'AI nel lavoro',
      blocker: 'Nessuno',
      expectation: 'Imparare strumenti pratici',
      referral_source: 'Landing Page / Masterclass',
      referred_by: referrerName.trim() || undefined,
      raw_answers: {
        phone: phoneInput.trim() || null,
        referred_by: referrerName.trim() || null,
        source: 'Sito Web Aiutiamoci',
      },
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

  // Parallasse dinamica su scroll
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll Reveal 3D con IntersectionObserver nativo
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#03060f] text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Sfondo Fisico & Griglia Parallasse Strutturata (Movimento dinamico differenziato) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Livello 1: Texture cartesiana (0.15x scroll speed) */}
        <div
          className="absolute inset-0 opacity-[0.035] will-change-transform"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          }}
        />
        {/* Livello 2: Glow zenitale radente (0.25x scroll speed) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-blue-600/20 via-indigo-600/5 to-transparent rounded-full blur-3xl will-change-transform"
          style={{
            transform: `translate3d(-50%, ${scrollY * 0.22}px, 0)`,
          }}
        />
        {/* Livello 3: Globi laterali di rifrazione (0.35x scroll speed) */}
        <div
          className="absolute top-1/3 -right-60 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[140px] will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.3}px, 0)`,
          }}
        />
        <div
          className="absolute bottom-1/4 -left-60 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[140px] will-change-transform"
          style={{
            transform: `translate3d(0, ${-scrollY * 0.18}px, 0)`,
          }}
        />
      </div>

      {/* Header Navigation Bar */}
      <header className="relative z-30 border-b border-white/[0.08] bg-[#03060f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo_icon_dark.png"
                alt="AI Sviluppo - aiutiamoci.cloud"
                className="h-9 w-9 object-contain rounded-xl p-1 bg-slate-900/90 border border-white/10 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
                  aiutiamoci.cloud
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase truncate">Aiutiamoci Academy</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="h-3.5 w-3.5 text-blue-400" />
              <span>Ho un codice</span>
            </button>
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 px-3 py-1.5 transition-colors flex items-center gap-1.5 border border-white/10 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER VERTICALE CON SCROLL NATURALE & CARD STACKING */}
      <main className="relative z-10 w-full flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-24 sm:space-y-32">
        {/* SEZIONE 1: HERO & REGISTRAZIONE */}
        <section data-reveal className="text-center space-y-8 max-w-4xl mx-auto pt-4 sm:pt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-[11px] font-mono uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Formazione Pratica AI & Agenti Autonomi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Domina l'Intelligenza Artificiale <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              da Zero all'Agentistica
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            L'Intelligenza Artificiale non è magia, è uno strumento di lavoro. Impara a delegare i compiti ripetitivi, moltiplicare la produttività e governare gli agenti con videolezioni guidate e un tutor virtuale <strong className="text-white">@AI</strong> operativo 24/7.
          </p>

          {/* CTA MAIN BUTTONS */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-2xl mx-auto">
            <Button
              onClick={() => setIsEnrollModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12.5 px-8 rounded-xl gap-2 shadow-lg shadow-blue-950/60 text-sm transition-all cursor-pointer"
            >
              <span>Registrati alla Masterclass</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setIsDirectPaymentModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-semibold h-12.5 px-6 rounded-xl gap-2 text-sm shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Iscrizione Diretta (€)</span>
            </Button>

            <Button
              onClick={() => setIsStudentModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold h-12.5 px-6 rounded-xl gap-2 text-sm transition-all cursor-pointer"
            >
              <Key className="h-4 w-4 text-blue-400" />
              <span>Accedi con Codice</span>
            </Button>
          </div>
        </section>

        {/* SEZIONE 2: I DUE LIVELLI FORMATIVI */}
        <section id="corsi" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 bg-blue-950/40 border border-blue-500/20 px-3.5 py-1 rounded-full inline-block">
              Percorsi Formativi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Scegli il livello più adatto alle tue esigenze
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Dall'operatività quotidiana per professionisti fino all'architettura di agenti autonomi integrati nelle aziende.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto perspective-1000">
            {/* CORSO 1: AI START (Reveal da sinistra con inclinazione 3D) */}
            <div
              data-reveal="left"
              className="rounded-3xl p-8 sm:p-9 flex flex-col justify-between space-y-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(180deg, #0e1526 0%, #060a14 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px -10px rgba(59, 130, 246, 0.15)',
              }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-600/90 text-white text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Disponibile Ora • AI Start</span>
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Masterclass Inclusa
                  </span>
                </div>

                {/* Micro Terminal Metriche Tecniche invece del Banner Fake AI */}
                <div className="rounded-2xl p-4 bg-black/60 border border-white/10 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>COURSE_ID: AI_START_2026</span>
                    </span>
                    <span className="text-emerald-400">STATUS: ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">LEZIONI</span>
                      <strong className="text-white text-xs">20 Video HD</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">DURATA</span>
                      <strong className="text-white text-xs">16 Ore Tot.</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">TUTOR</span>
                      <strong className="text-blue-400 text-xs">@AI 24/7</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Livello Base & Operativo
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    AI Start — Domina l'IA nel Lavoro Quotidiano
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    20 videolezioni pratiche per automatizzare documenti, email, presentazioni, fogli Excel e interagire con il Tutor @AI.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>20 Videolezioni pratiche in alta definizione</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Tutor virtuale @AI operativo 24/7 in chat</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Accesso personale illimitato tramite Codice Univoco</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-300 font-medium">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Certificazione Europea con Ente ATOMA (Docente Autorizzato)</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setTimeout(() => setIsEnrollModalOpen(true), 300)
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12 rounded-xl gap-2 shadow-lg shadow-blue-950/60 transition-all cursor-pointer text-sm"
              >
                <span>Partecipa alla Masterclass Gratuita</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* CORSO 2: AI PRO B2B (Reveal da destra con inclinazione 3D) */}
            <div
              data-reveal="right"
              className="rounded-3xl p-8 sm:p-9 flex flex-col justify-between space-y-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(180deg, #0e1526 0%, #060a14 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)',
              }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Cpu className="h-3 w-3 text-blue-400" />
                    <span>In Preparazione • Livello B2B</span>
                  </span>
                  <Badge variant="warning" className="text-[9px] uppercase font-mono">Lista d'Attesa</Badge>
                </div>

                {/* Micro Terminal Metriche Architettura B2B */}
                <div className="rounded-2xl p-4 bg-black/60 border border-white/10 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <Binary className="h-3.5 w-3.5" />
                      <span>MODULE_CLASS: MULTI_AGENT_B2B</span>
                    </span>
                    <span className="text-amber-400">STATUS: WAITLIST</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">AGENTI</span>
                      <strong className="text-white text-xs">Orchestrati</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">INTEGRAZIONI</span>
                      <strong className="text-white text-xs">CRM & ERP</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="block text-slate-400 text-[10px]">STACK</span>
                      <strong className="text-indigo-400 text-xs">LiveKit & n8n</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Livello Avanzato & PMI
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    AI Pro — Sistemi Multi-Agente & Automazioni
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dalla generazione di prompt agli ecosistemi di Agenti Autonomi che eseguono task aziendali, si integrano con CRM/ERP e gestiscono flussi complessi.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong>Sistemi Multi-Agente</strong>: Orchestrazione e delega autonoma</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong>RAG Aziendale</strong>: Integrazione sicura documenti e database</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong>Agenti Vocali PMI</strong>: Centralini e messaggistica intelligente</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong>Automazioni n8n</strong>: Flussi end-to-end senza attrito</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsWaitlistModalOpen(true)}
                variant="outline"
                className="w-full border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold h-12 rounded-xl gap-2 transition-all cursor-pointer text-sm"
              >
                <BellRing className="h-4 w-4 text-blue-400" />
                <span>Richiedi Accesso Prioritario (Lista d'Attesa)</span>
              </Button>
            </div>
          </div>

          {/* BANNER CERTIFICAZIONE ATOMA */}
          <div
            data-reveal
            className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(180deg, #0b1522 0%, #060c16 100%)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderTop: '1px solid rgba(16, 185, 129, 0.45)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">
                    Certificazione Europea delle Competenze
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono py-0.5 px-2">
                    Ente ATOMA
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Percorso formativo con rilascio di Attestato Ufficiale e Certificazione delle Competenze (Docente Autorizzato ATOMA).
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-1.5 rounded-lg shrink-0">
              Valido ai fini professionali
            </span>
          </div>
        </section>

        {/* SEZIONE 3: SIMULATORE PIATTAFORMA & PROMPT INTERATTIVO */}
        <section data-reveal className="space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 bg-blue-950/40 border border-blue-500/20 px-3.5 py-1 rounded-full inline-block">
              Esperienza Studente
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Testa dal vivo la piattaforma e il Tutor @AI
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Interfaccia essenziale, player ad alta definizione e supporto neurale istantaneo sui contenuti di studio.
            </p>
          </div>

          <div
            className="rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0a1120 0%, #050812 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
            }}
          >
            {/* Selettore Tab di Simulazione */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Ambiente di Studio Interattivo
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setShowcaseTab('player')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${showcaseTab === 'player'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>1. Video Player HD</span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('chat')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${showcaseTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                <Bot className="h-3.5 w-3.5 text-emerald-400" />
                <span>2. Tutor @AI 24/7</span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('certificate')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${showcaseTab === 'certificate'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>3. Attestato Ufficiale</span>
              </button>
            </div>
          </div>

          {/* Finestra Showcase Interattiva con Glow Border */}
          <div className="relative rounded-3xl border-2 border-indigo-500/40 bg-slate-950 shadow-2xl shadow-indigo-500/20 overflow-hidden group">
            {/* Pillole Fluttuanti con Micro-Animazione */}
            <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 text-emerald-400 text-[11px] font-mono font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                20 Moduli Sbloccati
              </span>
            </div>

            {/* TAB 1: PLAYER SCREENSHOT REALE CON OVERLAY STATO */}
            {showcaseTab === 'player' && (
              <div className="relative animate-in fade-in duration-300">
                <img
                  src="/images/real_platform_preview.png"
                  alt="Interfaccia Reale Piattaforma Aiutiamoci"
                  className="w-full h-auto max-h-[500px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex items-end p-6 sm:p-10 pointer-events-none">
                  <div className="space-y-2 max-w-2xl text-left">
                    <Badge className="bg-indigo-600 text-white border-0 text-[10px] uppercase font-bold tracking-wider">
                      Area Riservata Studenti • Vista Player
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Player Video HD con Lezioni dei Docenti & Trascrizioni
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed hidden sm:block">
                      Interfaccia italiana, pulita e priva di distrazioni: segui i 20 moduli registrati dai docenti di <strong>aiutiamoci.cloud</strong> e tieni traccia dei tuoi progressi in tempo reale.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SIMULAZIONE LIVE CHAT CON TUTOR @AI */}
            {showcaseTab === 'chat' && (
              <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 space-y-6 min-h-[420px] flex flex-col justify-between animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>Tutor Didattico Virtuale @AI</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-slate-400">Addestrato sul programma esatto dei 20 moduli</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800/80 text-[10px] font-mono">
                    Risposta in ~0.3s
                  </Badge>
                </div>

                <div className="space-y-4 text-xs font-mono max-w-3xl">
                  {/* Domanda Studente */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-md shadow-md">
                      <span className="text-[10px] text-indigo-200 block mb-1">Studente (durante Modulo 05):</span>
                      "Mi spieghi in 2 righe come applico la formula RCCF per scrivere una mail commerciale efficace?"
                    </div>
                  </div>

                  {/* Risposta AI */}
                  <div className="flex items-start gap-3 justify-start">
                    <div className="h-7 w-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-xl shadow-md space-y-2 leading-relaxed">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                        <span>Assistente @AI</span>
                        <span className="text-emerald-400">● Verifica Docente OK</span>
                      </div>
                      <p className="text-xs font-sans text-slate-300">
                        Ecco la struttura esatta da usare:<br />
                        <strong>• R (Ruolo)</strong>: "Agisci da copywriter B2B senior."<br />
                        <strong>• C (Contesto)</strong>: "La nostra azienda offre automazioni per PMI."<br />
                        <strong>• C (Contenuto)</strong>: "Invita il cliente ad una demo gratuita di 15 min."<br />
                        <strong>• F (Formato)</strong>: "Massimo 80 parole, tono cordiale e professionale."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>💡 Puoi fare qualsiasi domanda durante la riproduzione del video.</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      setTimeout(() => setIsEnrollModalOpen(true), 300)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 px-4 rounded-xl text-xs gap-1.5"
                  >
                    <span>Sblocca il Tutor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: ANTEPRIMA ATTESTATO DI COMPLETAMENTO & CERTIFICAZIONE */}
            {showcaseTab === 'certificate' && (
              <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 space-y-6 min-h-[420px] flex flex-col justify-between animate-in fade-in duration-300">
                <div className="max-w-2xl mx-auto w-full p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl relative space-y-4 text-center">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                      Certificato Ufficiale
                    </Badge>
                  </div>

                  <div className="inline-flex h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 items-center justify-center text-amber-400">
                    <Award className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-mono tracking-widest text-slate-400">Attestato di Superamento Corso</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">AI Start — Competenze Digitali & IA</h3>
                    <p className="text-xs text-slate-300">Rilasciato a completamento dei 20 moduli con esito positivo dei quiz didattici.</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Ente: <strong>ATOMA Formazione</strong></span>
                    <span>Validità: <strong>Livello Europeo</strong></span>
                    <span>Docente: <strong>Autorizzato</strong></span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400">
                  <span>L'attestato viene generato in PDF ad alta risoluzione con codice di verifica univoco anticontraffazione.</span>
                </div>
              </div>
            )}
          </div>
        </div>

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
      </section>


        {/* SEZIONE 4: DOCENTI & SQUADRA */}
        <section data-reveal className="space-y-12">
          <div
            className="rounded-3xl p-8 sm:p-12 space-y-8 max-w-5xl mx-auto relative overflow-hidden transition-all duration-300 hover:scale-[1.005]"
            style={{
              background: 'linear-gradient(180deg, #0e1526 0%, #060a14 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Foto dei 3 Soci / Docenti */}
              <div className="md:col-span-6 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl w-full group">
                  <img
                    src="/images/team_docenti.jpg"
                    alt="I Docenti di Aiutiamoci: Marco, Stefano e Lorenzo"
                    className="w-full h-auto aspect-video sm:aspect-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                    <span className="text-[11px] font-mono font-bold text-white bg-black/80 border border-white/20 px-3.5 py-1 rounded-full backdrop-blur-md">
                      Marco • Stefano • Lorenzo
                    </span>
                  </div>
                </div>
              </div>

              {/* Presentazione Umana */}
              <div className="md:col-span-6 space-y-5 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 bg-blue-950/40 border border-blue-500/20 px-3 py-1 rounded-full inline-block">
                    Docenti & Fondatori
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                    Persone Reali, Esperienza Pratica e Zero Teoria Astratta
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Siamo <strong>Marco</strong>, <strong>Stefano</strong> e <strong>Lorenzo</strong>. Abbiamo creato <strong>aiutiamoci.cloud</strong> con un obiettivo chiaro: rendere l'Intelligenza Artificiale uno strumento quotidiano accessibile a professionisti e PMI senza dover imparare a programmare.
                </p>

                <div className="space-y-3 text-xs text-slate-300 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Dirette settimanali e Masterclass Live:</strong>
                      <span className="text-slate-400 block mt-0.5">Sessioni periodiche di Q&A per analizzare casi d'uso concreti sul campo.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Supporto Continuo su Telegram & Piattaforma:</strong>
                      <span className="text-slate-400 block mt-0.5">Canale dedicato con i docenti e il Tutor @AI attivo per qualsiasi domanda.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Docenti Autorizzati ATOMA:</strong>
                      <span className="text-slate-400 block mt-0.5">Formazione certificata a livello europeo per un valore reale e spendibile.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEZIONE 5: SECONDO CERVELLO */}
        <section data-reveal className="space-y-12">
          <SecondBrainSection />
        </section>

        {/* SEZIONE 6: FAQ ACCORDION */}
        <section data-reveal className="space-y-8 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Chiarezza & Trasparenza
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Domande Frequenti (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx
              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="p-5 rounded-2xl bg-[#0a1120] border border-white/10 cursor-pointer transition-all hover:border-white/20"
                >
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                  {isOpen && (
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* FOOTER SEMANTICO VERTICALE */}
        <footer className="border-t border-white/10 pt-10 pb-6 text-xs text-slate-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo_icon_dark.png"
                alt="AI Sviluppo"
                className="h-7 w-7 object-contain opacity-80"
              />
              <span>© 2026 <strong>aiutiamoci.cloud</strong>. Tutti i diritti riservati.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-medium">
              <button onClick={() => setIsStudentModalOpen(true)} className="hover:text-slate-300 transition-colors cursor-pointer">Area Studenti</button>
              <button onClick={() => setIsWaitlistModalOpen(true)} className="hover:text-slate-300 transition-colors cursor-pointer">Corso Avanzato AI Pro</button>
              <Link href="/login" className="hover:text-slate-300 transition-colors">Team Login</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Cookie Consent Banner & Legal Modal */}
      <CookieBanner onOpenPolicy={() => setLegalModalType('cookies')} />
      <LegalModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType}
      />

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

      {/* MODAL 1B: VERIFICA EMAIL & PAGAMENTO DIRETTO ATOMA */}
      {isDirectPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Pagamento Ufficiale • ATOMA Formazione</h3>
              </div>
              <button
                onClick={() => {
                  setIsDirectPaymentModalOpen(false)
                  setPaymentEmailError(null)
                  setDirectPaymentEmail('')
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {verifiedStudentName ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-white">Email Riconosciuta!</h4>
                  <p className="text-xs text-slate-300">
                    Bentornato <strong>{verifiedStudentName}</strong> (<em>{directPaymentEmail}</em>). Il tuo profilo è abilitato per l'acquisto della Masterclass.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      window.location.href = ATOMA_PAYMENT_URL
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span>Procedi al Pagamento su ATOMA</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVerifiedStudentName(null)
                    setDirectPaymentEmail('')
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline block mx-auto pt-1"
                >
                  Usa un'altra email
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectPaymentCheck} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <p className="text-slate-300 leading-relaxed font-medium">
                    Questo link è riservato a chi ha già partecipato alla Masterclass dal vivo o si è registrato alla piattaforma.
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Inserisci l&apos;email con cui ti sei registrato: il sistema verificherà che sei nei nostri registri e sbloccherà il pulsante per accedere al pagamento.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">La tua Email di Registrazione *</label>
                  <Input
                    autoFocus
                    required
                    type="email"
                    value={directPaymentEmail}
                    onChange={(e) => {
                      setDirectPaymentEmail(e.target.value)
                      setPaymentEmailError(null)
                      setVerifiedStudentName(null)
                    }}
                    placeholder="Es. mario.rossi@azienda.it"
                    className="bg-slate-950 border-slate-800 text-white text-xs h-11"
                  />
                </div>

                {paymentEmailError && (
                  <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/80 text-amber-200 text-xs space-y-2.5">
                    <p className="leading-relaxed">{paymentEmailError}</p>
                    <Button
                      type="button"
                      onClick={() => {
                        setEmailInput(directPaymentEmail)
                        setIsDirectPaymentModalOpen(false)
                        setIsEnrollModalOpen(true)
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg shadow-md"
                    >
                      Iscriviti Prima Gratuitamente
                    </Button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDirectPaymentModalOpen(false)
                      setPaymentEmailError(null)
                      setDirectPaymentEmail('')
                      setVerifiedStudentName(null)
                    }}
                    className="border-slate-800 text-slate-400 text-xs"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCheckingPaymentEmail}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
                  >
                    {isCheckingPaymentEmail ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifica in corso...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifica Email</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: FORM REGISTRAZIONE SNELLO AI START */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Iscrizione Masterclass: AI Start</h3>
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
                <h4 className="font-bold text-lg text-white">Iscrizione Registrata con Successo!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Grazie <strong>{nameInput}</strong>. Abbiamo riservato il tuo posto gratuito per la Masterclass in videoconferenza del <strong>Giovedì alle 21:00</strong>.
                  <br /><br />
                  Ti abbiamo inviato un&apos;email di conferma a <strong>{emailInput}</strong> con il link diretto per collegarti alla diretta.
                </p>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setIsEnrollModalOpen(false)
                      setEnrollSuccess(false)
                      setNameInput('')
                      setEmailInput('')
                      setPhoneInput('')
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-950/40"
                  >
                    Perfetto, Ho Capito!
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
                <p className="text-slate-300 text-xs leading-relaxed">
                  Registrati per partecipare alla prossima Masterclass dal vivo e riservare l&apos;accesso prioritario alla piattaforma.
                </p>

                {referrerName && (
                  <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-xl p-3 flex items-center gap-2.5 text-emerald-300 text-xs shadow-xs">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span>Sei stato invitato con codice: <strong className="font-mono text-emerald-200">{referrerName}</strong></span>
                      <p className="text-[10px] text-emerald-400/80 font-normal">Hai diritto all&apos;accreditamento prioritario.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Nome e Cognome *</label>
                  <Input
                    autoFocus
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Es. Mario Rossi"
                    className="bg-slate-950 border-slate-800 text-white text-xs h-11"
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
                    className="bg-slate-950 border-slate-800 text-white text-xs h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Telefono / WhatsApp (Consigliato)</label>
                  <Input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Es. 333 1234567"
                    className="bg-slate-950 border-slate-800 text-white text-xs h-11"
                  />
                  <span className="text-[10px] text-slate-400">Ti invieremo solo il promemoria e il link della Masterclass del Giovedì.</span>
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-600/20 mt-3 text-xs"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrazione in corso...
                    </>
                  ) : (
                    'Conferma Iscrizione alla Masterclass'
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
              className={`p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center gap-3 transition-all hover:scale-105 border-2 ${activeNodeId === 'core' ? 'border-white ring-4 ring-indigo-500/40 scale-105' : 'border-indigo-400/40'
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
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative group overflow-hidden ${isSelected
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

