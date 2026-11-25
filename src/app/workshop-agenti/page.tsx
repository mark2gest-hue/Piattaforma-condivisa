'use client'

import React, { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Hammer,
  Eye,
  RefreshCw,
  Code2,
  MessageCircle,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  CheckCircle2,
  ArrowLeft,
  Bot,
  HelpCircle,
  Search,
  Cpu,
} from 'lucide-react'
import Link from 'next/link'
import { AI_PROVIDERS, AIProviderId } from '@/lib/agent-engine/multi-provider'
import { askOttoFriendlyAction, OttoFriendlyMode } from '@/app/actions/agent-workshop'
import { StudentTasksZone } from './components/StudentTasksZone'
import { SimulatorModal } from './components/SimulatorModal'
import { BarVisualizer, AgentState } from '@/components/ui/elevenlabs/bar-visualizer'

type AvatarMood = 'idle' | 'listening' | 'thinking' | 'talking' | 'building' | 'happy'

interface CraftedArtifact {
  title: string
  htmlSnippet: string
}

function formatHtmlToCodeLines(rawHtml: string): string[] {
  if (!rawHtml) return []

  let clean = rawHtml.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  clean = clean.replace(/>\s*</g, '>\n<')

  const lines: string[] = []
  const rawTokens = clean.split('\n')
  let indentLevel = 0

  for (const rawLine of rawTokens) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    const isHtmlTag = trimmed.startsWith('<')
    if (!isHtmlTag && (trimmed.includes(';') || trimmed.includes('{') || trimmed.includes('}'))) {
      const subLines = trimmed
        .replace(/;\s*/g, ';\n')
        .replace(/\{\s*/g, '{\n')
        .replace(/\}\s*/g, '\n}\n')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const sub of subLines) {
        if (sub.startsWith('}') || sub.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        lines.push('  '.repeat(indentLevel) + sub)
        if (
          sub.endsWith('{') ||
          (sub.startsWith('<') &&
            !sub.startsWith('</') &&
            !sub.endsWith('/>') &&
            !sub.match(/<(input|img|br|hr|meta)\b/i) &&
            !sub.includes('</'))
        ) {
          indentLevel++
        }
      }
      continue
    }

    if (trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    lines.push('  '.repeat(indentLevel) + trimmed)

    const isSelfContained = /<([a-zA-Z0-9]+)[^>]*>.*<\/\1>/.test(trimmed)
    const isOpeningTag =
      trimmed.startsWith('<') &&
      !trimmed.startsWith('</') &&
      !trimmed.startsWith('<!') &&
      !trimmed.endsWith('/>') &&
      !trimmed.match(/<(input|img|br|hr|meta|link)\b/i) &&
      !isSelfContained

    if (isOpeningTag) {
      indentLevel++
    }
  }

  return lines.length > 0 ? lines : [rawHtml]
}

