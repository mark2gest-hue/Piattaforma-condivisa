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
} from 'lucide-react'
import { AI_PROVIDERS, AIProviderId } from '@/lib/agent-engine/multi-provider'
import { askOttoFriendlyAction, OttoFriendlyMode } from '@/app/actions/agent-workshop'
import { StudentTasksZone } from './components/StudentTasksZone'
import { SimulatorModal } from './components/SimulatorModal'

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
    'Ciao! Sono Mira 👩‍💻. Chiedimi un compito con la voce o con i tasti qui sotto: lo costruirò in diretta per te!'
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
<div style="background: linear-gradient(135deg, #090d16, #1e293b); padding: 24px; border-radius: 20px; color: white; text-align: center; font-family: sans-serif; border: 1px solid #38bdf8;">
  <span style="font-size: 38px;">⏱️</span>
  <h3 style="font-size: 22px; font-weight: bold; margin: 8px 0; color: #38bdf8;">Quante ore perdi a settimana?</h3>
  <div style="display: flex; justify-content: center; gap: 10px; margin: 16px 0;">
    <button onclick="alert('Con un agente AI risparmi circa 5 ore a settimana! 🎉')" style="background: #0284c7; color: white; border: none; padding: 12px 18px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">5 Ore</button>
    <button onclick="alert('Con un agente AI risparmi oltre 15 ore a settimana! 🚀')" style="background: #0284c7; color: white; border: none; padding: 12px 18px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">15 Ore</button>
    <button onclick="alert('Con flussi n8n e agenti autonomi trasformi il tuo lavoro! 🤖')" style="background: #6366f1; color: white; border: none; padding: 12px 18px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">20+ Ore</button>
  </div>
  <p style="font-size: 13px; color: #94a3b8; margin: 0;">✨ Generato dall'Agente in tempo reale</p>
