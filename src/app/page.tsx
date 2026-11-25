'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowRight, ArrowUpRight, Key, Loader2, Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LegalModal, CookieBanner } from '@/components/legal/LegalModal'
import { verifyStudentCodeAction } from '@/app/actions/student'
import { SplitGateway } from '@/components/home/SplitGateway'
import { PinnedMethod } from '@/components/home/PinnedMethod'

export default function GatewayPage() {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentCode, setStudentCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [legalModalType, setLegalModalType] = useState<
    'privacy' | 'cookies' | 'terms' | 'disclaimer' | null
  >(null)

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

  useEffect(() => {
    if (isStudentModalOpen || legalModalType !== null) {
      lenisRef.current?.stop()
    } else {
      lenisRef.current?.start()
    }
  }, [isStudentModalOpen, legalModalType])

  const handleStudentAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')
    if (!studentCode.trim()) return

    const cleanCode = studentCode.trim().toUpperCase()
    if (cleanCode.startsWith('REF-')) {
      setCodeError(
        'Questo è un link di invito/referral, non un codice di accesso. Usa il codice univoco personale ricevuto via email.'
      )
      return
    }

    setIsVerifyingCode(true)
    try {
      const res = await verifyStudentCodeAction(cleanCode)
      if (res.success && res.student) {
        const dbStudent = res.student
        const rawTier = dbStudent.access_tier
        const tier =
          rawTier === 'ai-start' || rawTier === 'ai-pro' || rawTier === 'both'
            ? rawTier
            : dbStudent.code.startsWith('AI-PRO-')
              ? 'ai-pro'
              : dbStudent.code.startsWith('AI-ALL-')
                ? 'both'
                : 'ai-start'
        const studentObj = {
          name: dbStudent.student_name,
          code: dbStudent.code,
          accessTier: tier,
          sessionToken: res.sessionToken,
          cohortId: (dbStudent as { cohort_id?: string | null }).cohort_id || null,
        }
        try {
          localStorage.setItem(
            'ti_aiuto_active_student',
            JSON.stringify(studentObj)
          )
        } catch {
          // ignore storage quota errors
        }
        router.push(`/corsi?code=${encodeURIComponent(cleanCode)}`)
      } else {
        setCodeError(
          res.error ||
            'Codice non valido o non trovato. Controlla il codice ricevuto via email.'
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Errore durante la verifica del codice.'
      setCodeError(message)
    } finally {
      setIsVerifyingCode(false)
    }
  }

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

      {/* Top Bar Architetturale (56px / h-14) */}
      <header className="sticky top-0 z-40 h-14 bg-[#090d16] border-b border-white/10">
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
            >
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
              onClick={() => {
                setCodeError('')
                setIsStudentModalOpen(true)
              }}
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
        {/* Atto I: Split-Screen 50/50 Vivo + Ticker Editoriale */}
        <SplitGateway />

        {/* Atto II: Pinned Scroll Storytelling (01 -> 02 -> 03) */}
        <PinnedMethod />

        {/* Atto III: Closing Architetturale */}
        <section className="bg-[#090d16] text-[#f8fafc] border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
            <h2
              className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-[-0.03em] leading-[1.06] text-[#f8fafc]"
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              Umani nel pensiero.
              <br />
              Smart nell&apos;azione.
            </h2>

            <div className="mt-12 pt-8 border-t border-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div
                className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-wider text-[#94a3b8]"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                <span>GDPR &amp; Dati Protetti</span>
                <span>Zero vincoli contrattuali</span>
                <span>Assistenza diretta</span>
              </div>

              <div className="flex flex-wrap items-center gap-5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCodeError('')
                    setIsStudentModalOpen(true)
                  }}
                  className="bg-[#f8fafc] text-[#090d16] hover:bg-white rounded-md px-5 h-11 font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Key className="h-4 w-4" />
                  <span>Inserisci codice studente</span>
                </button>

                <Link
                  href="/academy"
                  className="text-sm font-medium text-[#f8fafc] hover:text-[#94a3b8] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <span>Academy</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <a
                  href="https://www.mark2.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#f8fafc] hover:text-[#94a3b8] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <span>Impresa</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimale */}
      <footer className="border-t border-white/10 bg-[#090d16] py-6 px-6 text-xs text-[#94a3b8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#f8fafc]">aiutiamoci.cloud</span>
            <span>• Umani nel pensiero. Smart nell&apos;azione.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#94a3b8]">
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

      {/* Modal Login Studente Rapido con Codice */}
      {isStudentModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-[#0f172a] rounded-md shadow-2xl w-full max-w-md border border-white/15 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Area Studenti — Hai già il codice?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStudentAccess} className="p-6 space-y-4 text-xs">
              <p className="text-[#94a3b8] text-xs leading-relaxed">
                Inserisci il tuo codice di accesso personale (ricevuto via email o
                dal corso precedente) per sbloccare subito le 20 video lezioni e i
                contenuti.
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="student-access-code"
                  className="block font-semibold text-[#f8fafc]"
                >
                  Codice Univoco di Accesso *
                </label>
                <Input
                  id="student-access-code"
                  name="studentCode"
                  autoFocus
                  required
                  value={studentCode}
                  onChange={(e) => {
                    setStudentCode(e.target.value)
                    if (codeError) setCodeError('')
                  }}
                  placeholder="Es. AI-START-8F92 oppure DEMO2026"
                  className="rounded-md text-center font-mono uppercase tracking-widest font-bold text-sm h-11 bg-[#090d16] border-white/15 text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                />
              </div>

              {codeError && (
                <p className="text-red-400 text-xs font-semibold text-center bg-red-950/40 p-2.5 rounded-md border border-red-900/40">
                  {codeError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isVerifyingCode}
                className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifica codice in corso...</span>
                  </>
                ) : (
                  <span>Verifica ed Entra al Corso</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modale Legale */}
      <div data-lenis-prevent>
        <LegalModal
          isOpen={legalModalType !== null}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </div>
      <CookieBanner onOpenPolicy={() => setLegalModalType('cookies')} />
    </div>
  )
}