export default function WorkshopAgentiAmichevolePage() {
  const [activeMainTab, setActiveMainTab] = useState<'workshop' | 'tasks'>('workshop')
  const [provider, setProvider] = useState<AIProviderId>('gemini')
  const [mode, setMode] = useState<OttoFriendlyMode>('build')
  const [mood, setMood] = useState<AvatarMood>('idle')
  const [inputText, setInputText] = useState('')
  const [agentSpeech, setAgentSpeech] = useState<string>(
    'Ciao! Sono Mira. Chiedimi un compito con la voce o con i tasti qui sotto: lo costruirò in diretta per te!'
  )
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Progetto attualmente mostrato nel banco di lavoro
  const [artifact, setArtifact] = useState<CraftedArtifact>({
    title: 'Calcolatore Ore Risparmiate',
    htmlSnippet: `
<div style="background: #111114; padding: 24px; border-radius: 10px; color: #f4f4f5; text-align: center; font-family: sans-serif; border: 1px solid rgba(255,255,255,0.12);">
  <h3 style="font-size: 20px; font-weight: 600; margin: 4px 0 8px; color: #f4f4f5;">Quante ore perdi a settimana?</h3>
  <div style="display: flex; justify-content: center; gap: 10px; margin: 16px 0;">
    <button onclick="alert('Con un agente AI risparmi circa 5 ore a settimana!')" style="background: #f4f4f5; color: #0d0d0f; border: none; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">5 Ore</button>
    <button onclick="alert('Con un agente AI risparmi oltre 15 ore a settimana!')" style="background: #f4f4f5; color: #0d0d0f; border: none; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">15 Ore</button>
    <button onclick="alert('Con flussi n8n e agenti autonomi trasformi il tuo lavoro!')" style="background: #6366f1; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">20+ Ore</button>
  </div>
  <p style="font-size: 12px; color: #a1a1aa; margin: 0;">Generato dall'Agente in tempo reale</p>
</div>
    `.trim(),
  })

  // 4 Pillole rapide ad altissima leggibilità
  const QUICK_PROMPTS = [
    {
      label: 'Workflow n8n (Obsidian)',
      prompt: 'Trovami nel Vault Obsidian il workflow che abbiamo fatto per un progetto su n8n.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: 'Timer da Cucina',
      prompt: 'Costruisci un timer per la pasta con pulsanti Avvia e Reset che contano i secondi all\'indietro.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: 'Calcola Preventivo',
      prompt: 'Costruisci un calcolatore per selezionare Sito Web o Automazione AI con il totale euro immediato.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: 'Estrai Dati Excel',
      prompt: 'Crea un tool per estrarre e ripulire dati grezzi da Excel e organizzarli in tabella pronta per il database.',
      targetMode: 'build' as OttoFriendlyMode,
    },
  ]

  // Riconoscimento Vocale (Web Speech API)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'it-IT'

      rec.onstart = () => {
        setIsListening(true)
        setMood('listening')
      }

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript
        setInputText(transcript)
        rec.stop()
        setIsListening(false)
        handleUserSubmit(transcript)
      }

      rec.onerror = () => {
        setIsListening(false)
        setMood('idle')
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [mode, provider])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Riconoscimento vocale non supportato da questo browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setMood('idle')
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.warn('Mic start err:', err)
      }
    }
  }

  // Sintesi Vocale (Text-To-Speech)
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'it-IT'
    utterance.rate = 1.05
    utterance.pitch = 1.1

    const voices = window.speechSynthesis.getVoices()
    const italianVoice =
      voices.find((v) => v.lang.includes('it') && (v.name.includes('Elsa') || v.name.includes('Alice') || v.name.includes('Federica'))) ||
      voices.find((v) => v.lang.includes('it'))

    if (italianVoice) utterance.voice = italianVoice

    utterance.onstart = () => setMood('talking')
    utterance.onend = () => setMood('idle')
    utterance.onerror = () => setMood('idle')

    window.speechSynthesis.speak(utterance)
  }

  // Invio Richiesta
  const handleUserSubmit = (overridePrompt?: string, explicitMode?: OttoFriendlyMode) => {
    const p = overridePrompt || inputText
    const currentMode = explicitMode || mode
    if (!p.trim() || isPending) return

    setMood(currentMode === 'build' ? 'building' : 'thinking')
    setInputText('')

    startTransition(async () => {
      try {
        const res = await askOttoFriendlyAction({
          provider,
          mode: currentMode,
          prompt: p,
        })

        setMood('happy')
        setAgentSpeech(res.speech)
        speakText(res.speech)

        if (res.htmlSnippet && currentMode === 'build') {
          setArtifact({
            title: res.title || p,
            htmlSnippet: res.htmlSnippet,
          })
          setActiveTab('preview')
        }
      } catch (err) {
        setMood('idle')
        setAgentSpeech('Piccolo intoppo di rete, riprova!')
      }
    })
  }

  const formattedCodeLines = useMemo(
    () => formatHtmlToCodeLines(artifact.htmlSnippet),
    [artifact.htmlSnippet]
  )

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formattedCodeLines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* COMMAND BAR PRINCIPALE — Swiss Hairline */}
      <header className="min-h-[52px] border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] px-5 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/lavori"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f7f6f3] dark:bg-[#141417] hover:bg-[#e5e3dc]/60 dark:hover:bg-white/[0.05] text-zinc-600 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] border border-[#e5e3dc] dark:border-white/[0.08] transition-colors cursor-pointer shrink-0"
              title="Torna alla Dashboard / Area Admin"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>

            <div className="h-4 w-px bg-[#e5e3dc] dark:bg-white/[0.08] hidden sm:block" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-md bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#6366f1] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-[#111113] dark:text-[#f4f4f5] tracking-tight flex items-center gap-2 font-[family-name:var(--font-jakarta)] truncate">
                  <span>Mira</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-normal text-xs">· Squadra Agenti AI</span>
                </h1>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  Laboratorio Didattico Interattivo & Formazione Live
                </p>
              </div>
            </div>
          </div>

          {/* Tab Principali (Laboratorio Live vs Zona Compiti) + Simula Ruoli */}
          <div className="flex items-center gap-1 text-xs font-medium overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveMainTab('workshop')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                activeMainTab === 'workshop'
                  ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                  : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Laboratorio Live</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('tasks')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                activeMainTab === 'tasks'
                  ? 'bg-[#111113] text-white border-[#111113] dark:bg-[#f4f4f5] dark:text-[#0d0d0f] dark:border-[#f4f4f5]'
                  : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Zona Compiti & Attestato</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSimulator(true)}
              className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors cursor-pointer border border-[#6366f1]/30 shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Simula Ruoli</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Selettore AI */}
            <div className="flex items-center gap-0.5 bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] p-0.5 rounded-md text-xs font-medium">
              {(Object.keys(AI_PROVIDERS) as AIProviderId[]).map((pId) => {
                const active = provider === pId
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => setProvider(pId)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                    }`}
                  >
                    {AI_PROVIDERS[pId].name.split(' ')[0]}
                  </button>
                )
              })}
            </div>

            {/* Voce On/Off */}
            <button
              type="button"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled)
                if (voiceEnabled && typeof window !== 'undefined') window.speechSynthesis.cancel()
              }}
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]'
                  : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-400'
              }`}
              title={voiceEnabled ? 'Disattiva voce di Mira' : 'Attiva voce di Mira'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 py-6 space-y-6">
        {activeMainTab === 'tasks' ? (
          /* TAB 2: ZONA COMPITI PERSONALE DELLO STUDENTE */
          <StudentTasksZone provider={provider} initialTier="ai-start" />
        ) : (
          /* TAB 1: LABORATORIO LIVE */
          <>
            {/* ZONA 1: MIRA & CONTROLLO MODALITÀ DIDATTICHE */}
            <section className="bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg overflow-hidden">
              <div className="p-5 md:p-6 flex flex-col md:flex-row items-start gap-6">
                {/* Stato & Microfono */}
                <div className="relative shrink-0 flex flex-row md:flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border flex flex-col items-center justify-center gap-1 select-none transition-colors ${
                      mood === 'listening'
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                        : mood === 'thinking'
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                        : mood === 'building'
                        ? 'border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]'
                        : mood === 'talking'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500'
                        : 'border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5]'
                    }`}
                  >
                    {mood === 'listening' ? (
                      <Mic className="w-6 h-6" />
                    ) : mood === 'thinking' ? (
                      <Cpu className="w-6 h-6" />
                    ) : mood === 'building' ? (
                      <Hammer className="w-6 h-6" />
                    ) : mood === 'talking' ? (
                      <Volume2 className="w-6 h-6" />
                    ) : mood === 'happy' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Bot className="w-6 h-6 text-[#6366f1]" />
                    )}
                    <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase tracking-wider opacity-80">
                      {mood}
                    </span>
                  </div>

                  {/* Pulsante Microfono Rapido */}
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-[#f7f6f3] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] hover:border-[#6366f1]'
                    }`}
                    title="Parla con Mira (Microfono)"
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#6366f1]" />}
                    <span className="text-[11px]">{isListening ? 'Stop' : 'Voce'}</span>
                  </button>
                </div>

                {/* Fumetto Parlante & Controlli */}
                <div className="flex-1 w-full space-y-4 min-w-0">
                  {/* Selettore Modalità Didattiche (6 Modalità Rapide) */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setMode('build')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'build'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Costruisci</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('chat')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'chat'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chiacchiera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('tutor')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'tutor'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Tutor Guidato</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('coach')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'coach'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                      title="Mira non dà la risposta subito: ti guida con domande socratiche!"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Coach Socrate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('quiz')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'quiz'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Quiz</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('reviewer')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        mode === 'reviewer'
                          ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Revisore</span>
                    </button>
                  </div>

                  {/* Risposta Vocale / Testo di Mira */}
                  <div className="p-4 rounded-md bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-zinc-200 text-sm leading-relaxed space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#6366f1] mt-1 shrink-0" />
                      <p className="flex-1">{agentSpeech}</p>
                    </div>

                    {/* Visualizzatore Vocale ElevenLabs UI */}
                    {(mood === 'talking' || mood === 'listening' || mood === 'thinking' || mood === 'building') && (
                      <div className="pt-2.5 border-t border-[#e5e3dc] dark:border-white/[0.08] flex items-center gap-3">
                        <span className="text-[11px] font-[family-name:var(--font-mono)] tracking-wider uppercase text-[#6366f1] font-medium shrink-0 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                          {mood === 'talking'
                            ? 'Mira sta parlando...'
                            : mood === 'listening'
                            ? 'In ascolto...'
                            : mood === 'building'
                            ? 'Costruzione in corso...'
                            : 'Elaborazione...'}
                        </span>
                        <div className="flex-1 max-w-[280px]">
                          <BarVisualizer
                            state={
                              mood === 'talking'
                                ? 'speaking'
                                : mood === 'listening'
                                ? 'listening'
                                : 'thinking'
                            }
                            demo={true}
                            barCount={18}
                            minHeight={15}
                            maxHeight={95}
                            centerAlign={true}
                            className="h-7 bg-transparent p-0 gap-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input con Invio Diretto */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
                      placeholder={
                        mode === 'build'
                          ? 'Es: "Costruisci un calcolatore per le ore perse con pulsanti interattivi"...'
                          : mode === 'coach'
                          ? 'Es: "Vorrei fare un agente che manda email, aiutami a pensarlo"...'
                          : 'Scrivi qualsiasi domanda o compito per Mira...'
                      }
                      className="flex-1 h-9 px-3.5 rounded-md bg-[#ffffff] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] text-xs sm:text-sm text-[#111113] dark:text-[#f4f4f5] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                    />
                    <button
                      type="button"
                      onClick={() => handleUserSubmit()}
                      disabled={isPending || !inputText.trim()}
                      className="px-4 h-9 rounded-md bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] disabled:opacity-40 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Invia</span>
                    </button>
                  </div>

                  {/* 4 Pillole Rapide */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUserSubmit(qp.prompt, qp.targetMode)}
                        className="px-2.5 py-1 rounded-md bg-[#f7f6f3] dark:bg-[#141417] hover:border-[#6366f1]/40 border border-[#e5e3dc] dark:border-white/[0.08] text-xs text-zinc-700 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ZONA 2: BANCO DI LAVORO (WIDGET INTERATTIVO & CODICE FORMATTATO) */}
            <section className="bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Hammer className="w-4 h-4 text-[#6366f1] shrink-0" />
                  <h2 className="text-sm font-semibold text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)] truncate">
                    Banco di Lavoro · <span className="text-[#6366f1]">{artifact.title}</span>
                  </h2>
                </div>

                <div className="flex items-center p-0.5 bg-[#ffffff] dark:bg-[#0d0d0f] border border-[#e5e3dc] dark:border-white/[0.08] rounded-md text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Testa Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'code'
                        ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Codice</span>
                  </button>
                </div>
              </div>

              {/* Area Widget Interattivo */}
              <div className="bg-[#f7f6f3]/50 dark:bg-[#0d0d0f] overflow-hidden">
                {activeTab === 'preview' ? (
                  <iframe
                    title="Widget Anteprima"
                    srcDoc={`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #0d0d0f;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 220px;
    }
  </style>
</head>
<body>
  ${artifact.htmlSnippet}
</body>
</html>
                    `}
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-[260px] border-none block"
                  />
                ) : (
                  <div className="flex flex-col max-h-[340px]">
                    {/* Header bar del codice */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#f7f6f3] dark:bg-[#141417] border-b border-[#e5e3dc] dark:border-white/[0.08] text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="font-[family-name:var(--font-mono)] text-[#6366f1] font-medium">
                        HTML / JS ({formattedCodeLines.length} righe)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] text-zinc-700 dark:text-zinc-300 hover:text-[#111113] dark:hover:text-[#f4f4f5] transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copiato</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copia</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Righe verticali formattate stile editor */}
                    <div className="p-3 bg-[#0d0d0f] font-[family-name:var(--font-mono)] text-xs overflow-y-auto overflow-x-auto select-text divide-y divide-white/[0.04]">
                      {formattedCodeLines.map((line, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="flex items-center gap-3 py-0.5 px-1 hover:bg-white/[0.03] rounded transition-colors group"
                        >
                          <span className="text-zinc-600 group-hover:text-zinc-400 select-none w-8 text-right shrink-0 text-[11px]">
                            {lineIdx + 1}
                          </span>
                          <span className="text-zinc-200 whitespace-pre">
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ZONA 3: ARCHITETTURA DELL'AGENTE IN 8 BLOCCHI — Swiss Hairline Grid */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <Compass className="w-4 h-4 text-[#6366f1]" />
                <h3 className="text-[11px] font-[family-name:var(--font-mono)] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  L&apos;Architettura dell&apos;Agente in 8 Blocchi
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e5e3dc] dark:bg-white/[0.08] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg overflow-hidden">
                {[
                  { num: '01', title: 'Ruolo', desc: 'Chi è? (es. Contabile)' },
                  { num: '02', title: 'Obiettivo', desc: 'Cosa risolve?' },
                  { num: '03', title: 'Input', desc: 'Cosa riceve? (Dati, File)' },
                  { num: '04', title: 'Memoria', desc: 'Cosa ricorda? (Contesto)' },
                  { num: '05', title: 'Tool', desc: 'Cosa usa? (n8n, API)' },
                  { num: '06', title: 'Regole', desc: 'Come decide? (IF/THEN)' },
                  { num: '07', title: 'Output', desc: 'Cosa consegna? (JSON/Azione)' },
                  { num: '08', title: 'Test', desc: 'Come si valida?' },
                ].map((block) => (
                  <div
                    key={block.num}
                    className="p-4 bg-[#ffffff] dark:bg-[#111114] hover:bg-[#f7f6f3] dark:hover:bg-[#141417] transition-colors"
                  >
                    <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#6366f1] block mb-1">
                      {block.num}
                    </span>
                    <strong className="text-xs font-semibold text-[#111113] dark:text-[#f4f4f5] block uppercase tracking-wide font-[family-name:var(--font-jakarta)]">
                      {block.title}
                    </strong>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{block.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* MODALE SIMULATORE DI RUOLO */}
      {showSimulator && (
        <SimulatorModal provider={provider} onClose={() => setShowSimulator(false)} />
      )}
    </div>
  )
}