</div>
    `.trim(),
  })

  // 4 Pillole rapide ad altissima leggibilità
  const QUICK_PROMPTS = [
    {
      label: '🟣 Workflow n8n (Obsidian)',
      prompt: 'Trovami nel Vault Obsidian il workflow che abbiamo fatto per un progetto su n8n.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: '⏱️ Timer da Cucina',
      prompt: 'Costruisci un timer per la pasta con pulsanti Avvia e Reset che contano i secondi all\'indietro.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: '💰 Calcola Preventivo',
      prompt: 'Costruisci un calcolatore per selezionare Sito Web o Automazione AI con il totale euro immediato.',
      targetMode: 'build' as OttoFriendlyMode,
    },
    {
      label: '📊 Estrai Dati Excel',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* Sfondo cinema */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[350px] bg-purple-500/15 rounded-full blur-[140px]" />
      </div>

      {/* HEADER PRINCIPALE */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 md:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👩‍💻</span>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Mira <span className="text-amber-400 font-medium text-xs">• L&apos;Agente per la Gente</span>
              </h1>
              <p className="text-[11px] text-slate-400">Laboratorio Didattico Interattivo & Formazione Live</p>
            </div>
          </div>

          {/* Navigazione Tab Principali (Laboratorio Live vs Zona Compiti) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveMainTab('workshop')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMainTab === 'workshop'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Laboratorio Live</span>
            </button>
            <button
              onClick={() => setActiveMainTab('tasks')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMainTab === 'tasks'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Zona Compiti & Attestato</span>
            </button>
            <button
              onClick={() => setShowSimulator(true)}
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all cursor-pointer border border-purple-500/30"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Simula Ruoli</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Selettore AI super compatto */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
              {(Object.keys(AI_PROVIDERS) as AIProviderId[]).map((pId) => {
                const active = provider === pId
                return (
                  <button
                    key={pId}
                    onClick={() => setProvider(pId)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      active ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {AI_PROVIDERS[pId].name.split(' ')[0]}
                  </button>
                )
              })}
            </div>

            {/* Voce On/Off */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled)
                if (voiceEnabled && typeof window !== 'undefined') window.speechSynthesis.cancel()
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={voiceEnabled ? 'Disattiva voce di Mira' : 'Attiva voce di Mira'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {activeMainTab === 'tasks' ? (
          /* TAB 2: ZONA COMPITI PERSONALE DELLO STUDENTE */
          <StudentTasksZone provider={provider} initialTier="ai-start" />
        ) : (
          /* TAB 1: IL LABORATORIO LIVE ORIGINALE POTENZIATO */
          <>
            {/* ZONA 1: MIRA L'AVATAR & CONTROLLO MODALITÀ DIDATTICHE */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Reattivo */}
                <div className="relative shrink-0">
                  <div
                    className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl select-none transition-all duration-300 shadow-2xl ${
                      mood === 'listening'
                        ? 'border-rose-500 bg-rose-500/20 shadow-rose-500/30 scale-105 animate-pulse'
                        : mood === 'thinking'
                        ? 'border-amber-400 bg-amber-400/20 shadow-amber-400/30 animate-spin'
                        : mood === 'building'
                        ? 'border-cyan-400 bg-cyan-400/20 shadow-cyan-400/30 animate-bounce'
                        : mood === 'talking'
                        ? 'border-emerald-400 bg-emerald-400/20 shadow-emerald-400/30 scale-105'
                        : 'border-slate-800 bg-slate-950 shadow-black'
                    }`}
                  >
                    {mood === 'listening'
                      ? '👂'
                      : mood === 'thinking'
                      ? '🧠'
                      : mood === 'building'
                      ? '⚡'
                      : mood === 'talking'
                      ? '🗣️'
                      : mood === 'happy'
                      ? '🤩'
                      : '👩‍💻'}
                  </div>

                  {/* Pulsante Microfono Rapido */}
                  <button
                    onClick={toggleMic}
                    className={`absolute -bottom-2 -right-2 p-3 rounded-full border-2 shadow-lg transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 border-white text-white animate-pulse'
                        : 'bg-amber-400 border-amber-300 text-slate-950 hover:scale-110'
                    }`}
                    title="Parla con Mira (Microfono)"
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>

                {/* Fumetto Parlante & Controlli */}
                <div className="flex-1 w-full space-y-4">
                  {/* Selettore Modalità Didattiche (6 Modalità Rapide) */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold">
                    <button
                      onClick={() => setMode('build')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'build' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Costruisci</span>
                    </button>
                    <button
                      onClick={() => setMode('chat')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'chat' ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chiacchiera</span>
                    </button>
                    <button
                      onClick={() => setMode('tutor')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'tutor' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Tutor Guidato</span>
                    </button>
                    <button
                      onClick={() => setMode('coach')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'coach' ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mira non dà la risposta subito: ti guida con domande socratiche!"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Coach Socrate</span>
                    </button>
                    <button
                      onClick={() => setMode('quiz')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'quiz' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>❓ Quiz</span>
                    </button>
                    <button
                      onClick={() => setMode('reviewer')}
                      className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                        mode === 'reviewer' ? 'bg-rose-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🔍 Revisore</span>
                    </button>
                  </div>

                  {/* Fumetto con Voce di Mira */}
                  <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm md:text-base leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 text-lg">💬</span>
                      <p className="flex-1 font-medium">{agentSpeech}</p>
                    </div>
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
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => handleUserSubmit()}
                      disabled={isPending || !inputText.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Invia</span>
                    </button>
                  </div>

                  {/* 4 Pillole Rapide */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_PROMPTS.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUserSubmit(qp.prompt, qp.targetMode)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ZONA 2: IL BANCO DI LAVORO (WIDGET INTERATTIVO & CODICE FORMATAZZATO) */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-extrabold text-white">
                    Banco di Lavoro • <span className="text-cyan-400">{artifact.title}</span>
                  </h2>
                </div>

                <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeTab === 'preview' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Testa Live</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      activeTab === 'code' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Codice</span>
                  </button>
                </div>
              </div>

              {/* Area Widget Interattivo */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden shadow-2xl">
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
      background: #0f172a;
      color: white;
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
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-400 font-semibold">
                        HTML / JS ({formattedCodeLines.length} righe)
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiato!</span>
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
                    <div className="p-3 bg-slate-950 font-mono text-xs overflow-y-auto overflow-x-auto select-text divide-y divide-slate-900/40">
                      {formattedCodeLines.map((line, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="flex items-center gap-3 py-0.5 px-1 hover:bg-slate-900/60 rounded transition-colors group"
                        >
                          <span className="text-slate-600 group-hover:text-slate-400 select-none w-8 text-right shrink-0 text-[11px] font-semibold">
                            {lineIdx + 1}
                          </span>
                          <span className="text-cyan-300 whitespace-pre font-mono">
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ZONA 3: LA BUSSOLA ARCHITETTURALE (8 BLOCCHI PER COSTRUIRE AGENTI VERI) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  L&apos;Architettura dell&apos;Agente in 8 Blocchi Visivi
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">🎯</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">1. Ruolo</strong>
                  <span className="text-[11px] text-slate-400">Chi è? (es. Contabile)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">🏆</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">2. Obiettivo</strong>
                  <span className="text-[11px] text-slate-400">Cosa risolve?</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">📥</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">3. Input</strong>
                  <span className="text-[11px] text-slate-400">Cosa riceve? (Dati, File)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">🧠</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">4. Memoria</strong>
                  <span className="text-[11px] text-slate-400">Cosa ricorda? (Contesto)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">⚡</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">5. Tool</strong>
                  <span className="text-[11px] text-slate-400">Cosa usa? (n8n, API)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">⚖️</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">6. Regole</strong>
                  <span className="text-[11px] text-slate-400">Come decide? (IF/THEN)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">📤</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">7. Output</strong>
                  <span className="text-[11px] text-slate-400">Cosa consegna? (JSON/Azione)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors">
                  <span className="text-xl block mb-1">🧪</span>
                  <strong className="text-xs text-white block uppercase tracking-wide">8. Test</strong>
                  <span className="text-[11px] text-slate-400">Come si valida?</span>
                </div>
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
