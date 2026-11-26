'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const ACADEMY_ROWS: ReadonlyArray<{
  num: string
  title: string
  detail: string
  comingSoon?: boolean
}> = [
  { num: '01', title: 'AI Start', detail: '20 lezioni pratiche da zero' },
  { num: '02', title: 'AI Pro', detail: 'Percorso agentico' },
  {
    num: '03',
    title: 'Cyber-Security',
    detail: 'Prossimamente',
    comingSoon: true,
  },
  { num: '04', title: 'Team Aziendali', detail: 'Formazione su misura' },
  { num: '05', title: 'Tutor @AI 24/7', detail: 'Assistente continuo' },
]

const IMPRESA_ROWS = [
  { num: '01', title: 'Orchestratore Agenti', detail: 'Vocali, CRM e preventivi' },
  { num: '02', title: 'Test Diagnostica', detail: 'Check-up reti e sicurezza' },
  { num: '03', title: 'Cyber-Shield', detail: 'Difesa attiva PMI' },
  { num: '04', title: 'NetworkDiag Ops Pro', detail: 'Monitoraggio server e DNS h24' },
  { num: '05', title: 'Integrazioni', detail: 'Gestionali e WhatsApp' },
] as const

const TICKER_TEXT =
  'AIUTIAMOCI ACADEMY · 20 LEZIONI AI START · AI PRO AGENTICO · CYBER-SECURITY · AIUTIAMOCI IMPRESA · TEST DIAGNOSTICA · CYBER-SHIELD · AGENTI AUTONOMI · TUTOR @AI 24/7 · CONFORME GDPR · ZERO VINCOLI ·'

