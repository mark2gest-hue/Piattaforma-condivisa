'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Download,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Brain,
  Send,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { publishToBufferAction } from '@/app/actions/marketing'
import { playNotificationSound } from '@/lib/notifications'

interface ReelVideoScene {
  time: string
  visual: string
  audioText: string
}

type AiVisualTheme = 'neural-network' | 'cyber-circuits' | 'quantum-mesh' | 'aurora-ai'

interface ReelVideoGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  hook?: string
  scenes?: ReelVideoScene[]
  cta?: string
  brandName?: string
  captionText?: string
}

// Coordinate fisse dei nodi neurali per animazione fluida
const NEURAL_NODES = Array.from({ length: 32 }).map((_, i) => ({
  baseX: 80 + (i % 6) * 175 + ((i * 37) % 60),
  baseY: 100 + Math.floor(i / 6) * 310 + ((i * 53) % 80),
  speedX: 0.8 + ((i * 13) % 10) * 0.15,
  speedY: 0.6 + ((i * 17) % 10) * 0.15,
  phase: i * 0.45,
  radius: 4 + (i % 3) * 2.5,
}))

export function ReelVideoGeneratorModal({
  isOpen,
  onClose,
  title = "Pensi di essere in ritardo con l'AI? Guarda questo.",
  hook = "Se hai più di 40 anni e pensi che l'AI sia solo per ventenni programmatori... fermati un secondo.",
  scenes = [
    {
      time: '0:00 - 0:06',
      visual: 'Inquadratura primo piano, espressione accogliente. Testo a schermo: "NON SEI IN RITARDO"',
      audioText: "Se pensi di essere arrivato troppo tardi per capire l'Intelligenza Artificiale... ascolta bene questa cosa.",
    },
    {
      time: '0:06 - 0:18',
      visual: 'Stacco: mostra una schermata semplice con 3 righe scritte in italiano su ChatGPT.',
      audioText: "Non devi imparare a scrivere codice. L'AI di oggi capisce l'italiano semplice. Se sai spiegare cosa ti serve a un collaboratore, sai già usare l'AI.",
    },
    {
      time: '0:18 - 0:30',
      visual: 'Ritorno in camera, mostra il portale del corso AI Start su tablet o smartphone.',
      audioText: "Nel nostro corso AI Start ti guidiamo passo passo da zero, senza gergo e con esempi del tuo lavoro quotidiano.",
    },
  ],
  cta = 'Trovi la prima lezione gratuita nel link in bio o su aiutiamoci.cloud!',
  brandName = 'AIutiamoci',
  captionText = '',
}: ReelVideoGeneratorModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [aiTheme, setAiTheme] = useState<AiVisualTheme>('neural-network')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null)
  const [isPublishingBuffer, setIsPublishingBuffer] = useState(false)
  const [bufferSuccessMsg, setBufferSuccessMsg] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Durata totale Reel animato (18 secondi di video compatto)
  const TOTAL_DURATION = 18

  const CANVAS_WIDTH = 1080
  const CANVAS_HEIGHT = 1920

  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0)
      setIsPlaying(true)
      setBufferSuccessMsg(null)
    } else {
      setIsPlaying(false)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen])

  // Game loop / Animation loop
  useEffect(() => {
    if (!isOpen) return

    let lastTimestamp = performance.now()

    const loop = (timestamp: number) => {
      if (isPlaying) {
        const delta = (timestamp - lastTimestamp) / 1000
        setCurrentTime((prev) => {
          const next = prev + delta
          if (next >= TOTAL_DURATION) {
            return 0 // loop continuo dell'anteprima
          }
          return next
        })
      }
      lastTimestamp = timestamp
      drawFrame(currentTime)
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen, isPlaying, currentTime, aiTheme])

  // Disegna l'animazione di sfondo a tema AI
  const drawAiBackground = (ctx: CanvasRenderingContext2D, time: number) => {
    // Sfondo base scuro e profondo
    const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    bgGrad.addColorStop(0, '#050711')
    bgGrad.addColorStop(0.5, '#0b1120')
    bgGrad.addColorStop(1, '#151238')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (aiTheme === 'neural-network') {
      // 1. TEMA: RETE NEURALE A NODI E SINAPSI LUMINOSE
      const currentNodes = NEURAL_NODES.map((n) => ({
        x: n.baseX + Math.sin(time * n.speedX + n.phase) * 50,
        y: n.baseY + Math.cos(time * n.speedY + n.phase) * 50,
        radius: n.radius,
      }))

      // Disegna archi di connessione tra nodi vicini
      ctx.lineWidth = 1.5
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const dx = currentNodes[i].x - currentNodes[j].x
          const dy = currentNodes[i].y - currentNodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 260) {
            const alpha = (1 - dist / 260) * 0.4
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(currentNodes[i].x, currentNodes[i].y)
            ctx.lineTo(currentNodes[j].x, currentNodes[j].y)
            ctx.stroke()

            // Impulsi luminosi di dati che corrono lungo le linee
            const pulsePos = (time * 0.8 + i * 0.2) % 1
            const px = currentNodes[i].x + (currentNodes[j].x - currentNodes[i].x) * pulsePos
            const py = currentNodes[i].y + (currentNodes[j].y - currentNodes[i].y) * pulsePos
            ctx.fillStyle = 'rgba(56, 189, 248, 0.7)'
            ctx.beginPath()
            ctx.arc(px, py, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Disegna i nodi neurali con alone di luce
      for (const node of currentNodes) {
        const glow = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.radius * 4)
        glow.addColorStop(0, 'rgba(129, 140, 248, 0.9)')
        glow.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (aiTheme === 'cyber-circuits') {
      // 2. TEMA: CIRCUITI CYBERNETICI E MICROCHIP
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)'
      ctx.lineWidth = 2.5

      // Tracce orizzontali e verticali con curve a 45°
      const paths = [
        [100, 200, 400, 200, 600, 400, 950, 400],
        [150, 600, 300, 600, 500, 800, 900, 800],
        [80, 1100, 350, 1100, 550, 1300, 1000, 1300],
        [200, 1500, 450, 1500, 650, 1700, 900, 1700],
      ]

      for (const p of paths) {
        ctx.beginPath()
        ctx.moveTo(p[0], p[1])
        ctx.lineTo(p[2], p[3])
        ctx.lineTo(p[4], p[5])
        ctx.lineTo(p[6], p[7])
        ctx.stroke()

        // Punti di giunzione circolari
        ctx.fillStyle = '#06b6d4'
        ctx.beginPath()
        ctx.arc(p[2], p[3], 6, 0, Math.PI * 2)
        ctx.arc(p[4], p[5], 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Impulsi cyber che si muovono sulle tracce
      const pulseX = (time * 180) % (CANVAS_WIDTH - 200) + 100
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(pulseX, 200 + Math.sin(pulseX * 0.01) * 30, 7, 0, Math.PI * 2)
      ctx.fill()
    } else if (aiTheme === 'quantum-mesh') {
      // 3. TEMA: GRIGLIA QUANTISTICA 3D IN PROSPETTIVA
      const horizonY = 700
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)'
      ctx.lineWidth = 1.5

      // Linee di fuga prospettiche verso il centro
      for (let x = -200; x <= CANVAS_WIDTH + 200; x += 90) {
        ctx.beginPath()
        ctx.moveTo(CANVAS_WIDTH / 2, horizonY)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }

      // Linee orizzontali animate verso la camera
      const offset = (time * 60) % 70
      for (let y = horizonY; y < CANVAS_HEIGHT; y += 45 + ((y - horizonY) * 0.12)) {
        const drawY = y + offset
        if (drawY < CANVAS_HEIGHT) {
          ctx.beginPath()
          ctx.moveTo(0, drawY)
          ctx.lineTo(CANVAS_WIDTH, drawY)
          ctx.stroke()
        }
      }
    } else {
      // 4. TEMA: AURORA AI CON ONDE SINUOSE DI DATI
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        const waveY = 500 + i * 260
        ctx.moveTo(0, waveY)
        for (let x = 0; x < CANVAS_WIDTH; x += 30) {
          const y = waveY + Math.sin((x * 0.005) + (time * 1.5) + (i * 1.2)) * 80
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(168, 85, 247, 0.25)'
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    // Glowing Pulse centrale per profondità visiva
    const pulseRadius = 450 + Math.sin(time * 2.5) * 80
    const glow = ctx.createRadialGradient(
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.45,
      60,
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.45,
      pulseRadius
    )
    glow.addColorStop(0, 'rgba(79, 70, 229, 0.28)')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  // Disegna singolo frame del video su Canvas 9:16
  const drawFrame = (time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // 1. Sfondo tematico AI
    drawAiBackground(ctx, time)

    // 2. Header Brand Badge in alto
    ctx.save()
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'
    roundRect(ctx, 100, 160, 320, 64, 20)
    ctx.fill()
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = '#c7d2fe'
    ctx.fillText(`✨ ${brandName.toUpperCase()}`, 135, 202)

    // Indicatore LIVE / REEL
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH - 140, 192, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = '#f87171'
    ctx.fillText('REEL AI', CANVAS_WIDTH - 240, 200)
    ctx.restore()

    // 3. Logica Sequenziale delle Scene
    let stageTitle = ''
    let stageText = ''
    let stageTag = ''
    let progressRatio = time / TOTAL_DURATION

    if (time < 4.5) {
      stageTag = 'GANCIO INIZIALE'
      stageTitle = 'NON SEI IN RITARDO.'
      stageText = hook
    } else if (time < 9.5) {
      stageTag = 'SCENA 1 • IL FALSO MITO'
      stageTitle = scenes[0]?.visual ? 'Non serve programmare' : 'Il Segreto dell’AI'
      stageText = scenes[0]?.audioText || hook
    } else if (time < 14.5) {
      stageTag = 'SCENA 2 • IL METODO PRATICO'
      stageTitle = 'Parla in Italiano Semplice'
      stageText = scenes[1]?.audioText || (scenes[0]?.audioText ?? '')
    } else {
      stageTag = 'CHIAMATA ALL’AZIONE'
      stageTitle = 'Inizia Gratis da Zero'
      stageText = cta
    }

    // 4. Card Centrale Semi-Trasparente con Glassmorphism
    const cardY = 540
    ctx.save()
    ctx.fillStyle = 'rgba(10, 15, 30, 0.82)'
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'
    ctx.lineWidth = 2.5
    roundRect(ctx, 80, cardY, CANVAS_WIDTH - 160, 820, 36)
    ctx.fill()
    ctx.stroke()

    // Tag della scena in evidenza
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(stageTag, 130, cardY + 90)

    // Headline
    ctx.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = '#ffffff'
    wrapText(ctx, stageTitle, 130, cardY + 180, CANVAS_WIDTH - 260, 78)

    // Separatore Fluorescente
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(130, cardY + 280, 180, 8)

    // Testo Parlato / Copy della Scena
    ctx.font = '500 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = '#e2e8f0'
    wrapText(ctx, stageText, 130, cardY + 360, CANVAS_WIDTH - 260, 60)
    ctx.restore()

    // 5. Box Bottom "Follow / Bio"
    const bottomY = CANVAS_HEIGHT - 320
    ctx.save()
    ctx.fillStyle = 'rgba(30, 27, 75, 0.88)'
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)'
    ctx.lineWidth = 2
    roundRect(ctx, 100, bottomY, CANVAS_WIDTH - 200, 120, 24)
    ctx.fill()
    ctx.stroke()

    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('👉 Prima Lezione Gratis su aiutiamoci.cloud', 140, bottomY + 70)
    ctx.restore()

    // 6. Barra di avanzamento orizzontale in fondo allo schermo
    const barY = CANVAS_HEIGHT - 60
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.fillRect(80, barY, CANVAS_WIDTH - 160, 12)

    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(80, barY, (CANVAS_WIDTH - 160) * progressRatio, 12)
  }

  // Esportazione Video Reel tramite MediaRecorder
  const handleExportReelVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas || isRecording) return

    setIsRecording(true)
    setRecordingProgress(0)
    setIsPlaying(false)
    setVideoDownloadUrl(null)

    const stream = canvas.captureStream(30)
    let mimeType = 'video/webm;codecs=vp9'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm'
    }

    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: Blob[] = []

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoDownloadUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = `reel_ai_${aiTheme}_${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setIsRecording(false)
      setIsPlaying(true)
    }

    recorder.start()

    const totalFrames = TOTAL_DURATION * 30
    let currentFrame = 0

    const recordStep = () => {
      const time = (currentFrame / 30)
      drawFrame(time)
      setRecordingProgress(Math.round((currentFrame / totalFrames) * 100))

      currentFrame++
      if (currentFrame <= totalFrames) {
        requestAnimationFrame(recordStep)
      } else {
        recorder.stop()
      }
    }

    requestAnimationFrame(recordStep)
  }

  // Pubblica a Buffer direttamente dal modal Reel
  const handlePublishReelToBuffer = async () => {
    setIsPublishingBuffer(true)
    setBufferSuccessMsg(null)

    try {
      const copyToPublish = captionText || `🎬 ${title}\n\n${hook}\n\n👉 ${cta}\n\n#AIutiamoci #CorsoAI #ReelAI #IntelligenzaArtificiale`
      const res = await publishToBufferAction({
        text: copyToPublish,
        platform: 'Facebook',
        now: false,
      })

      if (res.success) {
        playNotificationSound('chat')
        setBufferSuccessMsg(res.message || '🚀 Reel e didascalia inviati con successo a Buffer!')
      } else {
        alert(`Errore invio a Buffer: ${res.error}`)
      }
    } catch (err: any) {
      alert(`Errore pubblicazione: ${err.message}`)
    } finally {
      setIsPublishingBuffer(false)
    }
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = (text || '').split(' ')
    let line = ''
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
    return y + lineHeight
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm md:text-base">Generatore & Render Video Reel (9:16)</h3>
              <p className="text-xs text-slate-400">Sfondi AI animati con reti neurali e pubblicazione Buffer diretta</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Colonna Sinistra: Player Canvas 9:16 */}
          <div className="md:col-span-6 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full max-w-[280px] aspect-[9/16] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/40">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />

              {isRecording && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-pink-400 animate-spin" />
                  <span className="text-xs font-bold text-white">Rendering Video: {recordingProgress}%</span>
                  <span className="text-[11px] text-slate-400">Generazione stream e download automatico...</span>
                </div>
              )}
            </div>

            {/* Controlli Player */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 px-3 border-slate-700 text-xs text-slate-200"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
                {isPlaying ? 'Pausa' : 'Play'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCurrentTime(0)
                  setIsPlaying(true)
                }}
                className="h-8 px-3 border-slate-700 text-xs text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Riavvia
              </Button>

              <span className="text-xs font-mono text-slate-400 pl-2">
                {Math.floor(currentTime)}s / {TOTAL_DURATION}s
              </span>
            </div>
          </div>

          {/* Colonna Destra: Temi AI, Buffer & Download */}
          <div className="md:col-span-6 space-y-5">
            <div className="space-y-1.5">
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs font-semibold">
                🎬 Formato Nativo 1080x1920 (9:16)
              </Badge>
              <h4 className="font-extrabold text-base text-slate-100">{title}</h4>
            </div>

            {/* Selettore Temi Sfondo AI */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Sfondo Animato a Tema AI:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'neural-network', label: '🧠 Rete Neurale', icon: Brain, desc: 'Sinapsi & Nodi interconnessi' },
                  { id: 'cyber-circuits', label: '⚡ Circuiti Cyber', icon: Cpu, desc: 'Tracce elettroniche & microchip' },
                  { id: 'quantum-mesh', label: '🌌 Quantum Mesh', icon: Layers, desc: 'Griglia 3D in prospettiva' },
                  { id: 'aurora-ai', label: '✨ Aurora Dati', icon: Activity, desc: 'Onde sinuose di energia' },
                ].map((t) => {
                  const Icon = t.icon
                  const active = aiTheme === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAiTheme(t.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        active
                          ? 'bg-blue-600/25 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Icon className="h-3.5 w-3.5 text-blue-400" />
                        <span>{t.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Feedback Buffer */}
            {bufferSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{bufferSuccessMsg}</span>
              </div>
            )}

            {/* Pulsanti di Azione */}
            <div className="space-y-2.5 pt-1">
              <Button
                onClick={handleExportReelVideo}
                disabled={isRecording}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-5 rounded-xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 text-xs"
              >
                {isRecording ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering ed esportazione video ({recordingProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Scarica File Video Reel (WebM/MP4)</span>
                  </>
                )}
              </Button>

              {/* Tasto Pubblica su Buffer */}
              <Button
                onClick={handlePublishReelToBuffer}
                disabled={isPublishingBuffer}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-xs"
              >
                {isPublishingBuffer ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Invio a Buffer in corso...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>🚀 Autorizza e Pubblica su Buffer</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('https://www.capcut.com/tools/script-to-video', '_blank')}
                className="w-full border-slate-700 bg-slate-950/40 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Oppure apri CapCut AI Video
                <ExternalLink className="h-3 w-3 ml-1 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
