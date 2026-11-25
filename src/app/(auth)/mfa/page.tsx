'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Loader2,
  Smartphone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type MfaViewState = 'loading' | 'verified_aal2' | 'verify_existing' | 'enroll_new'

export default function MfaPage() {
  const [viewState, setViewState] = useState<MfaViewState>('loading')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCodeSrc, setQrCodeSrc] = useState<string>('')
  const [totpSecret, setTotpSecret] = useState<string>('')
  const [otpCode, setOtpCode] = useState<string>('')
  const [otpFocused, setOtpFocused] = useState(false)
  const [destination, setDestination] = useState<string>('/lavori')
  const [submitting, setSubmitting] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const bgParallaxRef = useRef<HTMLDivElement | null>(null)
  const formPanelRef = useRef<HTMLDivElement | null>(null)

  const supabase = createClient()

  const formatQrSrc = (rawQr: string): string => {
    if (!rawQr) return ''
    if (rawQr.startsWith('data:')) return rawQr
    if (rawQr.trim().startsWith('<svg')) {
      return `data:image/svg+xml;utf8,${encodeURIComponent(rawQr)}`
    }
    return rawQr
  }

  const initMfa = useCallback(async () => {
    setViewState('loading')
    setErrorMessage(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      window.location.href = '/login'
      return
    }

    // Determina la destinazione in base al ruolo su profiles
    try {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = profile?.role || user.user_metadata?.role
      setDestination(role === 'collaborator' ? '/chat' : '/lavori')
    } catch {
      const fallbackRole = user.user_metadata?.role
      setDestination(fallbackRole === 'collaborator' ? '/chat' : '/lavori')
    }

    const [{ data: aalData, error: aalError }, { data: factorsData, error: factorsError }] =
      await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ])

    if (aalError || factorsError) {
      setErrorMessage(
        aalError?.message || factorsError?.message || 'Impossibile verificare lo stato 2FA.'
      )
      setViewState('verify_existing')
      return
    }

    const allTotpFactors =
      factorsData?.totp && factorsData.totp.length > 0
        ? factorsData.totp
        : (factorsData?.all || []).filter((f) => f.factor_type === 'totp')

    const verifiedFactor = allTotpFactors.find((f) => f.status === 'verified')

    if (aalData?.currentLevel === 'aal2' && verifiedFactor) {
      setFactorId(verifiedFactor.id)
      setViewState('verified_aal2')
      return
    }

    if (verifiedFactor) {
      setFactorId(verifiedFactor.id)
      setViewState('verify_existing')
      return
    }

    // Nessun fattore TOTP verificato: pulisci eventuali fattori unverified residui prima del nuovo enroll
    const unverifiedFactors = allTotpFactors.filter((f) => f.status !== 'verified')
    for (const staleFactor of unverifiedFactors) {
      await supabase.auth.mfa.unenroll({ factorId: staleFactor.id })
    }

    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'AIutiamoci Authenticator',
    })

    if (enrollError || !enrollData) {
      setErrorMessage(
        enrollError?.message || 'Impossibile avviare la configurazione 2FA TOTP.'
      )
      setViewState('enroll_new')
      return
    }

    setFactorId(enrollData.id)
    setQrCodeSrc(formatQrSrc(enrollData.totp.qr_code))
    setTotpSecret(enrollData.totp.secret)
    setViewState('enroll_new')
  }, [supabase])

  useEffect(() => {
    setMounted(true)
    initMfa()

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
  }, [initMfa])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return

    const cleanCode = otpCode.replace(/\D/g, '').trim()
    if (cleanCode.length !== 6) {
      setErrorMessage('Inserisci un codice OTP valido a 6 cifre.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode,
    })

    if (error) {
      setErrorMessage(error.message || 'Codice non valido o scaduto. Riprova.')
      setSubmitting(false)
      return
    }

    setSuccessMessage('Verifica 2FA completata! Accesso in corso...')
    setTimeout(() => {
      window.location.href = destination
    }, 500)
  }

  const handleCopySecret = async () => {
    if (!totpSecret) return
    try {
      await navigator.clipboard.writeText(totpSecret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } catch {
      setErrorMessage('Impossibile copiare automaticamente il segreto. Copialo manualmente.')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
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

  const renderSegmentedOtpInput = (inputId: string) => {
    const activeSlot = Math.min(otpCode.length, 5)
    return (
      <div className="relative">
        <input
          id={inputId}
          name="otpCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={otpCode}
          onFocus={() => setOtpFocused(true)}
          onBlur={() => setOtpFocused(false)}
          onChange={(e) =>
            setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          aria-label="Codice OTP a 6 cifre"
          className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-text"
        />

        <div
          aria-hidden="true"
          className="flex items-center justify-between gap-1.5 sm:gap-2.5 select-none"
        >
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1">
            {[0, 1, 2].map((slot) => {
              const char = otpCode[slot] ?? ''
              const isCurrent = otpFocused && activeSlot === slot
              return (
                <div
                  key={slot}
                  className={`h-12 sm:h-14 rounded-md bg-[#0f172a]/80 border flex items-center justify-center text-lg sm:text-xl font-bold text-[#f8fafc] transition-colors ${
                    isCurrent
                      ? 'border-[#6366f1] ring-1 ring-[#6366f1]/60'
                      : char
                        ? 'border-white/25'
                        : 'border-white/12'
                  }`}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {char || (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  )}
                </div>
              )
            })}
          </div>

          <span
            className="text-sm font-bold text-[#94a3b8] px-0.5 sm:px-1"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            —
          </span>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1">
            {[3, 4, 5].map((slot) => {
              const char = otpCode[slot] ?? ''
              const isCurrent = otpFocused && activeSlot === slot
              return (
                <div
                  key={slot}
                  className={`h-12 sm:h-14 rounded-md bg-[#0f172a]/80 border flex items-center justify-center text-lg sm:text-xl font-bold text-[#f8fafc] transition-colors ${
                    isCurrent
                      ? 'border-[#6366f1] ring-1 ring-[#6366f1]/60'
                      : char
                        ? 'border-white/25'
                        : 'border-white/12'
                  }`}
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {char || (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const isStepTwoComplete = viewState === 'verified_aal2'

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
          mounted
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-[0.99]'
        }`}
      >
        {/* Top Bar Minimale fuori dalla card */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-0.5">
          <span
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[#f8fafc]/85"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            PASSO 02 / 02 · VERIFICA IDENTITÀ
          </span>

          <span
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[#94a3b8] border border-white/15 bg-[#090d16]/70 px-2.5 py-1 rounded-md backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            AIUTIAMOCI.CLOUD // SUPABASE MFA · AAL2
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
            <div className="lg:col-span-5 bg-[#090d16]/32 backdrop-blur-[2px] border-b lg:border-b-0 lg:border-r border-white/12 p-5 sm:p-7 lg:p-9 flex flex-col justify-between gap-5 lg:min-h-[540px]">
              <div className="space-y-5">
                <div className="space-y-2">
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
                    SICUREZZA 2FA · TOTP
                  </div>
                </div>

                {/* Mini Stepper Verticale a 2 Passi */}
                <div className="space-y-2.5 pt-2 border-t border-white/12">
                  <div className="flex items-center gap-2.5 text-xs text-[#f8fafc]/90">
                    <span className="h-5 w-5 rounded-md bg-[#10b981]/20 border border-[#10b981]/50 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#10b981]" />
                    </span>
                    <span
                      className="text-[11px] font-medium tracking-wide"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      01 · Credenziali verificate
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[#f8fafc]">
                    <span
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isStepTwoComplete
                          ? 'bg-[#10b981]/20 border-[#10b981]/50'
                          : 'bg-[#6366f1]/25 border-[#6366f1]'
                      }`}
                    >
                      {isStepTwoComplete ? (
                        <Check className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                      )}
                    </span>
                    <span
                      className={`text-[11px] font-semibold tracking-wide ${
                        isStepTwoComplete
                          ? 'text-[#10b981]'
                          : 'text-[#f8fafc]'
                      }`}
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      02 · Codice Authenticator
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 lg:pt-6 border-t border-white/12">
                <div
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#f8fafc]/80"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shrink-0" />
                  <span className="leading-relaxed">
                    PROTOCOLLO TOTP · LIVELLO AAL2 · ZERO-TRUST
                  </span>
                </div>
              </div>
            </div>

            {/* Colonna Destra — Pannello Vetro Satinato Ossidiana */}
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
                {/* Intestazione */}
                <div className="mb-6 space-y-2">
                  <div
                    className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6366f1]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    VERIFICA A DUE FATTORI · TOTP
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Conferma identità.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                    Protezione TOTP attiva per l&apos;accesso allo spazio
                    operativo AIutiamoci.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-5 p-3.5 rounded-md bg-red-950/75 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="mb-5 p-3.5 rounded-md bg-emerald-950/75 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="font-medium">{successMessage}</span>
                  </div>
                )}

                {viewState === 'loading' && (
                  <div className="py-14 flex flex-col items-center justify-center gap-3 text-[#94a3b8]">
                    <Loader2 className="h-7 w-7 animate-spin text-[#6366f1]" />
                    <span className="text-xs">
                      Verifica stato 2FA in corso...
                    </span>
                  </div>
                )}

                {viewState === 'verified_aal2' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-md bg-emerald-950/40 border border-emerald-500/35 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#f8fafc]">
                          2FA attiva e verificata
                        </p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">
                          La tua sessione corrente è protetta con livello AAL2
                          tramite app Authenticator.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = destination
                      }}
                      className="w-full h-12 rounded-md bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Vai alla piattaforma</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {viewState === 'verify_existing' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="p-4 rounded-md bg-[#0f172a]/75 border border-white/12 flex items-start gap-3">
                      <Smartphone className="h-4 w-4 text-[#6366f1] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#94a3b8] leading-relaxed">
                        Apri la tua app Authenticator (Google Authenticator,
                        1Password, Authy) e inserisci il codice temporaneo a 6
                        cifre.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="mfa-otp-verify"
                        className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        CODICE OTP A 6 CIFRE
                      </label>
                      {renderSegmentedOtpInput('mfa-otp-verify')}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpCode.length !== 6}
                      className="w-full h-12 rounded-md bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#090d16]" />
                      ) : (
                        <>
                          <span>Verifica e Accedi</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {viewState === 'enroll_new' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="p-4 rounded-md bg-[#0f172a]/75 border border-white/12 space-y-3.5">
                      <p className="text-xs text-[#94a3b8] leading-relaxed">
                        1. Scansiona questo QR Code con la tua app Authenticator
                        (Google Authenticator, Apple Password, Authy o
                        Bitwarden).
                      </p>

                      {qrCodeSrc && (
                        <div className="flex justify-center py-1">
                          <div className="p-3 rounded-lg bg-white">
                            <img
                              src={qrCodeSrc}
                              alt="QR Code 2FA"
                              className="w-40 h-40 object-contain"
                            />
                          </div>
                        </div>
                      )}

                      {totpSecret && (
                        <div className="space-y-1.5 pt-1">
                          <span className="block text-[11px] font-medium text-[#94a3b8]">
                            Oppure inserisci manualmente la chiave segreta:
                          </span>
                          <div className="flex items-center gap-2 bg-[#090d16] border border-white/12 rounded-md px-3 py-2">
                            <code
                              className="text-xs text-[#f8fafc] break-all flex-1 select-all"
                              style={{
                                fontFamily: 'var(--font-mono), monospace',
                              }}
                            >
                              {totpSecret}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="px-2.5 py-1.5 rounded-md bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                            >
                              {copiedSecret ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-[#10b981]" />
                                  <span>Copiato</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copia</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="mfa-otp-enroll"
                        className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}
                      >
                        2. CODICE A 6 CIFRE GENERATO DALL&apos;APP
                      </label>
                      {renderSegmentedOtpInput('mfa-otp-enroll')}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !factorId || otpCode.length !== 6}
                      className="w-full h-12 rounded-md bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#090d16]" />
                      ) : (
                        <>
                          <span>Attiva 2FA e Entra</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer Sign Out */}
                <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between text-xs">
                  <span
                    className="text-[#94a3b8] text-[11px]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    Supabase MFA · AAL2
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-red-400 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Esci</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
