'use client'

import { useState } from 'react'
import {
  Bot,
  Sparkles,
  Mail,
  KanbanSquare,
  FileText,
  Send,
  PlusCircle,
  Copy,
  Check,
  Loader2,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { playNotificationSound } from '@/lib/notifications'
import { sendSharedEmail } from '../posta/actions'
import {
  generateEmailDraftAction,
  generateKanbanTasksAction,
  generateSummaryAction,
} from '@/app/actions/ai'

export default function AgentiAIPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'kanban' | 'summary'>('email')

  // State Agente Bozze Email
  const [emailPrompt, setEmailPrompt] = useState('')
  const [emailTone, setEmailTone] = useState<'professional' | 'commercial' | 'support' | 'courteous'>('professional')
  const [emailRecipient, setEmailRecipient] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [isSendingGeneratedEmail, setIsSendingGeneratedEmail] = useState(false)
  const [copied, setCopied] = useState(false)

  // State Agente Task Kanban
  const [kanbanGoalPrompt, setKanbanGoalPrompt] = useState('')
  const [generatedTasks, setGeneratedTasks] = useState<Array<{ title: string; desc: string; priority: 'medium' | 'high' | 'urgent' }>>([])
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [isSavingTasks, setIsSavingTasks] = useState(false)

  // State Agente Sintetizzatore
  const [summaryInput, setSummaryInput] = useState('')
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const supabase = createClient()

  // 1. Generatore Bozze Email AI
  const handleGenerateEmail = async () => {
    if (!emailPrompt.trim() || isGeneratingEmail) return
    setIsGeneratingEmail(true)
    setGeneratedEmail(null)

    try {
      const res = await generateEmailDraftAction({
        prompt: emailPrompt.trim(),
        tone: emailTone,
        recipient: emailRecipient.trim() || undefined,
      })

      if (res.success && res.subject && res.body) {
        setGeneratedEmail({ subject: res.subject, body: res.body })
        playNotificationSound('chat')
      } else {
        alert(`Errore generazione: ${res.error || 'Impossibile creare bozza.'}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleSendGeneratedEmail = async () => {
    if (!generatedEmail || !emailRecipient.trim()) return
    setIsSendingGeneratedEmail(true)

    const result = await sendSharedEmail({
      to: emailRecipient.trim(),
      subject: generatedEmail.subject,
      body: generatedEmail.body,
    })

    if (result.success) {
      alert(`Email inviata con successo via Resend a ${emailRecipient}!`)
    } else {
      alert(`Errore invio email: ${result.error}`)
    }
    setIsSendingGeneratedEmail(false)
  }

  // 2. Generatore Task Kanban AI
  const handleGenerateTasks = async () => {
    if (!kanbanGoalPrompt.trim() || isGeneratingTasks) return
    setIsGeneratingTasks(true)
    setGeneratedTasks([])

    try {
      const res = await generateKanbanTasksAction({
        goalPrompt: kanbanGoalPrompt.trim(),
      })

      if (res.success && res.tasks) {
        setGeneratedTasks(res.tasks)
        playNotificationSound('chat')
      } else {
        alert(`Errore scomposizione: ${res.error || 'Impossibile generare task.'}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const handleSaveTasksToKanban = async () => {
    if (generatedTasks.length === 0) return
    setIsSavingTasks(true)

    const { data: userData } = await supabase.auth.getUser()

    for (const task of generatedTasks) {
      await (supabase as any).from('tasks').insert({
        title: task.title,
        description: task.desc,
        status: 'todo',
        priority: task.priority,
        created_by: userData.user?.id || null,
      })
    }

    alert(`Tutti i ${generatedTasks.length} task generati dall'AI sono stati inseriti nel Kanban!`)
    setIsSavingTasks(false)
    setGeneratedTasks([])
    setKanbanGoalPrompt('')
  }

  // 3. Generatore Sintesi Conversazioni AI
  const handleGenerateSummary = async () => {
    if (!summaryInput.trim() || isGeneratingSummary) return
    setIsGeneratingSummary(true)
    setGeneratedSummary(null)

    try {
      const res = await generateSummaryAction({
        text: summaryInput.trim(),
      })

      if (res.success && res.summary) {
        setGeneratedSummary(res.summary)
        playNotificationSound('chat')
      } else {
        alert(`Errore sintesi: ${res.error || 'Impossibile generare riepilogo.'}`)
      }
    } catch (err: any) {
      alert(`Errore di rete: ${err.message}`)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Hub Agenti AI & Automazioni
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assistenti intelligenti integrati per velocizzare le operazioni di team, email e Kanban.
          </p>
        </div>

        <Badge variant="purple" className="py-1 px-3 flex items-center gap-1.5 w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          IA Generativa Integrata
        </Badge>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'email'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Generatore Bozze Email</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'kanban'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KanbanSquare className="h-4 w-4" />
          <span>Scompositore Obiettivi in Task</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'summary'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Sintetizzatore Conversazioni</span>
        </button>
      </div>

      {/* TAB 1: GENERATORE BOZZE EMAIL AI */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Istruzioni per la Redazione Email
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tono di Voce</label>
                <select
                  value={emailTone}
                  onChange={(e: any) => setEmailTone(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white"
                >
                  <option value="professional">Professionale & Formale</option>
                  <option value="commercial">Commerciale & Proposta VENDITE</option>
                  <option value="support">Supporto Tecnico & Risoluzione Problemi</option>
                  <option value="courteous">Cortese & Informativo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Oggetto o Sintesi del Messaggio *</label>
                <textarea
                  rows={5}
                  value={emailPrompt}
                  onChange={(e) => setEmailPrompt(e.target.value)}
                  placeholder="Es. Scrivi un'email di risposta a Cliente Alfa per confermare la data del corso di formazione ed allegare i dettagli..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <Button
                onClick={handleGenerateEmail}
                disabled={isGeneratingEmail || !emailPrompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 h-10 shadow-xs"
              >
                {isGeneratingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Elaborazione Agente AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Genera Bozza Email AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Anteprima ed Invio Email Generata */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Bozza Generata dall'AI</span>
                {generatedEmail && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${generatedEmail.subject}\n\n${generatedEmail.body}`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-semibold hover:underline"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copiato!' : 'Copia Testo'}
                  </button>
                )}
              </h3>

              {generatedEmail ? (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 font-semibold">Oggetto: </span>
                    <strong className="text-slate-900 dark:text-white font-bold">{generatedEmail.subject}</strong>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                    {generatedEmail.body}
                  </div>
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-6">
                  Inserisci le istruzioni a sinistra e clicca "Genera Bozza Email AI" per visualizzare il testo.
                </div>
              )}
            </div>

            {generatedEmail && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs mt-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Invia direttamente via Resend a:</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="Es. cliente@azienda.it"
                      className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <Button
                      onClick={handleSendGeneratedEmail}
                      disabled={isSendingGeneratedEmail || !emailRecipient.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 h-9"
                    >
                      {isSendingGeneratedEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Invia Email
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GENERATORE TASK KANBAN AI */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Scompositore Obiettivi Complessi in Task Kanban
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Descrivi l'obiettivo di progetto e l'Agente AI individuerà i singoli compiti operativi creando i task nel Kanban di Supabase.
            </p>

            <div className="space-y-3">
              <textarea
                rows={4}
                value={kanbanGoalPrompt}
                onChange={(e) => setKanbanGoalPrompt(e.target.value)}
                placeholder="Es. Dobbiamo lanciare il nuovo percorso di formazione ed il supporto clienti: preparare le slide del Modulo 1, sincronizzare il database Supabase ed inviare la newsletter..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <Button
                onClick={handleGenerateTasks}
                disabled={isGeneratingTasks || !kanbanGoalPrompt.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 shadow-xs"
              >
                {isGeneratingTasks ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisi Obiettivo in corso...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Scomponi in Task Kanban
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Risultato Task Generati */}
          {generatedTasks.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Compiti Individuati ({generatedTasks.length})
                </h4>

                <Button
                  onClick={handleSaveTasksToKanban}
                  disabled={isSavingTasks}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                >
                  {isSavingTasks ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-3.5 w-3.5" />
                  )}
                  Salva Tutti nel Kanban
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {generatedTasks.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                      <Badge
                        variant={t.priority === 'urgent' ? 'destructive' : t.priority === 'high' ? 'warning' : 'info'}
                        className="text-[9px] uppercase"
                      >
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SINTETIZZATORE CONVERSAZIONI AI */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Sintetizzatore Conversazioni ed Email
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Incolla uno o più messaggi ricevuti in Chat o via Email per generare un riassunto esecutivo istantaneo.
            </p>

            <textarea
              rows={6}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Incolla qui il testo da analizzare..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            <Button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary || !summaryInput.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-2 h-10 shadow-xs"
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sintesi in corso...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Genera Sintesi Esecutiva
                </>
              )}
            </Button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Risultato Analisi AI
            </h3>

            {generatedSummary ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                {generatedSummary}
              </div>
            ) : (
              <div className="h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-6">
                Incolla il testo a sinistra per generare la sintesi executive.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
