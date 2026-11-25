'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Award,
  Bot,
  Loader2,
  Play,
  Send,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AcademyShowcaseProps {
  onOpenEnroll: () => void
}

type ShowcaseTab = 'player' | 'chat' | 'certificate'

const DESKTOP_TABS = [
  { id: 'player' as const, label: '01 Video HD', icon: Play },
  { id: 'chat' as const, label: '02 Tutor @AI 24/7', icon: Bot },
  { id: 'certificate' as const, label: '03 Attestato', icon: Award },
]

export function AcademyShowcase({ onOpenEnroll }: AcademyShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const pinRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  const [activeStep, setActiveStep] = useState(0)
  const [mobileTab, setMobileTab] = useState<ShowcaseTab>('player')
  const [demoPromptInput, setDemoPromptInput] = useState('')
  const [demoResponse, setDemoResponse] = useState<string | null>(null)
  const [isDemoThinking, setIsDemoThinking] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const l0 = layerRefs.current[0]
          const l1 = layerRefs.current[1]
          const l2 = layerRefs.current[2]
          const pinEl = pinRef.current
          const barEl = progressBarRef.current

          if (!l0 || !l1 || !l2 || !pinEl || !barEl) return

          gsap.set(l0, { opacity: 1, y: 0 })
          gsap.set([l1, l2], { opacity: 0, y: 28 })
          gsap.set(barEl, { scaleX: 0 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinEl,
              pin: true,
              scrub: 0.7,
              start: 'top 56px',
              end: '+=200%',
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx =
                  self.progress < 0.34 ? 0 : self.progress < 0.68 ? 1 : 2
                setActiveStep((prev) => (prev === idx ? prev : idx))
              },
            },
          })

          scrollTriggerRef.current = tl.scrollTrigger ?? null

          tl.to(barEl, { scaleX: 1, ease: 'none', duration: 3 }, 0)
            .to(
              l0,
              { opacity: 0, y: -24, duration: 0.4, ease: 'power2.inOut' },
              0.65
            )
            .to(
              l1,
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
              0.85
            )
            .to(
              l1,
              { opacity: 0, y: -24, duration: 0.4, ease: 'power2.inOut' },
              1.8
            )
            .to(
              l2,
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
              2.0
            )
            .to({}, { duration: 0.55 }, 2.45)
        }
      )

      return () => {
        scrollTriggerRef.current = null
        mm.revert()
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleDesktopTabClick = (idx: number) => {
    const st = scrollTriggerRef.current
    if (!st) {
      setActiveStep(idx)
      return
    }
    const targetProgress = idx === 0 ? 0.05 : idx === 1 ? 0.5 : 0.92
    const top = st.start + targetProgress * (st.end - st.start)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = demoPromptInput.trim()
    if (!trimmed || isDemoThinking) return

    setIsDemoThinking(true)
    setDemoResponse(null)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDemoResponse(
        `✨ RISPOSTA DELL'ASSISTENTE @AI:\n\nEcco la soluzione per: "${trimmed}"\n\n1. RUOLO: Esperto di produttività aziendale.\n2. STRATEGIA: Inserisci le informazioni chiave nel prompt usando elenchi puntati.\n3. RISULTATO: L'IA elabora il testo in pochi secondi senza errori.\n\nNel corso "AI Start" impariamo 20 tecniche simili per velocizzare il lavoro quotidiano!`
      )
      setIsDemoThinking(false)
    }, 900)
  }

  const renderPlayerLayer = () => (
    <div className="bg-[#090d16] rounded-md border border-[#090d16]/15 overflow-hidden">
      <div className="w-full bg-[#090d16] flex items-center justify-center p-2 sm:p-4">
        <img
          src="/images/academy-lesson-preview.jpg"
          alt="Anteprima Lezione AIutiamoci: Dal Caos all'Ordine Strutturato"
          className="w-full h-auto max-h-[420px] xl:max-h-[460px] object-contain bg-[#090d16]"
        />
      </div>
      <div className="border-t border-white/10 px-6 py-4 bg-[#090d16] text-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div
            className="text-[11px] uppercase tracking-widest text-[#94a3b8]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            AMBIENTE DIDATTICO REALE · 20 MODULI HD
          </div>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            Lezioni chiare dal caos all&apos;ordine strutturato, senza
            distrazioni, con prompt operativi e Tutor @AI integrato.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEnroll}
          className="bg-[#f8fafc] text-[#090d16] hover:bg-white rounded-md px-4 h-10 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Accedi alla Masterclass</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  const renderChatLayer = (inputId: string) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#090d16]/15 rounded-md overflow-hidden bg-[#f8fafc]">
      {/* Preview Chat Strutturata */}
      <div className="lg:col-span-6 p-6 sm:p-8 bg-[#090d16] text-[#f8fafc] flex flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              TUTOR DIDATTICO VIRTUALE @AI
            </span>
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#6366f1]/40 text-[#6366f1]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              MODULO 05 · LIVE
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
            <div className="p-4 rounded-md border border-white/12 bg-white/[0.03]">
              <div
                className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1.5"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                STUDENTE · DOMANDA IN LEZIONE
              </div>
              <p className="text-[#f8fafc]">
                @AI devo rispondere a un cliente che contesta una fattura ma
                voglio mantenere un tono fermo e collaborativo. Come imposto il
                prompt nel Modulo 05?
              </p>
            </div>

            <div className="p-4 rounded-md border border-[#6366f1]/40 bg-[#6366f1]/10 space-y-2.5">
              <div
                className="text-[10px] uppercase tracking-wider text-[#6366f1] font-semibold"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                @AI · METODO RCCF (RUOLO · CONTESTO · COMPITO · FORMATO)
              </div>
              <ul className="space-y-1.5 text-xs text-[#f8fafc]/90">
                <li>
                  <strong>Ruolo:</strong> Responsabile amministrazione senior
                  B2B.
                </li>
                <li>
                  <strong>Contesto:</strong> Fattura emessa conforme al
                  preventivo firmato.
                </li>
                <li>
                  <strong>Compito:</strong> Chiarisci i punti e proponi call di
                  allineamento.
                </li>
                <li>
                  <strong>Formato:</strong> Email max 140 parole, tono
                  professionale e cortese.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <span className="text-xs text-[#94a3b8]">
            Integrato in tutte le 20 video lezioni.
          </span>
          <button
            type="button"
            onClick={onOpenEnroll}
            className="bg-[#f8fafc] text-[#090d16] hover:bg-white rounded-md px-4 h-9 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Sblocca il Tutor</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Micro-simulatore interattivo */}
      <div className="lg:col-span-6 p-6 sm:p-8 bg-[#ffffff] text-[#090d16] flex flex-col justify-between gap-6 border-t lg:border-t-0 lg:border-l border-[#090d16]/12">
        <div className="space-y-4">
          <div
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#475569] flex items-center gap-2"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#6366f1]" />
            <span>SIMULATORE INTERATTIVO</span>
          </div>

          <h3
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#090d16]"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            Metti alla prova l&apos;Assistente @AI
          </h3>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Scrivi un compito reale del tuo lavoro quotidiano e osserva come il
            Tutor @AI struttura il metodo operativo.
          </p>

          <form onSubmit={handleDemoSubmit} className="space-y-3 pt-2">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-[#090d16]"
            >
              Richiesta operativa per il Tutor @AI
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                id={inputId}
                name="demoPrompt"
                value={demoPromptInput}
                onChange={(e) => setDemoPromptInput(e.target.value)}
                placeholder="Es. Riassumi un verbale di riunione in 5 azioni"
                className="rounded-md h-11 bg-[#f8fafc] border-[#090d16]/20 text-[#090d16] text-sm flex-1"
              />
              <Button
                type="submit"
                disabled={!demoPromptInput.trim() || isDemoThinking}
                className="bg-[#090d16] hover:bg-[#1e293b] text-white rounded-md h-11 px-4 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isDemoThinking ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Elaboro...</span>
                  </>
                ) : (
                  <>
                    <span>Prova @AI</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {demoResponse ? (
          <div className="p-4 rounded-md border border-[#090d16]/15 bg-[#f8fafc] text-xs text-[#090d16] whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
            {demoResponse}
          </div>
        ) : (
          <div className="p-4 rounded-md border border-dashed border-[#090d16]/20 bg-[#f8fafc] text-xs text-[#475569]">
            Suggerimento: prova &ldquo;Prepara una checklist per
            l&apos;onboarding di un nuovo cliente&rdquo;.
          </div>
        )}
      </div>
    </div>
  )

  const renderCertificateLayer = () => (
    <div className="border border-[#090d16]/15 rounded-md bg-[#f8fafc] p-6 sm:p-10">
      <div className="max-w-3xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#090d16]/12">
          <div className="space-y-1.5">
            <div
              className="text-[11px] uppercase tracking-[0.16em] text-[#6366f1] font-semibold"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              ATTESTATO DI FORMAZIONE UFFICIALE
            </div>
            <h3
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090d16]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              AI Start — Competenze Digitali &amp; IA
            </h3>
          </div>

          <span
            className="self-start sm:self-auto px-2.5 py-1 rounded-md border border-[#090d16]/20 text-[11px] font-semibold uppercase tracking-wider text-[#090d16] bg-white"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            VALORE EUROPEO
          </span>
        </div>

        <div className="border-b border-[#090d16]/12">
          <div className="py-4 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm">
            <span className="text-[#475569]">Ente Certificatore</span>
            <span className="font-semibold text-[#090d16]">
              ATOMA Formazione
            </span>
          </div>
          <div className="py-4 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm">
            <span className="text-[#475569]">Validità</span>
            <span className="font-semibold text-[#090d16]">
              Livello Europeo
            </span>
          </div>
          <div className="py-4 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm">
            <span className="text-[#475569]">Docenza</span>
            <span className="font-semibold text-[#090d16]">
              Docente Autorizzato
            </span>
          </div>
          <div className="py-4 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm">
            <span className="text-[#475569]">Monte Ore</span>
            <span className="font-semibold text-[#090d16]">
              16 Ore · 20 Moduli Operativi
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-[#475569] max-w-md">
            Rilasciato al completamento del percorso AI Start con verifica
            pratica delle competenze apprese.
          </p>
          <button
            type="button"
            onClick={onOpenEnroll}
            className="bg-[#090d16] text-white hover:bg-[#1e293b] rounded-md px-5 h-11 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Iscriviti al Percorso</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      className="bg-[#ffffff] text-[#090d16] border-b border-[#090d16]/10"
    >
      {/* Desktop: Showcase Pinned allo Scroll */}
      <div
        ref={pinRef}
        className="hidden lg:block motion-reduce:hidden max-w-6xl mx-auto px-6 py-12 xl:py-14"
      >
        <div className="flex items-end justify-between gap-8 pb-6">
          <div className="max-w-2xl space-y-2">
            <div
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              ESPERIENZA STUDENTE
            </div>
            <h2
              className="text-3xl xl:text-[2.5rem] font-extrabold tracking-[-0.03em] leading-[1.08] text-[#090d16]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              Testa dal vivo piattaforma e Tutor @AI
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Anteprima piattaforma desktop"
            className="inline-flex gap-1 p-1 rounded-md border border-[#090d16]/15 bg-[#f8fafc] shrink-0"
          >
            {DESKTOP_TABS.map((tab, idx) => {
              const Icon = tab.icon
              const isSelected = activeStep === idx
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleDesktopTabClick(idx)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#090d16] text-white'
                      : 'text-[#475569] hover:text-[#090d16]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Barra di avanzamento Indigo scrub */}
        <div className="h-[2px] w-full bg-[#090d16]/10 overflow-hidden mb-8">
          <div
            ref={progressBarRef}
            className="h-full w-full bg-[#6366f1] origin-left scale-x-0 will-change-transform"
          />
        </div>

        {/* 3 Layer sovrapposti sequenziali */}
        <div className="relative min-h-[540px]">
          <div
            ref={(el) => {
              layerRefs.current[0] = el
            }}
            aria-hidden={activeStep !== 0}
            className={`absolute inset-0 ${
              activeStep === 0
                ? 'pointer-events-auto z-10'
                : 'pointer-events-none z-0'
            }`}
          >
            {renderPlayerLayer()}
          </div>

          <div
            ref={(el) => {
              layerRefs.current[1] = el
            }}
            aria-hidden={activeStep !== 1}
            className={`absolute inset-0 ${
              activeStep === 1
                ? 'pointer-events-auto z-10'
                : 'pointer-events-none z-0'
            }`}
          >
            {renderChatLayer('academy-demo-prompt')}
          </div>

          <div
            ref={(el) => {
              layerRefs.current[2] = el
            }}
            aria-hidden={activeStep !== 2}
            className={`absolute inset-0 ${
              activeStep === 2
                ? 'pointer-events-auto z-10'
                : 'pointer-events-none z-0'
            }`}
          >
            {renderCertificateLayer()}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet / Reduced Motion: Tab classici senza pin */}
      <div className="lg:hidden motion-reduce:block max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-6 pb-8 border-b border-[#090d16]/12">
          <div className="max-w-2xl space-y-2.5">
            <div
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              ESPERIENZA STUDENTE
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[#090d16]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              Testa dal vivo piattaforma e Tutor @AI
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Anteprima piattaforma mobile"
            className="inline-flex flex-wrap gap-1 p-1 rounded-md border border-[#090d16]/15 bg-[#f8fafc] self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'player'}
              onClick={() => setMobileTab('player')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                mobileTab === 'player'
                  ? 'bg-[#090d16] text-white'
                  : 'text-[#475569] hover:text-[#090d16]'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>01 Video HD</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'chat'}
              onClick={() => setMobileTab('chat')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                mobileTab === 'chat'
                  ? 'bg-[#090d16] text-white'
                  : 'text-[#475569] hover:text-[#090d16]'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>02 Tutor @AI 24/7</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'certificate'}
              onClick={() => setMobileTab('certificate')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                mobileTab === 'certificate'
                  ? 'bg-[#090d16] text-white'
                  : 'text-[#475569] hover:text-[#090d16]'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>03 Attestato</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          {mobileTab === 'player' && renderPlayerLayer()}
          {mobileTab === 'chat' &&
            renderChatLayer('academy-demo-prompt-mobile')}
          {mobileTab === 'certificate' && renderCertificateLayer()}
        </div>
      </div>
    </section>
  )
}
