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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Dashboard Compiti */}
      <div className="p-4 md:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎒</span>
              <h3 className="text-base md:text-lg font-bold text-white">
                Zona Compiti Personale: <span className="text-cyan-400">{studentName}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              I tuoi esercizi pratici vengono valutati da Mira e salvati nella tua area privata. Completale tutte per sbloccare l&apos;Attestato.
            </p>
          </div>

          {/* Selettore Tier Corso (AI Start vs AI Pro) */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs shrink-0 self-start md:self-auto">
            <button
              onClick={() => handleTierSwitch('ai-start')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                tier === 'ai-start'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔵 AI Start (Basi)
            </button>
            <button
              onClick={() => handleTierSwitch('ai-pro')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                tier === 'ai-pro'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟣 AI Pro (Agenti & n8n)
            </button>
          </div>
        </div>

        {/* Barra di Avanzamento Dinamica */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">
                Avanzamento Missioni: {completedCount} di {missions.length} completate
              </span>
              <span className="text-cyan-400 font-mono font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase">Media Voti</span>
              <strong className="text-sm font-mono font-bold text-amber-400">
                {averageScore > 0 ? `${averageScore}/100` : '—'}
              </strong>
            </div>

            {certificate && (
              <button
                onClick={() => setShowCertModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Vedi Attestato</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista Missioni Didattiche */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs">Caricamento della tua area compiti sicura...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((m) => {
            const isExpanded = expandedMissionId === m.missionId
            const isDone = m.status === 'completed'
            const currentSub = submissions[m.missionId] || ''
            const feedback = feedbackMap[m.missionId] || m.miraFeedback

            return (
              <div
                key={m.id}
                className={`rounded-3xl border transition-all overflow-hidden ${
                  isDone
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : isExpanded
                    ? 'bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header della Card Missione */}
                <div
                  onClick={() => setExpandedMissionId(isExpanded ? null : m.missionId)}
                  className="p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : m.status === 'in_progress'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : m.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{m.missionTitle}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">{m.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {m.score !== null && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold">
                        ★ {m.score}/100
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : m.status === 'in_progress'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isDone ? 'Superata' : m.status === 'in_progress' ? 'Da Perfezionare' : 'Da Fare'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Contenuto Espanso con Editor di Consegna e Valutazione */}
                {isExpanded && (
                  <div className="px-4 pb-5 md:px-6 md:pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                    {/* Obiettivo e Risultato atteso */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                      <div className="text-slate-300 leading-relaxed">
                        <strong className="text-cyan-400 uppercase tracking-wide text-[10px] block mb-0.5">
                          Istruzioni dell&apos;Esercizio
                        </strong>
                        {m.description}
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                        <strong className="text-slate-300">Cosa cerca Mira: </strong>
                        {m.expectedOutcome}
                      </div>
                    </div>

                    {/* Area di testo per la consegna */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>La tua Risposta / Codice / Prompt:</span>
                        <span className="text-[11px] text-slate-500 font-normal">
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
                        className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed resize-y"
                      />
                    </div>

                    {/* Feedback Didattico di Mira se presente */}
                    {feedback && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/20 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-3.5 h-3.5" /> Correzione di Mira Tutor
                          </span>
                          {feedback.score !== undefined && (
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              Punteggio: {feedback.score}/100
                            </span>
                          )}
                        </div>

                        {feedback.comment && (
                          <p className="text-slate-300 text-xs leading-relaxed italic">
                            &ldquo;{feedback.comment}&rdquo;
                          </p>
                        )}

                        {feedback.strengths && feedback.strengths.length > 0 && (
                          <div className="space-y-1">
                            <strong className="text-[11px] text-emerald-400 uppercase tracking-wide">
                              Punti di Forza:
                            </strong>
                            <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                              {feedback.strengths.map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.improvements && feedback.improvements.length > 0 && (
                          <div className="space-y-1">
                            <strong className="text-[11px] text-amber-400 uppercase tracking-wide">
                              Da Perfezionare:
                            </strong>
                            <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                              {feedback.improvements.map((imp: string, idx: number) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pulsante Invio Compito */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {isDone ? '✨ Puoi inviare una versione migliorata quando vuoi.' : '⚡ Valutazione istantanea con AI.'}
                      </span>
                      <button
                        onClick={() => handleSubmitMission(m.missionId)}
                        disabled={isSubmitting === m.missionId || !currentSub.trim() || currentSub.length < 15}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
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
