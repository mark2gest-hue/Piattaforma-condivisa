'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const bgParallaxRef = useRef<HTMLDivElement | null>(null)
  const formPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const isFinePointer = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
    ).matches

    if (prefersReducedMotion || !isFinePointer) return

    const handleWindowPointerMove = (e: MouseEvent) => {
      if (!bgParallaxRef.current) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      const tx = (-nx * 7).toFixed(2)
      const ty = (-ny * 7).toFixed(2)
      bgParallaxRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.025)`
    }

    window.addEventListener('mousemove', handleWindowPointerMove, {
      passive: true,
    })
    return () => {
      window.removeEventListener('mousemove', handleWindowPointerMove)
    }
  }, [])

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message || 'Credenziali non valide o utente non trovato.')
      setLoading(false)
      return
    }

    // Controllo MFA TOTP: redirect a /mfa se l'utente ha già 2FA attiva o se la 2FA è richiesta per il team
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const requireTeamMfa = process.env.NEXT_PUBLIC_REQUIRE_TEAM_MFA === 'true'
    const shouldRedirectToMfa =
      aalData?.currentLevel !== 'aal2' &&
      (aalData?.nextLevel === 'aal2' || requireTeamMfa)

    // Login riuscito -> avvia l'animazione di chiusura fluida (fold/shrink) prima del redirect
    setIsClosing(true)
    setTimeout(() => {
      window.location.href = shouldRedirectToMfa ? '/mfa' : '/lavori'
    }, 600)
  }

  const handleFormPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formPanelRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = formPanelRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    formPanelRef.current.style.setProperty('--mx', `${mx}px`)
    formPanelRef.current.style.setProperty('--my', `${my}px`)
    formPanelRef.current.style.setProperty('--m-opacity', '0.10')
  }

  const handleFormPointerLeave = () => {
    if (!formPanelRef.current) return
    formPanelRef.current.style.setProperty('--m-opacity', '0')
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090d16] text-[#f8fafc] relative overflow-x-clip overflow-y-auto px-4 py-6 sm:p-6 selection:bg-[#6366f1] selection:text-white"
      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
    >
      {/* Sfondo Fotografico in Trasparenza (/images/team_docenti.jpg) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090d16]"
      >
        <div
          ref={bgParallaxRef}
          className="absolute inset-0 will-change-transform transition-transform duration-300 ease-out"
          style={{ transform: 'translate3d(0px, 0px, 0) scale(1.025)' }}
        >
          <img
            src="/images/team_docenti.jpg"
            alt="Team AIutiamoci"
            className="w-full h-full object-cover object-[center_26%] opacity-[0.44] saturate-[0.88] contrast-[1.06]"
          />
        </div>

        {/* Velo Direzionale Obsidian */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#090d16]/90 via-[#090d16]/55 to-[#090d16]/75" />

        {/* Micro-griglia tecnica discreta */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      {/* Contenitore Principale */}
      <div
        className={`relative z-10 w-full max-w-[940px] transition-all duration-500 ease-out ${
          isClosing
            ? 'opacity-0 scale-[1.02] pointer-events-none'
            : mounted
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-[0.99]'
        }`}
      >
        {/* Top Bar Minimale fuori dalla card */}
        <div className="flex items-center justify-between gap-4 mb-4 px-0.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#f8fafc]/80 hover:text-[#f8fafc] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Torna alla Home</span>
          </Link>

          <span
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[#94a3b8] border border-white/15 bg-[#090d16]/70 px-2.5 py-1 rounded-md backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            AIUTIAMOCI.CLOUD // PORTALE RISERVATO
          </span>
        </div>

        {/* Monolite Split-Glass Asimmetrico */}
        <div className="relative border border-white/15 rounded-xl overflow-hidden shadow-2xl shadow-black/70">
          {/* 4 micro-tacche architetturali 1px agli angoli */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-2 h-2.5 w-2.5 border-t border-l border-white/40 z-20"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 border-t border-r border-white/40 z-20"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-white/40 z-20"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-white/40 z-20"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Colonna Sinistra — Finestra Vetro Fumé Trasparente */}
            <div className="lg:col-span-5 bg-[#090d16]/32 backdrop-blur-[2px] border-b lg:border-b-0 lg:border-r border-white/12 p-5 sm:p-7 lg:p-9 flex flex-col justify-between gap-6 lg:min-h-[540px]">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/brand/icon-dark.svg"
                    alt="AIutiamoci"
                    className="h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0"
                  />
                  <span
                    className="text-lg sm:text-xl font-extrabold tracking-tight text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    <span className="text-[#6366f1]">AI</span>utiamoci
                  </span>
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.16em] text-[#f8fafc]/75"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  WORKSPACE &amp; ACADEMY
                </div>
              </div>

              <div className="space-y-3 pt-4 lg:pt-8 border-t border-white/12">
                <p
                  className="text-xs sm:text-sm font-semibold text-[#f8fafc] leading-snug"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  &ldquo;Umani nel pensiero. Smart nell&apos;azione.&rdquo;
                </p>

                <div
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#f8fafc]/80"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shrink-0" />
                  <span className="leading-relaxed">
                    SESSIONE CRITTOGRAFATA · SUPABASE AUTH GUARD · MFA READY
                  </span>
                </div>
              </div>
            </div>

            {/* Colonna Destra — Pannello Form Vetro Satinato Ossidiana */}
            <div
              ref={formPanelRef}
              onMouseMove={handleFormPointerMove}
              onMouseLeave={handleFormPointerLeave}
              className="lg:col-span-7 relative bg-[#090d16]/82 backdrop-blur-xl p-6 sm:p-9 lg:p-11 overflow-hidden"
            >
              {/* Luce speculare radiale sottilissima al passaggio cursore */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: 'var(--m-opacity, 0)',
                  background:
                    'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), #6366f1, transparent 70%)',
                }}
              />

              <div className="relative z-10">
                <div className="mb-7 space-y-2">
                  <div
                    className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6366f1]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    ACCESSO RISERVATO · AREA WORKSPACE
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Bentornato.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                    Inserisci le tue credenziali per entrare nello spazio
                    operativo AIutiamoci.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-6 p-3.5 rounded-md bg-red-950/75 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      INDIRIZZO EMAIL
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] group-focus-within:text-[#6366f1] transition-colors" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@aiutiamoci.cloud"
                        className="w-full h-12 bg-[#0f172a]/75 border border-white/12 rounded-md pl-10 pr-4 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      PASSWORD
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] group-focus-within:text-[#6366f1] transition-colors" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-12 bg-[#0f172a]/75 border border-white/12 rounded-md pl-10 pr-11 text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword
                            ? 'Nascondi password'
                            : 'Mostra password'
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-[#6366f1]" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Opzioni */}
                  <div className="flex items-center justify-between gap-4 text-xs pt-0.5">
                    <label
                      htmlFor="login-remember"
                      className="flex items-center gap-2.5 cursor-pointer select-none text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                    >
                      <input
                        id="login-remember"
                        name="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                          rememberMe
                            ? 'bg-[#6366f1] border-[#6366f1] text-white'
                            : 'border-white/20 bg-[#0f172a]'
                        }`}
                      >
                        {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>Ricordami</span>
                    </label>

                    <Link
                      href="/corso-base"
                      className="text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors underline-offset-4 hover:underline"
                    >
                      Password dimenticata?
                    </Link>
                  </div>

                  {/* CTA Primaria Paper White */}
                  <button
                    type="submit"
                    disabled={loading || isClosing}
                    className="w-full h-12 rounded-md bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isClosing ? (
                      <span className="inline-flex items-center gap-2 text-[#10b981] font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                        <span className="text-[#090d16]">
                          Accesso verificato...
                        </span>
                      </span>
                    ) : loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#090d16]" />
                        <span>Verifica in corso...</span>
                      </span>
                    ) : (
                      <>
                        <span>Accedi al Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer sobrio */}
                <div className="mt-7 pt-5 border-t border-white/10 text-xs text-[#94a3b8]">
                  Hai problemi con il tuo account?{' '}
                  <Link
                    href="/servizi-ai"
                    className="font-semibold text-[#f8fafc] hover:text-[#6366f1] transition-colors underline underline-offset-4"
                  >
                    Assistenza AIutiamoci
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
