'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

interface ExpandableTracksProps {
  onOpenEnroll: () => void
  onOpenWaitlist: () => void
  onOpenDirectPayment: () => void
}

const TRACKS = [
  {
    num: '01',
    shortTitle: 'AI Start',
    kicker: '01 / AI Start',
    badge: 'ATTIVO',
    badgeClass: 'bg-[#6366f1] text-white border border-[#6366f1]',
    title: 'Fondamenta Operative',
    description:
      "Il percorso completo per padroneggiare l'AI nel lavoro quotidiano partendo da zero.",
    points: [
      '20 videolezioni HD pratiche',
      'Tutor @AI 24/7 integrato',
      'Codice Univoco personale',
      'Certificazione Europea ATOMA',
    ],
    ctaLabel: 'Partecipa alla Masterclass',
    action: 'enroll' as const,
  },
  {
    num: '02',
    shortTitle: 'AI Pro',
    kicker: '02 / AI Pro',
    badge: "LISTA D'ATTESA",
    badgeClass: 'border border-white/25 text-[#f8fafc]',
    title: 'Percorso Agentico',
    description:
      'Progettazione e messa in produzione di agenti, conoscenze aziendali e flussi automatici.',
    points: [
      'Sistemi Multi-Agente',
      'RAG Aziendale su documenti reali',
      'Agenti Vocali per PMI',
      'Automazioni n8n & integrazioni API',
    ],
    ctaLabel: "Lista d'Attesa AI Pro",
    action: 'waitlist' as const,
  },
  {
    num: '03',
    shortTitle: 'Cyber-Security',
    kicker: '03 / Cyber-Security',
    badge: 'PROSSIMAMENTE',
    badgeClass: 'border border-white/20 text-[#94a3b8]',
    title: 'Difesa Operativa AI',
    description:
      'Protezione di prompt, dati aziendali, anti-phishing e workflow sicuri pensati per professionisti e PMI.',
    points: [
      'Difesa operativa AI',
      'Protezione prompt & dati aziendali',
      'Anti-phishing e verifica comunicazioni',
      'Workflow sicuri per PMI',
    ],
    ctaLabel: null,
    action: 'none' as const,
  },
] as const

