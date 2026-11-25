'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const CHAPTERS = [
  {
    num: '01',
    title: 'Diagnosi & Chiarezza',
    headline: 'Prima degli strumenti, mappiamo dove perdi tempo davvero.',
    specs: ['Audit processi operativi', 'Zero software superflui'],
  },
  {
    num: '02',
    title: 'Formazione Applicata',
    headline: 'Competenze operative sul lavoro reale, non teoria astratta.',
    specs: ['20 lezioni AI Start su casi concreti', 'Tutor @AI attivo 24/7'],
  },
  {
    num: '03',
    title: 'Automazione Su Misura',
    headline: 'Agenti, monitoraggio e flussi integrati nei tuoi strumenti.',
    specs: ['CRM, WhatsApp e gestionali', 'Controllo umano e conformità GDPR'],
  },
] as const

export function PinnedMethod() {
  const rootRef = useRef<HTMLElement | null>(null)
  const desktopPinRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const chapterRefs = useRef<Array<HTMLDivElement | null>>([])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const ch0 = chapterRefs.current[0]
          const ch1 = chapterRefs.current[1]
          const ch2 = chapterRefs.current[2]
          const pinEl = desktopPinRef.current
          const barEl = progressBarRef.current

          if (!ch0 || !ch1 || !ch2 || !pinEl || !barEl) return

          gsap.set(ch0, { opacity: 1, y: 0 })
          gsap.set([ch1, ch2], { opacity: 0, y: 36 })
          gsap.set(barEl, { scaleX: 0 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinEl,
              pin: true,
              scrub: 0.7,
              start: 'top 56px',
              end: '+=210%',
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx =
                  self.progress < 0.34 ? 0 : self.progress < 0.68 ? 1 : 2
                setActiveIndex((prev) => (prev === idx ? prev : idx))
              },
            },
          })

          tl.to(barEl, { scaleX: 1, ease: 'none', duration: 3 }, 0)
            .to(
              ch0,
              { opacity: 0, y: -32, duration: 0.4, ease: 'power2.inOut' },
              0.65
            )
            .to(
              ch1,
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
              0.85
            )
            .to(
              ch1,
              { opacity: 0, y: -32, duration: 0.4, ease: 'power2.inOut' },
              1.8
            )
            .to(
              ch2,
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
              2.0
            )
            .to({}, { duration: 0.55 }, 2.45)
        }
      )

      return () => mm.revert()
    }, rootRef)

    return () => ctx.revert()
  }, [])

  const currentChapter = CHAPTERS[activeIndex] ?? CHAPTERS[0]

  return (
    <section
      ref={rootRef}
      className="bg-[#ffffff] text-[#090d16] border-b border-[#090d16]/10"
    >
      {/* Desktop Pinned Storytelling (nascosto sotto lg o con reduced motion) */}
      <div
        ref={desktopPinRef}
        className="hidden lg:grid motion-reduce:hidden min-h-[calc(100vh-56px)] max-w-6xl mx-auto px-6 py-16 grid-cols-12 gap-12 items-center"
      >
        {/* Colonna Sinistra (40% -> 5 colonne) */}
        <div className="col-span-5 flex flex-col justify-center">
          <div
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            IL METODO
          </div>

          <div
            className="mt-4 text-[7.5rem] xl:text-[10rem] leading-none font-extrabold tracking-tighter text-[#090d16] tabular-nums"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            {currentChapter.num}
          </div>

          <div className="mt-7 h-[2px] w-full max-w-xs bg-[#090d16]/12 overflow-hidden">
            <div
              ref={progressBarRef}
              className="js-method-progress h-full w-full bg-[#6366f1] origin-left scale-x-0 will-change-transform"
            />
          </div>

          <div
            className="mt-4 flex items-center gap-5 text-[11px] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {CHAPTERS.map((ch, idx) => (
              <span
                key={ch.num}
                className={
                  idx === activeIndex
                    ? 'text-[#6366f1] font-semibold'
                    : 'text-[#475569]/60'
                }
              >
                {ch.num}
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm sm:text-base text-[#475569] max-w-sm leading-relaxed">
            Tre passaggi operativi per trasformare l&apos;AI in lavoro
            quotidiano.
          </p>
        </div>

        {/* Colonna Destra (60% -> 7 colonne) */}
        <div className="col-span-7 relative min-h-[340px]">
          {CHAPTERS.map((ch, idx) => (
            <div
              key={ch.num}
              ref={(el) => {
                chapterRefs.current[idx] = el
              }}
              aria-hidden={activeIndex !== idx}
              className="absolute inset-0 flex flex-col justify-center"
            >
              <div
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6366f1]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {ch.num} — {ch.title}
              </div>

              <h3
                className="mt-4 text-3xl xl:text-[2.75rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#090d16]"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                {ch.headline}
              </h3>

              <div className="mt-10 border-b border-[#090d16]/12">
                {ch.specs.map((spec, specIdx) => (
                  <div
                    key={spec}
                    className="py-4 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm text-[#090d16]"
                  >
                    <span className="font-medium">{spec}</span>
                    <span
                      className="text-[11px] text-[#475569]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      0{specIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flusso Verticale Pulito (Mobile / Tablet / Reduced Motion) */}
      <div className="lg:hidden motion-reduce:block max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <div className="pb-10 border-b border-[#090d16]/12">
          <div
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569]"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            IL METODO
          </div>
          <h2
            className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-[1.08] text-[#090d16]"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
          >
            Tre passaggi operativi per trasformare l&apos;AI in lavoro
            quotidiano.
          </h2>
        </div>

        <div className="divide-y divide-[#090d16]/12">
          {CHAPTERS.map((ch) => (
            <article key={ch.num} className="py-10 space-y-5">
              <div className="flex items-baseline gap-4">
                <span
                  className="text-4xl font-extrabold tracking-tighter text-[#090d16]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  {ch.num}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6366f1]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {ch.title}
                </span>
              </div>

              <h3
                className="text-2xl font-extrabold tracking-[-0.025em] leading-[1.14] text-[#090d16]"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                {ch.headline}
              </h3>

              <div className="border-b border-[#090d16]/12">
                {ch.specs.map((spec, specIdx) => (
                  <div
                    key={spec}
                    className="py-3 border-t border-[#090d16]/12 flex items-center justify-between gap-4 text-sm text-[#475569]"
                  >
                    <span>{spec}</span>
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      0{specIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
