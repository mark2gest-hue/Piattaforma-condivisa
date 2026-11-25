'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowRight, ChevronDown, CreditCard, Lock } from 'lucide-react'
import { decodeReferralCode } from '@/lib/referral-mask'
import { ExpandableTracks } from '@/components/academy/ExpandableTracks'
import { AcademyShowcase } from '@/components/academy/AcademyShowcase'
import { AcademyModals } from '@/components/academy/AcademyModals'

const TICKER_TEXT =
  'AI START · 20 LEZIONI HD · AI PRO AGENTICO · CYBER-SECURITY · TUTOR @AI 24/7 · CERTIFICAZIONE EUROPEA ATOMA ·'

const FACULTY_PILLARS = [
  {
    num: '01',
    title: 'Dirette settimanali e Masterclass Live',
    detail: 'Sessioni periodiche di Q&A su casi concreti',
  },
  {
    num: '02',
    title: 'Supporto Continuo in Piattaforma & Tutor @AI',
    detail: 'Canale studenti integrato e Tutor @AI sempre attivo',
  },
  {
    num: '03',
    title: 'Docenti Autorizzati ATOMA',
    detail: 'Formazione certificata a livello europeo',
  },
] as const

const FAQS = [
  {
    question: 'I corsi rilasciano una certificazione ufficiale?',
    answer:
      "Certamente. I nostri percorsi formativi rilasciano la Certificazione delle Competenze a livello europeo, emessa in collaborazione con l'Ente Certificatore ATOMA tramite docente qualificato e autorizzato.",
  },
  {
    question: 'Serve saper programmare o avere competenze tecniche?',
    answer:
      'No. AI Start è progettato per chi parte da zero: spieghiamo tutto con approccio operativo, senza tecnicismi superflui.',
  },
  {
    question: 'Come funziona l’accesso alle lezioni video?',
    answer:
      "All'iscrizione ricevi un Codice Univoco personale (es. AI-START-8F92). Inserendolo nell'Area Studenti sblocchi subito tutti i 20 video e il player HD.",
  },
  {
    question: "Cos'è l'Assistente @AI in piattaforma?",
    answer:
      'È il tutor virtuale integrato nel percorso: durante la visione delle lezioni puoi digitare @AI per fare domande e ricevere risposte immediate.',
  },
  {
    question: 'Quando uscirà il Corso Avanzato AI Pro?',
    answer:
      "Il percorso AI Pro (Agentico) è in preparazione. Puoi iscriverti alla lista d'attesa in un clic per ricevere invito prioritario e coupon dedicato.",
  },
] as const

