'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Trophy,
  RefreshCw,
  BookOpen,
  ExternalLink,
  MessageSquare,
  GraduationCap,
} from 'lucide-react'
import {
  initStudentWorkspaceAction,
  submitMissionTaskAction,
  CourseTier,
  StudentMissionItem,
  StudentCertificateData,
} from '@/app/actions/student-workshop'
import { AIProviderId } from '@/lib/agent-engine/multi-provider'
import { CertificateModal } from './CertificateModal'

interface StudentTasksZoneProps {
  provider: AIProviderId
  initialTier?: CourseTier
}

export function StudentTasksZone({ provider, initialTier = 'ai-start' }: StudentTasksZoneProps) {
  const [tier, setTier] = useState<CourseTier>(initialTier)
  const [missions, setMissions] = useState<StudentMissionItem[]>([])
  const [studentName, setStudentName] = useState<string>('Studente')
  const [studentEmail, setStudentEmail] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [certificate, setCertificate] = useState<StudentCertificateData | null>(null)
  const [showCertModal, setShowCertModal] = useState(false)

  // Espansione card missione attiva
  const [expandedMissionId, setExpandedMissionId] = useState<number | null>(1)
  // Input testi per ogni missione
  const [submissions, setSubmissions] = useState<Record<number, string>>({})
  // Feedback locali per feedback istantaneo
  const [feedbackMap, setFeedbackMap] = useState<Record<number, any>>({})

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadWorkspace = async (targetTier: CourseTier) => {
    setIsLoading(true)
    const res = await initStudentWorkspaceAction(targetTier)
    if (res.success) {
      setStudentName(res.studentName || 'Studente')
      setStudentEmail(res.studentEmail || '')
      setMissions(res.missions || [])
      setProgressPercent(res.progressPercent || 0)
      setCompletedCount(res.completedCount || 0)
      setAverageScore(res.averageScore || 0)
      setCertificate(res.certificate || null)

      // Popola input esistenti
      const initialSubs: Record<number, string> = {}
      const initialFeed: Record<number, any> = {}
      for (const m of res.missions || []) {
        if (m.studentSubmission) initialSubs[m.missionId] = m.studentSubmission
        if (m.miraFeedback) initialFeed[m.missionId] = m.miraFeedback
      }
      setSubmissions(initialSubs)
      setFeedbackMap(initialFeed)

      // Apri la prima missione incompleta
      const firstIncomplete = res.missions?.find((m) => m.status !== 'completed')
      if (firstIncomplete) {
        setExpandedMissionId(firstIncomplete.missionId)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadWorkspace(tier)
  }, [tier])

  const handleTierSwitch = (newTier: CourseTier) => {
    setTier(newTier)
  }

  const handleSubmitMission = (missionId: number) => {
    const text = submissions[missionId] || ''
    if (!text.trim() || text.length < 15) return

    setIsSubmitting(missionId)
    startTransition(async () => {
      const res = await submitMissionTaskAction({
        missionId,
        courseTier: tier,
        submissionText: text,
        provider,
      })

      if (res.success) {
        // Aggiorna stato locale
        setFeedbackMap((prev) => ({ ...prev, [missionId]: res.feedback }))
        if (res.newlyIssuedCertificate) {
          setCertificate(res.newlyIssuedCertificate)
          setShowCertModal(true)
        }
        // Ricarica dati completi dal server
        await loadWorkspace(tier)
      }
      setIsSubmitting(null)
    })
  }

  return (
    <div className="space-y-5">
      {/* Header Dashboard Compiti — Swiss Hairline */}
      <div className="rounded-lg bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e3dc] dark:border-white/[0.08]">
          <div className="space-y-1 pb-3.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#6366f1] shrink-0" />
              <h3 className="text-base font-semibold text-[#111113] dark:text-[#f4f4f5] tracking-tight font-[family-name:var(--font-jakarta)]">
                Zona Compiti Personale: <span className="text-[#6366f1]">{studentName}</span>
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              I tuoi esercizi pratici vengono valutati da Mira e salvati nella tua area privata. Completale tutte per sbloccare l&apos;Attestato.
            </p>
          </div>

          {/* Selettore Tier Corso (AI Start vs AI Pro) — Tab a sottolineatura border-b-2 */}
          <div className="flex items-center gap-1 text-xs shrink-0">
            <button
              type="button"
              onClick={() => handleTierSwitch('ai-start')}
              className={`px-3 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                tier === 'ai-start'
                  ? 'border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              AI Start (Basi)
            </button>
            <button
              type="button"
              onClick={() => handleTierSwitch('ai-pro')}
              className={`px-3 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                tier === 'ai-pro'
                  ? 'border-[#6366f1] text-[#111113] dark:text-[#f4f4f5]'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              AI Pro (Agenti & n8n)
            </button>
          </div>
        </div>

        {/* Barra di Avanzamento Dinamica */}
        <div className="px-5 py-4 bg-[#f7f6f3]/60 dark:bg-[#141417] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-700 dark:text-zinc-300">
                Avanzamento Missioni: {completedCount} di {missions.length} completate
              </span>
              <span className="text-[#6366f1] font-[family-name:var(--font-mono)] font-semibold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e5e3dc] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6366f1] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="md:text-right">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                Media Voti
              </span>
              <strong className="text-sm font-[family-name:var(--font-mono)] font-semibold text-[#111113] dark:text-[#f4f4f5]">
                {averageScore > 0 ? `${averageScore}/100` : '—'}
              </strong>
            </div>

            {certificate && (
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Vedi Attestato</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banner Community Telegram & Tutor AI Corsisti */}
      <div className="px-5 py-4 rounded-lg bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-md bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#6366f1] flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-[#111113] dark:text-[#f4f4f5] flex items-center gap-2 flex-wrap font-[family-name:var(--font-jakarta)]">
              <span>Community Telegram & Tutor AI (@Corsi_Masterclass_bot)</span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded border border-[#6366f1]/25">
                RISERVATO CORSISTI
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Confrontati con gli altri corsisti, ricevi aiuto h24 sui prompt e contatta direttamente Marco, Lorenzo o Stefano.
            </p>
          </div>
        </div>

        <a
          href="https://t.me/+QSql9PpGLlMzYmI0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] text-xs font-medium transition-colors shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Entra nel Gruppo Telegram (AIutiamoci Corsi)</span>
          <ExternalLink className="h-3 w-3 opacity-75" />
        </a>
      </div>

      {/* Lista Missioni Didattiche — Hairline List */}
      {isLoading ? (
        <div className="p-10 text-center text-zinc-500 dark:text-zinc-400 space-y-2 rounded-lg border border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#6366f1]" />
          <p className="text-xs">Caricamento della tua area compiti sicura...</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#e5e3dc] dark:border-white/[0.08] divide-y divide-[#e5e3dc] dark:divide-white/[0.08] bg-[#ffffff] dark:bg-[#111114] overflow-hidden">
          {missions.map((m) => {
            const isExpanded = expandedMissionId === m.missionId
            const isDone = m.status === 'completed'
            const currentSub = submissions[m.missionId] || ''
            const feedback = feedbackMap[m.missionId] || m.miraFeedback

            return (
              <div
                key={m.id}
                className={isExpanded ? 'bg-[#ffffff] dark:bg-[#111114]' : 'hover:bg-[#f7f6f3]/60 dark:hover:bg-white/[0.02] transition-colors'}
              >
                {/* Header Riga Missione */}
                <div
                  onClick={() => setExpandedMissionId(isExpanded ? null : m.missionId)}
                  className="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : m.status === 'in_progress'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : m.status === 'in_progress' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)] truncate">
                        {m.missionTitle}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-xl">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {m.score !== null && (
                      <span className="px-2 py-0.5 rounded bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08] font-[family-name:var(--font-mono)] text-[11px] font-medium">
                        {m.score}/100
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-[family-name:var(--font-mono)] font-medium px-2 py-0.5 rounded border ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                          : m.status === 'in_progress'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                          : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {isDone ? 'Superata' : m.status === 'in_progress' ? 'Da Perfezionare' : 'Da Fare'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Contenuto Espanso con Editor di Consegna e Valutazione */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3]/40 dark:bg-[#141417]/60 space-y-4">
                    {/* Obiettivo e Risultato atteso */}
                    <div className="p-3.5 rounded-md bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] text-xs space-y-2">
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <strong className="text-[#6366f1] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[10px] block mb-1">
                          Istruzioni dell&apos;Esercizio
                        </strong>
                        {m.description}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-[11px] pt-2 border-t border-[#e5e3dc] dark:border-white/[0.08]">
                        <strong className="text-[#111113] dark:text-[#f4f4f5]">Cosa cerca Mira: </strong>
                        {m.expectedOutcome}
                      </div>
                    </div>

                    {/* Area di testo per la consegna */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#111113] dark:text-[#f4f4f5] flex items-center justify-between">
                        <span>La tua Risposta / Codice / Prompt:</span>
                        <span className="text-[11px] font-[family-name:var(--font-mono)] text-zinc-500 dark:text-zinc-400 font-normal">
                          Minimo 15 caratteri
                        </span>
                      </label>
                      <textarea
                        rows={5}
                        value={currentSub}
                        onChange={(e) =>
                          setSubmissions((prev) => ({ ...prev, [m.missionId]: e.target.value }))
                        }
                        placeholder="Incolla qui il tuo prompt, le regole decisionali IF/THEN o la soluzione architetturale..."
                        className="w-full p-3.5 rounded-md bg-[#ffffff] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] text-xs text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6366f1] font-[family-name:var(--font-mono)] leading-relaxed resize-y"
                      />
                    </div>

                    {/* Feedback Didattico di Mira se presente */}
                    {feedback && (
                      <div className="p-4 rounded-md bg-[#ffffff] dark:bg-[#111114] border border-[#6366f1]/30 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#6366f1] flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-3.5 h-3.5" /> Correzione di Mira Tutor
                          </span>
                          {feedback.score !== undefined && (
                            <span className="font-[family-name:var(--font-mono)] font-semibold text-[#111113] dark:text-[#f4f4f5] text-xs">
                              Punteggio: {feedback.score}/100
                            </span>
                          )}
                        </div>

                        {feedback.comment && (
                          <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed italic">
                            &ldquo;{feedback.comment}&rdquo;
                          </p>
                        )}

                        {feedback.strengths && feedback.strengths.length > 0 && (
                          <div className="space-y-1">
                            <strong className="text-[10px] font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Punti di Forza:
                            </strong>
                            <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-300 space-y-0.5">
                              {feedback.strengths.map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.improvements && feedback.improvements.length > 0 && (
                          <div className="space-y-1">
                            <strong className="text-[10px] font-[family-name:var(--font-mono)] text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              Da Perfezionare:
                            </strong>
                            <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-300 space-y-0.5">
                              {feedback.improvements.map((imp: string, idx: number) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pulsante Invio Compito */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isDone ? 'Puoi inviare una versione migliorata quando vuoi.' : 'Valutazione istantanea con AI.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSubmitMission(m.missionId)}
                        disabled={isSubmitting === m.missionId || !currentSub.trim() || currentSub.length < 15}
                        className="px-4 py-2 rounded-md bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] disabled:opacity-40 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {isSubmitting === m.missionId ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Mira sta valutando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{isDone ? 'Riconsegna Compito' : 'Invia a Mira per Valutazione'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modale Attestato se aperto */}
      {showCertModal && certificate && (
        <CertificateModal certificate={certificate} onClose={() => setShowCertModal(false)} />
      )}
    </div>
  )
}
