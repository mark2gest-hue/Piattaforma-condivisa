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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { sendSharedEmail } from './(dashboard)/posta/actions'
import { createClient } from '@/lib/supabase/client'
import { enrollStudentAction, joinWaitlistAction } from '@/app/actions/student'

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

  // Form Iscrizione Rapida AI Start
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

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

    const result = await enrollStudentAction({
      studentName: nameInput.trim(),
      studentEmail: emailInput.trim(),
      courseTitle: "AI Start - Domina l'IA da Zero",
      source: 'landing',
    })

    if (!result.success) {
      alert(`Errore durante l'iscrizione: ${result.error}`)
      setIsRegistering(false)
      return
    }

    const generatedCode = result.code || ''

    alert(`Iscrizione completata con successo! Il tuo Codice di Accesso è: ${generatedCode}. Ti abbiamo inviato una mail di conferma.`)
    setIsRegistering(false)
    setIsEnrollModalOpen(false)

    router.push(`/corsi?tab=login&code=${encodeURIComponent(generatedCode)}`)
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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                aiutiamoci.cloud <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Ti AIuto</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Formazione ed Agenti IA</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 border border-slate-800 rounded-xl bg-slate-900/80 hover:bg-slate-800"
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
              <span>Hai un codice? Accedi</span>
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
                <h3 className="font-bold text-sm text-white">Area Studenti — Riscatta Codice</h3>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
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

      {/* MODAL 2: FORM ISCRIZIONE RAPIDA AI START */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Iscrizione a AI Start</h3>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
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