export function SplitGateway() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const leftRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leftInnerRef = useRef<HTMLDivElement | null>(null)
  const rightInnerRef = useRef<HTMLDivElement | null>(null)
  const tickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        '.js-split-line',
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.8 }
      ).fromTo(
        '.js-split-row',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.6 },
        '-=0.45'
      )

      if (tickerRef.current) {
        gsap.to(tickerRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 28,
          ease: 'none',
        })
      }
    }, sectionRef)

    const mm = gsap.matchMedia()
    mm.add('(max-width: 1023px)', () => {
      if (leftRef.current && rightRef.current) {
        gsap.set([leftRef.current, rightRef.current], { clearProps: 'flexGrow' })
      }
      if (leftInnerRef.current && rightInnerRef.current) {
        gsap.set([leftInnerRef.current, rightInnerRef.current], {
          clearProps: 'opacity',
        })
      }
    })

    const leftEl = leftRef.current
    const rightEl = rightRef.current
    const leftInnerEl = leftInnerRef.current
    const rightInnerEl = rightInnerRef.current

    return () => {
      ctx.revert()
      mm.revert()
      gsap.killTweensOf([leftEl, rightEl, leftInnerEl, rightInnerEl])
    }
  }, [])

  const canAnimateSplit = () => {
    if (typeof window === 'undefined') return false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktopHover = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
    ).matches
    return desktopHover && !reduced
  }

  const handleHoverLeft = () => {
    if (!canAnimateSplit()) return
    gsap.to(leftRef.current, {
      flexGrow: 1.55,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(rightRef.current, {
      flexGrow: 0.75,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(leftInnerRef.current, {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(rightInnerRef.current, {
      opacity: 0.78,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleHoverRight = () => {
    if (!canAnimateSplit()) return
    gsap.to(rightRef.current, {
      flexGrow: 1.55,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(leftRef.current, {
      flexGrow: 0.75,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(rightInnerRef.current, {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(leftInnerRef.current, {
      opacity: 0.78,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleReset = () => {
    if (!canAnimateSplit()) return
    gsap.to([leftRef.current, rightRef.current], {
      flexGrow: 1,
      duration: 0.72,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to([leftInnerRef.current, rightInnerRef.current], {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <section ref={sectionRef} className="w-full">
      {/* Split-Screen 50/50 Vivo */}
      <div
        onMouseLeave={handleReset}
        className="min-h-[calc(100dvh-56px)] flex flex-col lg:flex-row w-full"
      >
        {/* Pannello Sinistro — AIutiamoci Academy */}
        <div
          ref={leftRef}
          onMouseEnter={handleHoverLeft}
          className="lg:basis-0 lg:grow bg-[#f8fafc] text-[#090d16] px-6 py-8 sm:px-12 sm:py-12 lg:px-14 lg:py-11 xl:px-20 flex flex-col justify-between min-w-0"
        >
          <div
            ref={leftInnerRef}
            className="flex flex-col justify-between h-full max-w-xl w-full"
          >
            <div>
              <div
                className="js-split-row text-[11px] font-medium uppercase tracking-[0.14em] text-[#475569]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                01 — FORMAZIONE &amp; CERTIFICAZIONE
              </div>

              <div className="flex items-center gap-4 sm:gap-5 mt-5">
                <img
                  src="/images/brand/icon-light.svg"
                  alt="AIutiamoci"
                  className="h-14 w-14 sm:h-16 sm:w-16 xl:h-[76px] xl:w-[76px] shrink-0 object-contain js-split-row"
                />
                <h1
                  className="text-4xl sm:text-5xl xl:text-[4rem] font-extrabold tracking-[-0.035em] leading-[1.02] text-[#090d16]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  <span className="block overflow-hidden">
                    <span className="js-split-line block">
                      <span className="bg-gradient-to-r from-[#4f46e5] to-[#0284c7] bg-clip-text text-transparent">
                        AI
                      </span>
                      utiamoci
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="js-split-line block">Academy.</span>
                  </span>
                </h1>
              </div>

              <p className="js-split-row mt-5 max-w-md text-sm sm:text-base text-[#475569] leading-relaxed">
                Impara a usare l&apos;AI nel lavoro quotidiano: 20 lezioni pratiche,
                percorsi aziendali e Tutor @AI 24/7.
              </p>
            </div>

            <div className="mt-7 lg:mt-8 space-y-6">
              <div className="border-b border-[#090d16]/12">
                {ACADEMY_ROWS.map((row) => (
                  <div
                    key={row.num}
                    className="js-split-row flex items-center justify-between gap-3 py-2.5 sm:py-3 border-t border-[#090d16]/12 text-xs sm:text-sm"
                  >
                    <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
                      <span
                        className="text-[11px] font-medium text-[#475569] shrink-0"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {row.num}
                      </span>
                      <span className="font-semibold text-[#090d16]">
                        {row.title}
                      </span>
                    </div>
                    {row.comingSoon ? (
                      <span
                        className="border border-[#090d16]/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-[#475569] shrink-0"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        PROSSIMAMENTE
                      </span>
                    ) : (
                      <span className="text-[#475569] text-right leading-snug">
                        {row.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="js-split-row">
                <Link
                  href="/academy"
                  className="bg-[#090d16] text-white hover:bg-[#1e293b] rounded-md px-5 h-11 inline-flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Entra in Academy</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Pannello Destro — AIutiamoci Impresa */}
        <div
          ref={rightRef}
          onMouseEnter={handleHoverRight}
          className="lg:basis-0 lg:grow bg-[#090d16] text-[#f8fafc] border-t lg:border-t-0 lg:border-l border-white/12 px-6 py-8 sm:px-12 sm:py-12 lg:px-14 lg:py-11 xl:px-20 flex flex-col justify-between min-w-0"
        >
          <div
            ref={rightInnerRef}
            className="flex flex-col justify-between h-full max-w-xl w-full"
          >
            <div>
              <div
                className="js-split-row text-[11px] font-medium uppercase tracking-[0.14em] text-[#94a3b8]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                02 — AGENTI &amp; AUTOMAZIONE
              </div>

              <div className="flex items-center gap-4 sm:gap-5 mt-5">
                <img
                  src="/images/brand/icon-dark.svg"
                  alt="AIutiamoci"
                  className="h-14 w-14 sm:h-16 sm:w-16 xl:h-[76px] xl:w-[76px] shrink-0 object-contain js-split-row"
                />
                <h2
                  className="text-4xl sm:text-5xl xl:text-[4rem] font-extrabold tracking-[-0.035em] leading-[1.02] text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  <span className="block overflow-hidden">
                    <span className="js-split-line block">
                      <span className="bg-gradient-to-r from-[#6366f1] to-[#38bdf8] bg-clip-text text-transparent">
                        AI
                      </span>
                      utiamoci
                    </span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="js-split-line block">Impresa.</span>
                  </span>
                </h2>
              </div>

              <p className="js-split-row mt-5 max-w-md text-sm sm:text-base text-[#94a3b8] leading-relaxed">
                Agenti autonomi, monitoraggio infrastrutturale e integrazioni su
                misura per far lavorare la tecnologia.
              </p>
            </div>

            <div className="mt-7 lg:mt-8 space-y-6">
              <div className="border-b border-white/12">
                {IMPRESA_ROWS.map((row) => (
                  <div
                    key={row.num}
                    className="js-split-row flex items-center justify-between gap-3 py-2.5 sm:py-3 border-t border-white/12 text-xs sm:text-sm"
                  >
                    <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
                      <span
                        className="text-[11px] font-medium text-[#94a3b8] shrink-0"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {row.num}
                      </span>
                      <span className="font-semibold text-[#f8fafc]">
                        {row.title}
                      </span>
                    </div>
                    <span className="text-[#94a3b8] text-right leading-snug">
                      {row.detail}
                    </span>
                  </div>
                ))}
              </div>

              <div className="js-split-row">
                <a
                  href="https://impresa.aiutiamoci.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#f8fafc] text-[#090d16] hover:bg-white rounded-md px-5 h-11 inline-flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Vai a Impresa</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fascia Ticker Editoriale */}
      <div className="h-11 border-y border-white/10 bg-[#090d16] text-[#94a3b8] overflow-hidden flex items-center">
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
    </section>
  )
}