export function ExpandableTracks({
  onOpenEnroll,
  onOpenWaitlist,
  onOpenDirectPayment,
}: ExpandableTracksProps) {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lockedUntilRef = useRef<number>(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  const selectTrackImmediate = (idx: number) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    if (idx !== activeIndex) {
      lockedUntilRef.current = Date.now() + 420
      setActiveIndex(idx)
    }
  }

  const handlePanelMouseEnter = (idx: number) => {
    if (idx === activeIndex) return
    if (
      typeof window === 'undefined' ||
      !window.matchMedia(
        '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
      ).matches
    ) {
      return
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    if (Date.now() < lockedUntilRef.current) return
    hoverTimerRef.current = setTimeout(() => {
      selectTrackImmediate(idx)
    }, 180)
  }

  const handlePanelMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  const handleAction = (action: 'enroll' | 'waitlist' | 'none') => {
    if (action === 'enroll') onOpenEnroll()
    if (action === 'waitlist') onOpenWaitlist()
  }

  return (
    <section className="bg-[#090d16] text-[#f8fafc] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <div
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              ARCHITETTURA FORMATIVA
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[#f8fafc]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              I 3 Percorsi di{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#38bdf8] bg-clip-text text-transparent">
                AI
              </span>
              utiamoci Academy
            </h2>
          </div>

          <p
            className="hidden lg:block text-[11px] uppercase tracking-widest text-[#94a3b8]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            CLICCA O SOSTA SU UN PERCORSO PER ESPLORARE
          </p>
        </div>

        {/* 3 Pannelli Orizzontali Espandibili (Desktop) / Impilati (Mobile) */}
        <div className="border border-white/12 divide-y lg:divide-y-0 lg:divide-x divide-white/12 flex flex-col lg:flex-row lg:min-h-[460px]">
          {TRACKS.map((track, idx) => {
            const isActive = activeIndex === idx
            return (
              <div
                key={track.num}
                style={{ '--panel-grow': isActive ? 2.3 : 0.85 } as React.CSSProperties}
                onMouseEnter={() => handlePanelMouseEnter(idx)}
                onMouseLeave={handlePanelMouseLeave}
                onClick={() => selectTrackImmediate(idx)}
                className={`lg:basis-0 lg:[flex-grow:var(--panel-grow)] lg:transition-[flex-grow,background-color,border-color] lg:duration-[420ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none min-w-0 overflow-hidden transition-colors duration-300 ${
                  isActive
                    ? 'bg-[#0f172a]/55 lg:cursor-default'
                    : 'bg-[#090d16] hover:bg-[#0f172a]/30 lg:cursor-pointer'
                }`}
              >
                {/* Vista Mobile & Tablet (< 1024px): sempre leggibile al 100% */}
                <div className="lg:hidden p-6 sm:p-8 flex flex-col justify-between gap-7">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-xs font-semibold text-[#94a3b8]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {track.kicker}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${track.badgeClass}`}
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {track.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3
                        className="text-2xl font-extrabold tracking-tight text-[#f8fafc]"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                      >
                        {track.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    <div className="border-b border-white/12 text-xs sm:text-sm text-[#f8fafc]/90">
                      {track.points.map((point) => (
                        <div
                          key={point}
                          className="py-3 border-t border-white/12"
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  {track.ctaLabel ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAction(track.action)
                      }}
                      className={`w-full rounded-md h-11 px-4 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        track.action === 'enroll'
                          ? 'bg-[#f8fafc] text-[#090d16] hover:bg-white'
                          : 'border border-white/25 hover:bg-white/10 text-[#f8fafc]'
                      }`}
                    >
                      <span>{track.ctaLabel}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  ) : (
                    <div className="pt-3 space-y-1.5 border-t border-white/12">
                      <div
                        className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        PROSSIMAMENTE
                      </div>
                      <p className="text-xs text-[#94a3b8]">
                        Incluso nella roadmap formativa AIutiamoci
                      </p>
                    </div>
                  )}
                </div>

                {/* Vista Desktop (>= 1024px): Espansa quando attiva, Compatta altrimenti */}
                {isActive ? (
                  <div className="hidden lg:flex flex-col justify-between h-full p-8 xl:p-10 gap-8 lg:min-w-[400px] xl:min-w-[500px]">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="text-xs font-semibold text-[#94a3b8]"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {track.kicker}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0 ${track.badgeClass}`}
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          {track.badge}
                        </span>
                      </div>

                      <div className="space-y-2.5 max-w-lg">
                        <h3
                          className="text-2xl xl:text-3xl font-extrabold tracking-tight text-[#f8fafc]"
                          style={{
                            fontFamily: 'var(--font-jakarta), sans-serif',
                          }}
                        >
                          {track.title}
                        </h3>
                        <p className="text-sm text-[#94a3b8] leading-relaxed">
                          {track.description}
                        </p>
                      </div>

                      <div className="border-b border-white/12 text-sm text-[#f8fafc]/90">
                        {track.points.map((point) => (
                          <div
                            key={point}
                            className="py-3 border-t border-white/12"
                          >
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>

                    {track.ctaLabel ? (
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAction(track.action)
                          }}
                          className={`rounded-md h-11 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                            track.action === 'enroll'
                              ? 'bg-[#f8fafc] text-[#090d16] hover:bg-white'
                              : 'border border-white/25 hover:bg-white/10 text-[#f8fafc]'
                          }`}
                        >
                          <span>{track.ctaLabel}</span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 space-y-1.5 border-t border-white/12">
                        <div
                          className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}
                        >
                          PROSSIMAMENTE
                        </div>
                        <p className="text-xs text-[#94a3b8]">
                          Incluso nella roadmap formativa AIutiamoci
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden lg:flex flex-col justify-between h-full p-7 xl:p-8">
                    <div className="space-y-5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${track.badgeClass}`}
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        {track.badge}
                      </span>

                      <div
                        className="text-5xl xl:text-6xl font-extrabold tracking-tighter leading-none text-[#f8fafc]/90"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                      >
                        {track.num}
                      </div>

                      <h3
                        className="text-xl font-bold tracking-tight text-[#f8fafc]"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                      >
                        {track.shortTitle}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectTrackImmediate(idx)
                      }}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer self-start pt-4 border-t border-white/10 w-full justify-between"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      <span>Esplora</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Fascia strutturale 1px Certificazione ATOMA */}
        <div className="pt-8 border-t border-white/12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6366f1]"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              CERTIFICAZIONE EUROPEA DELLE COMPETENZE — ENTE ATOMA
            </div>
            <p className="text-sm text-[#f8fafc]">
              Percorso formativo con rilascio di Attestato Ufficiale, Docente
              Autorizzato ATOMA, valido ai fini professionali.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDirectPayment}
            className="border border-white/20 hover:bg-white/10 text-[#f8fafc] rounded-md px-4 h-10 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-start lg:self-auto"
          >
            <span>Iscrizione Diretta ATOMA</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
