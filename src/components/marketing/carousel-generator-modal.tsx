'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  FolderDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CarouselSlide } from '@/app/actions/marketing'

interface CarouselGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  initialSlides?: CarouselSlide[]
  topic?: string
}

type ThemeStyle = 'dark-aiutiamoci' | 'warm-editorial' | 'ocean-gradient' | 'violet-future'

export function CarouselGeneratorModal({
  isOpen,
  onClose,
  initialSlides = [],
  topic = 'Carosello AI Start',
}: CarouselGeneratorModalProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(
    initialSlides.length > 0
      ? initialSlides
      : [
          {
            slideNumber: 1,
            tag: 'Copertina',
            headline: 'NON SEI IN RITARDO.',
            bodyText: "Ti hanno solo spiegato l'Intelligenza Artificiale nel modo sbagliato.",
            takeaway: 'Scorri per scoprire i passi pratici 👉',
          },
          {
            slideNumber: 2,
            tag: 'Il Falso Mito',
            headline: 'Non devi imparare a programmare',
            bodyText: "L'AI moderna capisce l'italiano semplice. Se sai spiegare cosa ti serve a un collaboratore, sai già usare l'AI.",
            takeaway: 'Meno tecnicismi, più chiarezza.',
          },
          {
            slideNumber: 3,
            tag: 'Micro-Lezione',
            headline: 'La Formula RCCF (Modulo 5)',
            bodyText: 'Definisci sempre Ruolo, Contesto, Contenuto e Formato nei tuoi prompt per ottenere risposte impeccabili.',
            takeaway: 'Prova questa formula oggi.',
          },
          {
            slideNumber: 4,
            tag: 'Risultato',
            headline: '5 ore risparmiate ogni settimana',
            bodyText: 'Riduci la fatica su email, documenti e sintesi. Dedica il tempo a ciò che fa crescere davvero la tua attività.',
            takeaway: 'Lavoro più smart e meno stress.',
          },
          {
            slideNumber: 5,
            tag: 'Inizia Ora',
            headline: 'Fai il primo passo',
            bodyText: 'Nel nostro corso AI Start ti guidiamo passo passo da zero, senza giudizio e con esempi concreti.',
            takeaway: 'Salva il carosello e visita aiutiamoci.cloud 🚀',
          },
        ]
  )

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [theme, setTheme] = useState<ThemeStyle>('dark-aiutiamoci')
  const [authorName, setAuthorName] = useState('AIutiamoci')
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides)
      setActiveSlideIndex(0)
    }
  }, [initialSlides])

  useEffect(() => {
    if (isOpen && slides.length > 0) {
      renderSlide(activeSlideIndex)
    }
  }, [isOpen, activeSlideIndex, slides, theme, authorName])

  const currentSlide = slides[activeSlideIndex] || slides[0]

  const updateCurrentSlide = (field: keyof CarouselSlide, val: any) => {
    const updated = [...slides]
    updated[activeSlideIndex] = { ...updated[activeSlideIndex], [field]: val }
    setSlides(updated)
  }

  // Dimensioni standard 4:5 ad alta risoluzione (1080 x 1350)
  const CANVAS_WIDTH = 1080
  const CANVAS_HEIGHT = 1350

  const renderSlideToCanvas = (ctx: CanvasRenderingContext2D, slide: CarouselSlide, slideIdx: number, totalSlides: number) => {
    // 1. Sfondo Tematico
    if (theme === 'dark-aiutiamoci') {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      grad.addColorStop(0, '#090d16')
      grad.addColorStop(0.5, '#0f172a')
      grad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const glow = ctx.createRadialGradient(CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.2, 50, CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.2, 550)
      glow.addColorStop(0, 'rgba(79, 70, 229, 0.25)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    } else if (theme === 'warm-editorial') {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      grad.addColorStop(0, '#fbfaf8')
      grad.addColorStop(1, '#f1ede6')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const glow = ctx.createRadialGradient(CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.1, 50, CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.1, 400)
      glow.addColorStop(0, 'rgba(217, 119, 6, 0.14)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    } else if (theme === 'ocean-gradient') {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      grad.addColorStop(0, '#042f2e')
      grad.addColorStop(0.6, '#0f172a')
      grad.addColorStop(1, '#0284c7')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    } else {
      // violet-future
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      grad.addColorStop(0, '#180828')
      grad.addColorStop(0.7, '#2e1065')
      grad.addColorStop(1, '#4c1d95')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    const isLight = theme === 'warm-editorial'
    const textColorPrimary = isLight ? '#0f172a' : '#ffffff'
    const textColorSecondary = isLight ? '#334155' : '#cbd5e1'
    const accentColor = isLight ? '#d97706' : '#6366f1'
    const badgeBg = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(99, 102, 241, 0.2)'
    const badgeText = isLight ? '#b45309' : '#a5b4fc'

    const marginX = 90
    let cursorY = 90

    // Top Header: Brand + Numero Slide (es. "02 / 05")
    ctx.save()
    ctx.fillStyle = badgeBg
    roundRect(ctx, marginX, cursorY, 240, 48, 12)
    ctx.fill()
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = badgeText
    ctx.fillText(`✨ ${authorName.toUpperCase()}`, marginX + 24, cursorY + 31)

    // Contatore Slide a destra
    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = textColorSecondary
    ctx.textAlign = 'right'
    ctx.fillText(`${String(slideIdx + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`, CANVAS_WIDTH - marginX, cursorY + 32)
    ctx.textAlign = 'left'
    ctx.restore()

    cursorY += 120

    // Categoria / Tag della slide
    if (slide.tag) {
      ctx.save()
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = accentColor
      ctx.fillText(slide.tag.toUpperCase(), marginX, cursorY)
      ctx.restore()
      cursorY += 36
    }

    // Headline / Titolo Slide
    ctx.font = '800 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = textColorPrimary
    cursorY = wrapText(ctx, slide.headline, marginX, cursorY, CANVAS_WIDTH - marginX * 2, 70)

    cursorY += 40

    // Linea di accento
    ctx.fillStyle = accentColor
    ctx.fillRect(marginX, cursorY, 140, 6)
    cursorY += 50

    // Corpo del testo
    ctx.font = '400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = textColorSecondary
    cursorY = wrapText(ctx, slide.bodyText, marginX, cursorY, CANVAS_WIDTH - marginX * 2, 50)

    // Takeaway / Bottom Swipe Callout
    if (slide.takeaway) {
      cursorY = Math.max(cursorY + 60, CANVAS_HEIGHT - 180)
      ctx.save()
      ctx.fillStyle = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'
      roundRect(ctx, marginX, cursorY, CANVAS_WIDTH - marginX * 2, 90, 16)
      ctx.fill()

      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc'
      ctx.fillText(slide.takeaway, marginX + 30, cursorY + 54)
      ctx.restore()
    }

    // Footer indicator Dots
    const dotY = CANVAS_HEIGHT - 40
    const dotSpacing = 24
    const totalDotsWidth = totalSlides * dotSpacing
    const startX = (CANVAS_WIDTH - totalDotsWidth) / 2

    for (let i = 0; i < totalSlides; i++) {
      ctx.beginPath()
      ctx.arc(startX + i * dotSpacing, dotY, i === slideIdx ? 6 : 3, 0, Math.PI * 2)
      ctx.fillStyle = i === slideIdx ? accentColor : isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
      ctx.fill()
    }
  }

  const renderSlide = (idx: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    renderSlideToCanvas(ctx, slides[idx], idx, slides.length)
  }

  // Download singola slide
  const downloadSingleSlide = (idx: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `carosello_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_slide_${idx + 1}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Download di tutte le slide sequenziali
  const downloadAllSlides = async () => {
    if (isDownloadingAll) return
    setIsDownloadingAll(true)

    const offscreen = document.createElement('canvas')
    offscreen.width = CANVAS_WIDTH
    offscreen.height = CANVAS_HEIGHT
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) {
      setIsDownloadingAll(false)
      return
    }

    for (let i = 0; i < slides.length; i++) {
      renderSlideToCanvas(offCtx, slides[i], i, slides.length)
      const dataUrl = offscreen.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `carosello_slide_${i + 1}_di_${slides.length}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      await new Promise((r) => setTimeout(r, 400))
    }

    setIsDownloadingAll(false)
  }

  // Helper Canvas
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
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm md:text-base">Generatore Caroselli Multi-Slide (4:5)</h3>
              <p className="text-xs text-slate-400">Formato 1080x1350 pronto per Instagram e LinkedIn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonna Sinistra: Modifica Slide & Temi */}
          <div className="lg:col-span-6 space-y-4">
            {/* Navigatore Slide Chips */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeSlideIndex === idx
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Slide {idx + 1}</span>
                  {s.tag && <span className="text-[10px] opacity-70">({s.tag})</span>}
                </button>
              ))}
            </div>

            {/* Editor Campi Slide Corrente */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Modifica Slide {activeSlideIndex + 1} di {slides.length}
                </span>
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                  {currentSlide.tag || 'Slide'}
                </Badge>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tag / Tipologia Slide</label>
                <input
                  type="text"
                  value={currentSlide.tag || ''}
                  onChange={(e) => updateCurrentSlide('tag', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Titolo / Headline</label>
                <input
                  type="text"
                  value={currentSlide.headline}
                  onChange={(e) => updateCurrentSlide('headline', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Corpo del Testo</label>
                <textarea
                  rows={3}
                  value={currentSlide.bodyText}
                  onChange={(e) => updateCurrentSlide('bodyText', e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Takeaway / Call To Action Slide</label>
                <input
                  type="text"
                  value={currentSlide.takeaway || ''}
                  onChange={(e) => updateCurrentSlide('takeaway', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Selezione Tema & Brand */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Tema Grafico Carosello:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'dark-aiutiamoci', label: 'Dark AI', color: 'bg-slate-950 border-indigo-500' },
                  { id: 'warm-editorial', label: 'Warm Editorial', color: 'bg-amber-50 text-slate-900 border-amber-300' },
                  { id: 'ocean-gradient', label: 'Ocean Blue', color: 'bg-cyan-950 border-cyan-500' },
                  { id: 'violet-future', label: 'Violet Future', color: 'bg-purple-950 border-purple-500' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${t.color} ${
                      theme === t.id ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonna Destra: Anteprima Live Canvas & Azioni */}
          <div className="lg:col-span-6 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center justify-between px-2">
              <span className="text-xs text-slate-400 font-mono">Anteprima Live Slide (4:5)</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((p) => Math.max(0, p - 1))}
                  className="h-7 w-7 p-0 border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-mono text-slate-300 px-2">
                  {activeSlideIndex + 1} / {slides.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activeSlideIndex === slides.length - 1}
                  onClick={() => setActiveSlideIndex((p) => Math.min(slides.length - 1, p + 1))}
                  className="h-7 w-7 p-0 border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Canvas Container Scalato per Preview */}
            <div className="relative w-full max-w-[340px] aspect-[4/5] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            {/* Azioni Download */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => downloadSingleSlide(activeSlideIndex)}
                className="w-full sm:w-1/2 border-slate-700 hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-purple-400" />
                Scarica Slide {activeSlideIndex + 1} (PNG)
              </Button>

              <Button
                onClick={downloadAllSlides}
                disabled={isDownloadingAll}
                className="w-full sm:w-1/2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
              >
                <FolderDown className="h-3.5 w-3.5" />
                {isDownloadingAll ? 'Esportazione in corso...' : `Scarica Tutte le ${slides.length} Slide`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
