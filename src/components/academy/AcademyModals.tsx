'use client'

import { useState } from 'react'
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
                onClick={onCloseStudentModal}
                aria-label="Chiudi modale codice studente"
                className="p-1 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleStudentAccess}
              className="p-6 space-y-4 text-xs"
            >
              <p className="text-[#94a3b8] text-xs leading-relaxed">
                Inserisci il tuo codice di accesso personale (ricevuto via email
                o dal corso precedente) per sbloccare subito le 20 video lezioni
                e i contenuti.
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

      {/* 2. Modal Pagamento Diretto ATOMA */}
      {isDirectPaymentModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-[#0f172a] rounded-md shadow-2xl w-full max-w-md border border-white/15 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Iscrizione Diretta — Portale ATOMA
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseDirectPaymentModal}
                aria-label="Chiudi modale pagamento diretto"
                className="p-1 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleDirectPaymentCheck}
              className="p-6 space-y-4 text-xs"
            >
              <p className="text-[#94a3b8] text-xs leading-relaxed">
                Inserisci l&apos;email usata in registrazione per verificare il
                tuo profilo e procedere al pagamento sul portale ufficiale Ente
                ATOMA.
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
                  className="rounded-md h-11 bg-[#090d16] border-white/15 text-[#f8fafc] text-sm"
                />
              </div>

              {directPaymentError && (
                <p className="text-red-400 text-xs font-semibold bg-red-950/40 p-2.5 rounded-md border border-red-900/40">
                  {directPaymentError}
                </p>
              )}

              {directEmailVerifiedName !== null && (
                <div className="p-3 rounded-md border border-white/15 bg-[#090d16] space-y-2 text-[#f8fafc]">
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
                <div className="p-3.5 rounded-md border border-white/15 bg-[#090d16] space-y-3">
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
          </div>
        </div>
      )}

      {/* 3. Modal Iscrizione Masterclass AI Start */}
      {isEnrollModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-[#0f172a] rounded-md shadow-2xl w-full max-w-md border border-white/15 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Registrazione Masterclass AI Start
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseEnrollModal}
                aria-label="Chiudi modale iscrizione"
                className="p-1 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {enrollSuccess ? (
              <div className="p-6 space-y-5 text-xs">
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
              <form
                onSubmit={handleEnrollSubmit}
                className="p-6 space-y-4 text-xs"
              >
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
                    className="rounded-md h-11 bg-[#090d16] border-white/15 text-[#f8fafc] text-sm"
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
                    className="rounded-md h-11 bg-[#090d16] border-white/15 text-[#f8fafc] text-sm"
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
                    className="rounded-md h-11 bg-[#090d16] border-white/15 text-[#f8fafc] text-sm"
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
          </div>
        </div>
      )}

      {/* 4. Modal Lista d'Attesa AI Pro */}
      {isWaitlistModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-[#0f172a] rounded-md shadow-2xl w-full max-w-md border border-white/15 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#090d16]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#6366f1]" />
                <h3
                  className="font-bold text-sm text-[#f8fafc]"
                  style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                >
                  Lista d&apos;Attesa — AI Pro (Agentico)
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseWaitlistModal}
                aria-label="Chiudi modale lista d'attesa"
                className="p-1 text-[#94a3b8] hover:text-[#f8fafc] rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {waitlistSuccess ? (
              <div className="p-6 space-y-5 text-xs">
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
                  className="w-full bg-[#f8fafc] hover:bg-white text-[#090d16] font-semibold h-10 rounded-md transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleWaitlistSubmit}
                className="p-6 space-y-4 text-xs"
              >
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
                    className="rounded-md h-11 bg-[#090d16] border-white/15 text-[#f8fafc] text-sm"
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
          </div>
        </div>
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
