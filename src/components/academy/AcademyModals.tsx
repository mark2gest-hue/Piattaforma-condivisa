'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Key,
  Loader2,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LegalModal, CookieBanner } from '@/components/legal/LegalModal'
import {
  checkStudentRegistrationByEmailAction,
  joinWaitlistAction,
  submitCourseRegistrationAction,
  verifyStudentCodeAction,
} from '@/app/actions/student'

export const ATOMA_PAYMENT_URL =
  process.env.NEXT_PUBLIC_ATOMA_PAYMENT_URL ||
  'https://www.atoma.com/product/ai-operativa-per-il-lavoro-percorso-pratico-di-16-ore/'

interface AcademyModalsProps {
  isStudentModalOpen: boolean
  onCloseStudentModal: () => void
  isDirectPaymentModalOpen: boolean
  onCloseDirectPaymentModal: () => void
  isEnrollModalOpen: boolean
  onOpenEnrollModal: () => void
  onCloseEnrollModal: () => void
  isWaitlistModalOpen: boolean
  onCloseWaitlistModal: () => void
  legalModalType: 'privacy' | 'cookies' | 'terms' | 'disclaimer' | null
  onChangeLegalModalType: (
    type: 'privacy' | 'cookies' | 'terms' | 'disclaimer' | null
  ) => void
  referrerName: string
}

interface SplitGlassModalShellProps {
  onClose: () => void
  closeAriaLabel: string
  badgeText: string
  trustNote: string
  eyebrow: string
  title: string
  icon: ReactNode
  children: ReactNode
}