export default function AcademyPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const tickerRef = useRef<HTMLDivElement | null>(null)

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isDirectPaymentModalOpen, setIsDirectPaymentModalOpen] =
    useState(false)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [legalModalType, setLegalModalType] = useState<
    'privacy' | 'cookies' | 'terms' | 'disclaimer' | null
  >(null)

  const [referrerName, setReferrerName] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  // Referral ?ref= / sessionStorage preservation
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const refUrl = urlParams.get('ref') || urlParams.get('referral')
      const savedRef = sessionStorage.getItem('course_referral_code')
      const activeRef = refUrl || savedRef
      if (activeRef && activeRef.trim()) {
        setReferrerName(decodeReferralCode(activeRef.trim()))
        sessionStorage.setItem('course_referral_code', activeRef.trim())
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  // Lenis + GSAP ScrollTrigger choreography
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.15,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    const handleLenisScroll = () => {
      ScrollTrigger.update()
    }
    lenis.on('scroll', handleLenisScroll)

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(updateLenis)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      heroTl
        .fromTo(
          '.js-hero-line',
          { yPercent: 105, opacity: 0 },
          { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.78 }
        )
        .fromTo(
          '.js-hero-reveal',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.58 },
          '-=0.45'
        )

      gsap.fromTo(
        '.js-count-20',
        { textContent: 0 },
        {
          textContent: 20,
          duration: 1.1,
          ease: 'power2.out',
          roundProps: 'textContent',
        }
      )

      gsap.fromTo(
        '.js-count-16',
        { textContent: 0 },
        {
          textContent: 16,
          duration: 1.0,
          ease: 'power2.out',
          roundProps: 'textContent',
        }
      )

      gsap.fromTo(
        '.js-hero-preview',
        { y: -14 },
        {
          y: 14,
          ease: 'none',
          scrollTrigger: {
            trigger: '.js-hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )

      if (tickerRef.current) {
        gsap.to(tickerRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 26,
          ease: 'none',
        })
      }

      gsap.fromTo(
        '.js-scroll-progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )

      gsap.fromTo(
        '.js-faculty-photo',
        { scale: 1.08, yPercent: -4 },
        {
          scale: 1.0,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.js-faculty-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )

      gsap.fromTo(
        '.js-faculty-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.js-faculty-section',
            start: 'top 80%',
            once: true,
          },
        }
      )

      gsap.fromTo(
        '.js-faq-item',
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.js-faq-section',
            start: 'top 82%',
            once: true,
          },
        }
      )
    }, rootRef)

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(rafId)
      ctx.revert()
      gsap.ticker.remove(updateLenis)
      lenis.off('scroll', handleLenisScroll)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Stop/start Lenis when any modal is open
  useEffect(() => {
    const hasModalOpen =
      isStudentModalOpen ||
      isDirectPaymentModalOpen ||
      isEnrollModalOpen ||
      isWaitlistModalOpen ||
      legalModalType !== null

    if (hasModalOpen) {
      lenisRef.current?.stop()
    } else {
      lenisRef.current?.start()
    }
  }, [
    isStudentModalOpen,
    isDirectPaymentModalOpen,
    isEnrollModalOpen,
    isWaitlistModalOpen,
    legalModalType,
  ])

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen flex flex-col bg-[#090d16] text-[#f8fafc] selection:bg-[#6366f1] selection:text-white overflow-x-clip"
      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
    >
      {/* Barra di progresso 2px pinned top */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
      >
        <div className="js-scroll-progress h-full w-full bg-[#6366f1] origin-left scale-x-0 will-change-transform" />
      </div>

      {/* Top Bar h-14 (56px) */}
      <header className="sticky top-0 z-40 h-14 bg-[#090d16] border-b border-white/10">
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/brand/icon-dark.svg"
                alt="AIutiamoci"
                className="h-6 w-6 object-contain"
              />
              <span
                className="font-bold text-sm sm:text-base tracking-tight text-[#f8fafc]"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                <span className="bg-gradient-to-r from-[#6366f1] to-[#38bdf8] bg-clip-text text-transparent">
                  AI
                </span>
                utiamoci
              </span>
            </Link>

            <span className="hidden sm:inline text-white/25 text-xs select-none">
              /
            </span>

            <span className="hidden sm:inline text-xs font-medium text-[#94a3b8] truncate">
              Academy
            </span>
          </div>

          <div
            className="hidden md:block text-[11px] uppercase tracking-widest text-[#94a3b8] select-none"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            UMANI NEL PENSIERO. SMART NELL&apos;AZIONE.
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(true)}
              className="rounded-md border border-white/20 hover:bg-white/10 text-[#f8fafc] h-9 px-3.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Ho un codice
            </button>

            <Link
              href="/login"
              className="rounded-md border border-white/15 hover:bg-white/10 text-[#94a3b8] hover:text-[#f8fafc] h-9 px-3 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Accesso riservato al team di gestione"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Accedi</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Sezione 1 — Hero Editoriale Dinamico */}
        <section className="js-hero-section bg-[#f8fafc] text-[#090d16]">
          <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Sinistra (7 col) */}
              <div className="lg:col-span-7 space-y-6">
                <div
                  className="js-hero-reveal text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  AIUTIAMOCI ACADEMY · CERTIFICAZIONE EUROPEA ATOMA
                </div>

                <div className="flex items-start gap-4 sm:gap-5">
                  <img
                    src="/images/brand/icon-light.svg"
                    alt="AIutiamoci Academy"
                    className="js-hero-reveal h-12 w-12 sm:h-16 sm:w-16 shrink-0 object-contain mt-1"
                  />
                  <h1
                    className="text-3xl sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-[-0.035em] leading-[1.04] text-[#090d16]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    <span className="block overflow-hidden">
                      <span className="js-hero-line block">
                        Domina l&apos;Intelligenza
                      </span>
                    </span>
                    <span className="block overflow-hidden">
                      <span className="js-hero-line block">
                        Artificiale, da Zero
                      </span>
                    </span>
                    <span className="block overflow-hidden">
                      <span className="js-hero-line block">
                        all&apos;Agentistica.
                      </span>
                    </span>
                  </h1>
                </div>

                <p className="js-hero-reveal max-w-xl text-sm sm:text-base text-[#475569] leading-relaxed">
                  Formazione pratica sul lavoro quotidiano con 20 lezioni video
                  HD, Tutor @AI sempre disponibile e percorso riconosciuto
                  dall&apos;Ente Certificatore ATOMA.
                </p>

                <div className="js-hero-reveal flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="bg-[#090d16] text-white hover:bg-[#1e293b] rounded-md px-5 h-11 inline-flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
                  >
                    <span>Registrati alla Masterclass</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDirectPaymentModalOpen(true)}
                    className="border border-[#090d16]/20 hover:bg-[#090d16]/5 text-[#090d16] rounded-md px-5 h-11 inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    <span>Iscrizione Diretta (€)</span>
                  </button>
                </div>
              </div>

              {/* Destra (5 col): Preview nitida con parallasse + Griglia 2x2 metriche */}
              <div className="lg:col-span-5 space-y-5">
                <div className="js-hero-reveal bg-[#090d16] rounded-md overflow-hidden border border-[#090d16]/15">
                  <img
                    src="/images/academy-lesson-preview.jpg"
                    alt="Anteprima Lezione AIutiamoci: Dal Caos all'Ordine Strutturato"
                    className="js-hero-preview w-full h-auto object-contain will-change-transform"
                  />
                </div>

                <div className="js-hero-reveal grid grid-cols-2 border-t border-l border-[#090d16]/12 bg-white">
                  <div className="p-3.5 sm:p-4 border-r border-b border-[#090d16]/12">
                    <div
                      className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#090d16] tabular-nums"
                      style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                      <span className="js-count-20">20</span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#475569] mt-0.5">
                      Video HD
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 border-r border-b border-[#090d16]/12">
                    <div
                      className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#090d16] tabular-nums"
                      style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                      <span className="js-count-16">16</span>h
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#475569] mt-0.5">
                      Percorso Pratico
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 border-r border-b border-[#090d16]/12">
                    <div
                      className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#090d16]"
                      style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                      24/7
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#475569] mt-0.5">
                      Tutor @AI
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 border-r border-b border-[#090d16]/12">
                    <div
                      className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#090d16]"
                      style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                      ATOMA
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#475569] mt-0.5">
                      Certificazione
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Editoriale Continuo GSAP */}
        <div className="h-10 bg-[#090d16] text-[#94a3b8] border-y border-white/10 overflow-hidden flex items-center">
          <div
            ref={tickerRef}
            className="flex w-max items-center whitespace-nowrap will-change-transform"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <span className="text-[11px] uppercase tracking-[0.16em] pr-6 shrink-0">
              {TICKER_TEXT}
            </span>
            <span
              aria-hidden="true"
              className="text-[11px] uppercase tracking-[0.16em] pr-6 shrink-0"
            >
              {TICKER_TEXT}
            </span>
          </div>
        </div>

        {/* Sezione 2 — I 3 Percorsi Formativi Espandibili */}
        <ExpandableTracks
          onOpenEnroll={() => setIsEnrollModalOpen(true)}
          onOpenWaitlist={() => setIsWaitlistModalOpen(true)}
          onOpenDirectPayment={() => setIsDirectPaymentModalOpen(true)}
        />

        {/* Sezione 3 — Dentro la Piattaforma (Pinned su Desktop) */}
        <AcademyShowcase onOpenEnroll={() => setIsEnrollModalOpen(true)} />

        {/* Sezione 4 — Docenti & Fondatori */}
        <section className="js-faculty-section bg-[#090d16] text-[#f8fafc] border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-5 js-faculty-reveal">
                <div className="rounded-md border border-white/15 overflow-hidden bg-[#0f172a]">
                  <img
                    src="/images/team_docenti.jpg"
                    alt="Marco, Stefano e Lorenzo — Docenti AIutiamoci Academy"
                    className="js-faculty-photo w-full h-auto object-cover will-change-transform"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="js-faculty-reveal space-y-3">
                  <div
                    className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    DOCENTI &amp; FONDATORI
                  </div>
                  <h2
                    className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Marco, Stefano e Lorenzo
                  </h2>
                  <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed max-w-xl">
                    Persone reali, esperienza pratica e zero teoria astratta.
                    Ogni lezione nasce da problemi risolti sul campo per imprese
                    e professionisti.
                  </p>
                </div>

                <div className="border-b border-white/12">
                  {FACULTY_PILLARS.map((item) => (
                    <div
                      key={item.num}
                      className="js-faculty-reveal py-4 border-t border-white/12 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6"
                    >
                      <div className="flex items-baseline gap-3.5">
                        <span
                          className="text-[11px] font-medium text-[#6366f1] shrink-0"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {item.num}
                        </span>
                        <span className="text-sm font-semibold text-[#f8fafc]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs text-[#94a3b8] sm:text-right">
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sezione 5 — FAQ */}
        <section className="js-faq-section bg-[#f8fafc] text-[#090d16] border-b border-[#090d16]/10">
          <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
              <div className="lg:col-span-4 space-y-3">
                <div
                  className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  DOMANDE FREQUENTI
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[#090d16]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Chiarimenti essenziali
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Tutto quello che serve sapere prima di iniziare il percorso AI
                  Start.
                </p>
              </div>

              <div className="lg:col-span-8 border-b border-[#090d16]/12">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx
                  return (
                    <div
                      key={faq.question}
                      className="js-faq-item border-t border-[#090d16]/12"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                      >
                        <span
                          className="text-sm sm:text-base font-bold text-[#090d16]"
                          style={{
                            fontFamily: 'var(--font-jakarta), sans-serif',
                          }}
                        >
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-5 pr-8 text-xs sm:text-sm text-[#475569] leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimale */}
      <footer className="border-t border-white/10 bg-[#090d16] py-6 px-6 text-xs text-[#94a3b8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#f8fafc]">
              aiutiamoci.cloud
            </span>
            <span>• Umani nel pensiero. Smart nell&apos;azione.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#f8fafc] transition-colors">
              ← Torna alla Home
            </Link>
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(true)}
              className="hover:text-[#f8fafc] transition-colors cursor-pointer"
            >
              Area Studenti
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-[#f8fafc] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType('cookies')}
              className="hover:text-[#f8fafc] transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType('terms')}
              className="hover:text-[#f8fafc] transition-colors cursor-pointer"
            >
              Termini di Servizio
            </button>
          </div>
        </div>
      </footer>

      <AcademyModals
        isStudentModalOpen={isStudentModalOpen}
        onCloseStudentModal={() => setIsStudentModalOpen(false)}
        isDirectPaymentModalOpen={isDirectPaymentModalOpen}
        onCloseDirectPaymentModal={() => setIsDirectPaymentModalOpen(false)}
        isEnrollModalOpen={isEnrollModalOpen}
        onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
        onCloseEnrollModal={() => setIsEnrollModalOpen(false)}
        isWaitlistModalOpen={isWaitlistModalOpen}
        onCloseWaitlistModal={() => setIsWaitlistModalOpen(false)}
        legalModalType={legalModalType}
        onChangeLegalModalType={setLegalModalType}
        referrerName={referrerName}
      />
    </div>
  )
}
