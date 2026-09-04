'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Palette,
  Download,
  X,
  Layout,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LocandinaGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  initialTitle?: string
  initialHook?: string
  initialBody?: string
  initialCta?: string
}

type AspectRatio = '4:5' | '1:1' | '9:16'
type ThemeStyle = 'dark-aiutiamoci' | 'warm-editorial' | 'ocean-gradient' | 'violet-future'

export function LocandinaGeneratorModal({
  isOpen,
  onClose,
  initialTitle = 'NON SEI IN RITARDO.\nTI HANNO SOLO SPIEGATO L’AI NEL MODO SBAGLIATO.',
  initialHook = 'Umani nel pensiero. Smart nell’azione.',
  initialBody = 'Per iniziare non devi diventare un tecnico e non devi imparare cento strumenti. Devi capire cosa ti serve davvero e imparare a usarlo con calma.',
  initialCta = 'Scrivici in DM per capire da dove iniziare',
}: LocandinaGeneratorModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialHook)
  const [bodyText, setBodyText] = useState(initialBody)
  const [ctaText, setCtaText] = useState(initialCta)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5')
  const [theme, setTheme] = useState<ThemeStyle>('dark-aiutiamoci')
  const [authorName, setAuthorName] = useState('AIutiamoci')
  const [isDownloading, setIsDownloading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle)
    if (initialHook) setSubtitle(initialHook)
    if (initialBody) setBodyText(initialBody)
    if (initialCta) setCtaText(initialCta)
  }, [initialTitle, initialHook, initialBody, initialCta])

  useEffect(() => {
    if (isOpen) {
      renderPosterOnCanvas()
    }
  }, [isOpen, title, subtitle, bodyText, ctaText, aspectRatio, theme, authorName])

  const getCanvasDimensions = () => {
    if (aspectRatio === '1:1') return { width: 1080, height: 1080 }
    if (aspectRatio === '9:16') return { width: 1080, height: 1920 }
    return { width: 1080, height: 1350 } // 4:5 Instagram & LinkedIn
  }

  const renderPosterOnCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = getCanvasDimensions()
    canvas.width = width
    canvas.height = height

    // 1. Disegna Sfondo Tematico
    if (theme === 'dark-aiutiamoci') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#090d16')
      grad.addColorStop(0.5, '#0f172a')
      grad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Glow Accents
      const glow = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500)
      glow.addColorStop(0, 'rgba(79, 70, 229, 0.25)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
    } else if (theme === 'warm-editorial') {
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#fbfaf8')
      grad.addColorStop(1, '#f1ede6')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      const glow = ctx.createRadialGradient(width * 0.8, height * 0.1, 50, width * 0.8, height * 0.1, 400)
      glow.addColorStop(0, 'rgba(217, 119, 6, 0.12)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
    } else if (theme === 'ocean-gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#042f2e')
      grad.addColorStop(0.6, '#0f172a')
      grad.addColorStop(1, '#0284c7')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    } else {
      // violet-future
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#180828')
      grad.addColorStop(0.7, '#2e1065')
      grad.addColorStop(1, '#4c1d95')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }

    const isLight = theme === 'warm-editorial'
    const textColorPrimary = isLight ? '#0f172a' : '#ffffff'
    const textColorSecondary = isLight ? '#475569' : '#94a3b8'
    const accentColor = isLight ? '#d97706' : '#6366f1'
    const badgeBg = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(99, 102, 241, 0.2)'
    const badgeText = isLight ? '#b45309' : '#a5b4fc'

    const marginX = 80
    let cursorY = 100

    // 2. Header Brand Badge
    ctx.save()
    ctx.fillStyle = badgeBg
    roundRect(ctx, marginX, cursorY, 260, 48, 12)
    ctx.fill()

    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = badgeText
    ctx.fillText(`✨ ${authorName.toUpperCase()}`, marginX + 24, cursorY + 31)
    ctx.restore()

    cursorY += 120

    // 3. Titolo / Headline Principale
    ctx.font = '800 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = textColorPrimary
    cursorY = wrapText(ctx, title, marginX, cursorY, width - marginX * 2, 64)

    cursorY += 40

    // 4. Linea Separatore
    ctx.fillStyle = accentColor
    ctx.fillRect(marginX, cursorY, 120, 6)

    cursorY += 50

    // 5. Sottotitolo / Gancio
    if (subtitle) {
      ctx.font = 'italic 600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = isLight ? '#b45309' : '#38bdf8'
      cursorY = wrapText(ctx, `“${subtitle}”`, marginX, cursorY, width - marginX * 2, 44)
      cursorY += 40
    }

    // 6. Corpo del Testo
    if (bodyText) {
      ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = textColorSecondary
      cursorY = wrapText(ctx, bodyText, marginX, cursorY, width - marginX * 2, 42)
    }

    // 7. Footer & Call To Action (in basso)
    const footerY = height - 120

    // Sfondo CTA Bar
    ctx.save()
    ctx.fillStyle = isLight ? '#0f172a' : 'rgba(255, 255, 255, 0.08)'
    ctx.strokeStyle = isLight ? 'transparent' : 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 2
    roundRect(ctx, marginX, footerY - 50, width - marginX * 2, 80, 20)
    ctx.fill()
    ctx.stroke()

    // Testo CTA
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = isLight ? '#ffffff' : '#f8fafc'
    ctx.textAlign = 'center'
    ctx.fillText(`👉 ${ctaText}`, width / 2, footerY - 2)

    // Sottotesto URL
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = isLight ? '#64748b' : '#64748b'
    ctx.textAlign = 'left'
    ctx.fillText('aiutiamoci.cloud • Corsi & Consulenze AI', marginX, height - 30)
    ctx.restore()
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const paragraphs = text.split('\n')
    let currentY = y

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ')
      let line = ''

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line.trim(), x, currentY)
      currentY += lineHeight * 1.2
    }

    return currentY
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  const handleDownloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDownloading(true)

    const link = document.createElement('a')
    link.download = `locandina-aiutiamoci-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()

    setTimeout(() => setIsDownloading(false), 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Generatore Visuale di Locandine Social
                <Badge className="bg-blue-600/20 text-blue-400 text-[10px]">1080p Export</Badge>
              </h3>
              <p className="text-[11px] text-slate-400">
                Personalizza testi, colori e scarica la grafica pronta per Instagram, LinkedIn e Stories.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body: 2 Colonne (Controlli a Sinistra, Live Canvas a Destra) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Colonna Sinistra: Editor Controlli */}
          <div className="lg:col-span-6 p-5 overflow-y-auto space-y-5 border-r border-slate-800 bg-slate-950/40 text-xs">
            {/* Formato & Aspetto */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Layout className="h-3.5 w-3.5 text-blue-400" />
                Formato Social
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('4:5')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                    aspectRatio === '4:5'
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">4:5</div>
                  <div className="text-[10px] opacity-75">Feed IG / LinkedIn</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                    aspectRatio === '1:1'
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">1:1</div>
                  <div className="text-[10px] opacity-75">Quadrato Classico</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                    aspectRatio === '9:16'
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">9:16</div>
                  <div className="text-[10px] opacity-75">Storie & Reel</div>
                </button>
              </div>
            </div>

            {/* Tema & Palette */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                Stile & Palette Colori
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark-aiutiamoci')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    theme === 'dark-aiutiamoci'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>Dark AIutiamoci</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('warm-editorial')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    theme === 'warm-editorial'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Warm Editorial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('ocean-gradient')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    theme === 'ocean-gradient'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shrink-0" />
                  <span>Ocean Smeraldo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('violet-future')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    theme === 'violet-future'
                      ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 shrink-0" />
                  <span>Viola Cyber</span>
                </button>
              </div>
            </div>

            {/* Testi Personalizzabili */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Titolo Principale (Headline)</label>
                <textarea
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Gancio / Frase Chiave</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Testo / Concetto di Spiegazione</label>
                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Call to Action (In Basso)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Colonna Destra: Live Canvas & Download */}
          <div className="lg:col-span-6 p-6 flex flex-col items-center justify-center bg-slate-950 overflow-auto">
            <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800 max-h-[520px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[500px] w-auto h-auto object-contain rounded-xl"
              />
            </div>

            <div className="mt-5 w-full flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Risoluzione: {getCanvasDimensions().width}x{getCanvasDimensions().height}px (PNG)
              </span>

              <Button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Generazione PNG...' : 'Scarica Locandina PNG'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