function SplitGlassModalShell({
  onClose,
  closeAriaLabel,
  badgeText,
  trustNote,
  eyebrow,
  title,
  icon,
  children,
}: SplitGlassModalShellProps) {
  const rightPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handlePanelPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rightPanelRef.current) return
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return
    }
    const rect = rightPanelRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    rightPanelRef.current.style.setProperty('--mx', `${mx}px`)
    rightPanelRef.current.style.setProperty('--my', `${my}px`)
    rightPanelRef.current.style.setProperty('--m-opacity', '0.10')
  }

  const handlePanelPointerLeave = () => {
    if (!rightPanelRef.current) return
    rightPanelRef.current.style.setProperty('--m-opacity', '0')
  }

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810]/80 backdrop-blur-md p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-[780px] max-h-[92vh] overflow-y-auto rounded-xl border border-white/15 bg-[#090d16] shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
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

        {/* Sfondo fotografico in trasparenza + Velo direzionale Obsidian */}
        <img
          src="/images/team_docenti.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-[center_26%] opacity-[0.42] pointer-events-none select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-[#090d16]/92 via-[#090d16]/55 to-[#090d16]/80 pointer-events-none"
        />

        {/* Griglia asimmetrica */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12">
          {/* Finestra sinistra vetro fumé trasparente */}
          <div className="md:col-span-5 bg-[#090d16]/32 backdrop-blur-[2px] border-b md:border-b-0 md:border-r border-white/12 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/brand/icon-dark.svg"
                  alt="AIutiamoci"
                  className="h-7 w-7 object-contain shrink-0"
                />
                <span
                  className="text-lg font-extrabold tracking-tight text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  <span className="text-[#6366f1]">AI</span>utiamoci
                </span>
              </div>

              <span
                className="inline-block text-[10px] uppercase tracking-[0.15em] text-[#f8fafc]/90 border border-white/15 bg-[#090d16]/60 px-2.5 py-1 rounded-md"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {badgeText}
              </span>
            </div>

            <div className="space-y-2.5 md:pt-6 md:border-t md:border-white/12">
              <p
                className="hidden md:block text-xs font-semibold text-[#f8fafc] leading-snug"
                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
              >
                &ldquo;Umani nel pensiero. Smart nell&apos;azione.&rdquo;
              </p>
              <div
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.11em] text-[#f8fafc]/80 leading-relaxed"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shrink-0" />
                <span>{trustNote}</span>
              </div>
            </div>
          </div>

          {/* Pannello destro vetro satinato Obsidian */}
          <div
            ref={rightPanelRef}
            onMouseMove={handlePanelPointerMove}
            onMouseLeave={handlePanelPointerLeave}
            className="md:col-span-7 relative bg-[#090d16]/84 backdrop-blur-xl p-5 sm:p-6 overflow-hidden"
          >
            {/* Leggero riflesso speculare radiale */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: 'var(--m-opacity, 0)',
                background:
                  'radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), #6366f1, transparent 70%)',
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                <div className="space-y-1 min-w-0">
                  <div
                    className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#6366f1]"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {icon}
                    <span>{eyebrow}</span>
                  </div>
                  <h3
                    className="font-bold text-base sm:text-lg text-[#f8fafc] tracking-tight"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    {title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeAriaLabel}
                  className="p-1.5 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AcademyModals({
  isStudentModalOpen,
  onCloseStudentModal,
  isDirectPaymentModalOpen,
  onCloseDirectPaymentModal,
  isEnrollModalOpen,
  onOpenEnrollModal,
  onCloseEnrollModal,
  isWaitlistModalOpen,
  onCloseWaitlistModal,
  legalModalType,
  onChangeLegalModalType,
  referrerName,
}: AcademyModalsProps) {
  const router = useRouter()

  // 1. Codice Studente
  const [studentCode, setStudentCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)

  // 2. Pagamento Diretto ATOMA
  const [directPaymentEmail, setDirectPaymentEmail] = useState('')
  const [directPaymentError, setDirectPaymentError] = useState('')
  const [isCheckingDirectEmail, setIsCheckingDirectEmail] = useState(false)
  const [directEmailNotRegistered, setDirectEmailNotRegistered] =
    useState(false)
  const [directEmailVerifiedName, setDirectEmailVerifiedName] = useState<
    string | null
  >(null)

  // 3. Iscrizione Masterclass AI Start
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [enrollError, setEnrollError] = useState('')
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  // 4. Lista d'Attesa AI Pro
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistError, setWaitlistError] = useState('')
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

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
          cohortId:
            (dbStudent as { cohort_id?: string | null }).cohort_id || null,
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

  const handleDirectPaymentCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setDirectPaymentError('')
    setDirectEmailNotRegistered(false)
    setDirectEmailVerifiedName(null)

    const cleanEmail = directPaymentEmail.trim().toLowerCase()
    if (!cleanEmail) return

    setIsCheckingDirectEmail(true)
    try {
      const res = await checkStudentRegistrationByEmailAction(cleanEmail)
      if (res.exists) {
        setDirectEmailVerifiedName(res.name || null)
        window.location.href = ATOMA_PAYMENT_URL
      } else {
        setDirectEmailNotRegistered(true)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Errore durante la verifica della registrazione.'
      setDirectPaymentError(message)
    } finally {
      setIsCheckingDirectEmail(false)
    }
  }

  const handleSwitchFromDirectToEnroll = () => {
    const cleanEmail = directPaymentEmail.trim()
    if (cleanEmail) {
      setEmailInput(cleanEmail)
    }
    setDirectEmailNotRegistered(false)
    setDirectPaymentError('')
    setEnrollError('')
    setEnrollSuccess(false)
    onCloseDirectPaymentModal()
    onOpenEnrollModal()
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrollError('')

    if (!nameInput.trim() || !emailInput.trim()) {
      setEnrollError('Inserisci nome completo ed email per procedere.')
      return
    }

    setIsSubmittingEnroll(true)
    try {
      const res = await submitCourseRegistrationAction({
        name: nameInput.trim(),
        email: emailInput.trim(),
        ai_experience: 'Partecipante Masterclass',
        objective: "Applicare l'AI nel lavoro",
        blocker: 'Nessuno',
        expectation: 'Imparare strumenti pratici',
        referral_source: 'Landing Page / Masterclass',
        referred_by: referrerName.trim() || undefined,
        raw_answers: {
          phone: phoneInput.trim() || null,
          referred_by: referrerName.trim() || null,
          source: 'Sito Web AIutiamoci',
        },
      })

      if (res.success) {
        setEnrollSuccess(true)
      } else {
        setEnrollError(
          res.error || 'Impossibile completare la registrazione. Riprova.'
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Errore di rete durante la registrazione.'
      setEnrollError(message)
    } finally {
      setIsSubmittingEnroll(false)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistError('')
    const cleanEmail = waitlistEmail.trim()
    if (!cleanEmail) return

    setIsSubmittingWaitlist(true)
    try {
      const res = await joinWaitlistAction(cleanEmail)
      if (res && typeof res === 'object' && 'success' in res && !res.success) {
        setWaitlistError(
          (res as { error?: string }).error ||
            'Errore durante l’iscrizione alla lista.'
        )
      } else {
        setWaitlistSuccess(true)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Errore di rete durante l’iscrizione alla lista.'
      setWaitlistError(message)
    } finally {
      setIsSubmittingWaitlist(false)
    }
  }

  return (
    <>
      {/* 1. Modal Codice Studente */}
      {isStudentModalOpen && (
        <SplitGlassModalShell
          onClose={onCloseStudentModal}
          closeAriaLabel="Chiudi modale codice studente"
          badgeText="AREA STUDENTI"
          trustNote="ACCESSO IMMEDIATO · 20 LEZIONI HD + TUTOR @AI"
          eyebrow="ACCESS PASS // CODICE PERSONALE"
          title="Area Studenti — Hai già il codice?"
          icon={<Key className="h-3.5 w-3.5 text-[#6366f1]" />}
        >
          <form onSubmit={handleStudentAccess} className="space-y-4 text-xs">
            <p className="text-[#94a3b8] text-xs leading-relaxed">
              Inserisci il tuo codice di accesso personale (ricevuto via email o
              dal corso precedente) per sbloccare subito le 20 video lezioni e i
              contenuti.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="academy-student-code"
                className="block font-semibold text-[#f8fafc]"
              >
                Codice Univoco di Accesso *
              </label>
              <Input
                id="academy-student-code"
                name="studentCode"
                autoFocus
                required
                value={studentCode}
                onChange={(e) => {
                  setStudentCode(e.target.value)
                  if (codeError) setCodeError('')
                }}
                placeholder="Es. AI-START-8F92 oppure DEMO2026"
                className="rounded-md text-center font-mono uppercase tracking-widest font-bold text-sm h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc]"
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
        </SplitGlassModalShell>
      )}

      {/* 2. Modal Pagamento Diretto ATOMA */}
      {isDirectPaymentModalOpen && (
        <SplitGlassModalShell
          onClose={onCloseDirectPaymentModal}
          closeAriaLabel="Chiudi modale pagamento diretto"
          badgeText="PORTALE ATOMA"
          trustNote="ENTE FORMATIVO ACCREDITATO · CHECKOUT SICURO"
          eyebrow="VERIFICA PROFILO // ENTE ATOMA"
          title="Iscrizione Diretta — Portale ATOMA"
          icon={<CreditCard className="h-3.5 w-3.5 text-[#6366f1]" />}
        >
          <form onSubmit={handleDirectPaymentCheck} className="space-y-4 text-xs">
            <p className="text-[#94a3b8] text-xs leading-relaxed">
              Inserisci l&apos;email usata in registrazione per verificare il tuo
              profilo e procedere al pagamento sul portale ufficiale Ente ATOMA.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="academy-direct-payment-email"
                className="block font-semibold text-[#f8fafc]"
              >
                Email di Registrazione *
              </label>
              <Input
                id="academy-direct-payment-email"
                name="directPaymentEmail"
                type="email"
                autoFocus
                required
                value={directPaymentEmail}
                onChange={(e) => {
                  setDirectPaymentEmail(e.target.value)
                  if (directPaymentError) setDirectPaymentError('')
                  if (directEmailNotRegistered)
                    setDirectEmailNotRegistered(false)
                }}
                placeholder="nome@azienda.it"
                className="rounded-md h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc] text-sm"
              />
            </div>

            {directPaymentError && (
              <p className="text-red-400 text-xs font-semibold bg-red-950/40 p-2.5 rounded-md border border-red-900/40">
                {directPaymentError}
              </p>
            )}

            {directEmailVerifiedName !== null && (
              <div className="p-3 rounded-md border border-white/15 bg-[#0f172a]/80 space-y-2 text-[#f8fafc]">
                <p className="font-semibold">
                  Profilo verificato ({directEmailVerifiedName}).
                  Reindirizzamento al checkout ATOMA in corso...
                </p>
                <a
                  href={ATOMA_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#6366f1] underline font-semibold"
                >
                  <span>Apri manualmente portale ATOMA</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {directEmailNotRegistered && (
              <div className="p-3.5 rounded-md border border-white/15 bg-[#0f172a]/80 space-y-3">
                <p className="text-[#f8fafc] leading-relaxed">
                  Questa email non risulta ancora registrata nella Masterclass
                  AI Start. Completa prima la registrazione in 30 secondi.
                </p>
                <Button
                  type="button"
                  onClick={handleSwitchFromDirectToEnroll}
                  className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold h-10 rounded-md cursor-pointer flex items-center justify-center gap-2 border-0"
                >
                  <span>Passa alla Registrazione (1 clic)</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isCheckingDirectEmail}
              className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              {isCheckingDirectEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifica profilo...</span>
                </>
              ) : (
                <>
                  <span>Verifica e Vai al Pagamento ATOMA</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </SplitGlassModalShell>
      )}

      {/* 3. Modal Iscrizione Masterclass AI Start */}
      {isEnrollModalOpen && (
        <SplitGlassModalShell
          onClose={onCloseEnrollModal}
          closeAriaLabel="Chiudi modale iscrizione"
          badgeText="MASTERCLASS AI START"
          trustNote="20 MODULI HD · TUTOR @AI 24/7 · ATTESTATO ATOMA"
          eyebrow="ISCRIZIONE // PERCORSO OPERATIVO 16H"
          title="Registrazione Masterclass AI Start"
          icon={<UserPlus className="h-3.5 w-3.5 text-[#6366f1]" />}
        >
          {enrollSuccess ? (
            <div className="space-y-5 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4
                    className="text-base font-bold text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Registrazione completata
                  </h4>
                  <p className="text-[#94a3b8] leading-relaxed">
                    Abbiamo registrato i tuoi dati per il percorso AI Start.
                    Puoi completare subito l&apos;iscrizione ufficiale sul
                    portale ATOMA oppure attendere le istruzioni via email.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={ATOMA_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Procedi su Portale ATOMA</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEnrollSuccess(false)
                    onCloseEnrollModal()
                  }}
                  className="w-full h-10 rounded-md border border-white/15 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <p className="text-[#94a3b8] leading-relaxed">
                Compila i campi per registrarti alla Masterclass AI Start (20
                lezioni HD + Tutor @AI 24/7 + Attestato ATOMA).
              </p>

              {referrerName.trim() !== '' && (
                <div
                  className="px-3 py-2 rounded-md border border-[#6366f1]/40 bg-[#6366f1]/10 text-[#f8fafc] text-[11px]"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  INVITO RILEVATO: {referrerName}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="academy-enroll-name"
                  className="block font-semibold text-[#f8fafc]"
                >
                  Nome e Cognome *
                </label>
                <Input
                  id="academy-enroll-name"
                  name="enrollName"
                  autoFocus
                  required
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value)
                    if (enrollError) setEnrollError('')
                  }}
                  placeholder="Es. Mario Rossi"
                  className="rounded-md h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc] text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="academy-enroll-email"
                  className="block font-semibold text-[#f8fafc]"
                >
                  Indirizzo Email *
                </label>
                <Input
                  id="academy-enroll-email"
                  name="enrollEmail"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    if (enrollError) setEnrollError('')
                  }}
                  placeholder="mario.rossi@azienda.it"
                  className="rounded-md h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc] text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="academy-enroll-phone"
                  className="block font-semibold text-[#f8fafc]"
                >
                  Telefono / WhatsApp (opzionale)
                </label>
                <Input
                  id="academy-enroll-phone"
                  name="enrollPhone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+39 333 0000000"
                  className="rounded-md h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc] text-sm"
                />
              </div>

              {enrollError && (
                <p className="text-red-400 text-xs font-semibold bg-red-950/40 p-2.5 rounded-md border border-red-900/40">
                  {enrollError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmittingEnroll}
                className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {isSubmittingEnroll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Registrazione in corso...</span>
                  </>
                ) : (
                  <>
                    <span>Conferma Registrazione</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </SplitGlassModalShell>
      )}

      {/* 4. Modal Lista d'Attesa AI Pro */}
      {isWaitlistModalOpen && (
        <SplitGlassModalShell
          onClose={onCloseWaitlistModal}
          closeAriaLabel="Chiudi modale lista d'attesa"
          badgeText="LISTA PRIORITARIA AI PRO"
          trustNote="MULTI-AGENTE · RAG AZIENDALE · N8N & AUTOMAZIONI"
          eyebrow="ACCESSO ANTICIPATO // COHORT PRO"
          title="Lista d'Attesa — AI Pro (Agentico)"
          icon={<Sparkles className="h-3.5 w-3.5 text-[#6366f1]" />}
        >
          {waitlistSuccess ? (
            <div className="space-y-5 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4
                    className="text-base font-bold text-[#f8fafc]"
                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                  >
                    Sei in lista prioritaria
                  </h4>
                  <p className="text-[#94a3b8] leading-relaxed">
                    Ti avviseremo appena apriranno le iscrizioni ad AI Pro
                    (Sistemi Multi-Agente, RAG Aziendale e automazioni) con
                    invito dedicato.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWaitlistSuccess(false)
                  setWaitlistEmail('')
                  onCloseWaitlistModal()
                }}
                className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4 text-xs">
              <p className="text-[#94a3b8] leading-relaxed">
                Lascia la tua email per ricevere accesso prioritario e coupon
                riservato all&apos;apertura di AI Pro.
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="academy-waitlist-email"
                  className="block font-semibold text-[#f8fafc]"
                >
                  Email per Invito Prioritario *
                </label>
                <Input
                  id="academy-waitlist-email"
                  name="waitlistEmail"
                  type="email"
                  autoFocus
                  required
                  value={waitlistEmail}
                  onChange={(e) => {
                    setWaitlistEmail(e.target.value)
                    if (waitlistError) setWaitlistError('')
                  }}
                  placeholder="nome@azienda.it"
                  className="rounded-md h-11 bg-[#0f172a]/80 border-white/12 focus:border-[#6366f1] text-[#f8fafc] text-sm"
                />
              </div>

              {waitlistError && (
                <p className="text-red-400 text-xs font-semibold bg-red-950/40 p-2.5 rounded-md border border-red-900/40">
                  {waitlistError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmittingWaitlist}
                className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-11 rounded-md cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {isSubmittingWaitlist ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <span>Iscrivimi alla Lista d&apos;Attesa</span>
                )}
              </Button>
            </form>
          )}
        </SplitGlassModalShell>
      )}

      {/* 5. Legale + Cookie Banner */}
      <div data-lenis-prevent>
        <LegalModal
          isOpen={legalModalType !== null}
          type={legalModalType}
          onClose={() => onChangeLegalModalType(null)}
        />
      </div>
      <CookieBanner onOpenPolicy={() => onChangeLegalModalType('cookies')} />
    </>
  )
}
