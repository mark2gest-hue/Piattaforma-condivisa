'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  KeyRound,
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
  const [destination, setDestination] = useState<string>('/lavori')
  const [submitting, setSubmitting] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070A12] text-slate-100 font-sans relative overflow-hidden p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-20 w-[650px] h-[650px] bg-gradient-to-br from-indigo-600/20 via-blue-600/15 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-[700px] h-[700px] bg-gradient-to-tl from-cyan-500/20 via-indigo-700/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Card Container */}
      <div
        className={`relative z-10 w-full max-w-[480px] transition-all duration-500 ease-in-out transform ${
          mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        <div className="relative bg-[#0d1424]/90 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(99,102,241,0.18)] overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="mb-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/40 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>AIUTIAMOCI • SICUREZZA 2FA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Autenticazione{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                a Due Fattori
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Protezione TOTP obbligatoria per l&apos;accesso al workspace condiviso.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {viewState === 'loading' && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
              <span className="text-xs">Verifica stato 2FA in corso...</span>
            </div>
          )}

          {viewState === 'verified_aal2' && (
            <div className="space-y-5 relative z-10">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">2FA attiva e verificata</p>
                  <p className="text-xs text-slate-300">
                    La tua sessione corrente è protetta con livello AAL2 tramite app Authenticator.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = destination
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Vai alla piattaforma</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {viewState === 'verify_existing' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10">
              <div className="p-4 rounded-2xl bg-[#11192e]/90 border border-slate-700/80 flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apri la tua app Authenticator (Google Authenticator, 1Password, Authy) e inserisci il codice temporaneo a 6 cifre.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  Codice OTP a 6 cifre
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#11192e]/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-center text-lg tracking-[0.45em] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || otpCode.length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verifica e Accedi</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {viewState === 'enroll_new' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10">
              <div className="p-4 rounded-2xl bg-[#11192e]/90 border border-slate-700/80 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. Scansiona questo QR Code con la tua app Authenticator (Google Authenticator, Apple Password, Authy o Bitwarden).
                </p>

                {qrCodeSrc && (
                  <div className="flex justify-center py-2">
                    <div className="p-3 rounded-2xl bg-white shadow-lg">
                      <img
                        src={qrCodeSrc}
                        alt="QR Code 2FA"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  </div>
                )}

                {totpSecret && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-slate-400">
                      Oppure inserisci manualmente la chiave segreta:
                    </span>
                    <div className="flex items-center gap-2 bg-[#070A12] border border-slate-700 rounded-xl px-3 py-2">
                      <code className="text-xs font-mono text-cyan-300 break-all flex-1 select-all">
                        {totpSecret}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedSecret ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 tracking-wide">
                  2. Inserisci il codice a 6 cifre generato dall&apos;app
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#11192e]/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-center text-lg tracking-[0.45em] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !factorId || otpCode.length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Attiva 2FA e Entra</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Sign Out */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Supabase MFA • AAL2</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-400 font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
