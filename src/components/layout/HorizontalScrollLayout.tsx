'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HorizontalScrollLayoutProps {
  children: React.ReactNode
}

export default function HorizontalScrollLayout({ children }: HorizontalScrollLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const isAnimatingRef = useRef(false)
  const lastScrollTimeRef = useRef(0)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  const childArray = React.Children.toArray(children)
  const totalSlides = childArray.length

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const goToSlide = useCallback((index: number) => {
    const target = Math.max(0, Math.min(totalSlides - 1, index))
    setCurrentSlide(target)
  }, [totalSlides])

  useEffect(() => {
    if (!isDesktop) return

    let accumulatedDelta = 0
    let resetTimer: ReturnType<typeof setTimeout> | null = null

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      const dominantDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX

      if (Math.abs(dominantDelta) < 6) return

      const currentSlideEl = slideRefs.current[currentSlide]
      if (currentSlideEl) {
        const isScrollingDown = dominantDelta > 0
        const isScrollingUp = dominantDelta < 0
        const atBottom = currentSlideEl.scrollHeight - currentSlideEl.scrollTop <= currentSlideEl.clientHeight + 10
        const atTop = currentSlideEl.scrollTop <= 10

        if (isScrollingDown && !atBottom) return
        if (isScrollingUp && !atTop) return
      }

      e.preventDefault()

      if (isAnimatingRef.current || now - lastScrollTimeRef.current < 600) {
        return
      }

      accumulatedDelta += dominantDelta

      if (resetTimer) clearTimeout(resetTimer)
      resetTimer = setTimeout(() => {
        accumulatedDelta = 0
      }, 150)

      if (Math.abs(accumulatedDelta) >= 25) {
        isAnimatingRef.current = true
        lastScrollTimeRef.current = now

        if (accumulatedDelta > 0) {
          setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))
        } else {
          setCurrentSlide((prev) => Math.max(0, prev - 1))
        }

        accumulatedDelta = 0
        setTimeout(() => {
          isAnimatingRef.current = false
        }, 650)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        goToSlide(currentSlide + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goToSlide(currentSlide - 1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [isDesktop, currentSlide, totalSlides, goToSlide])

  if (!isDesktop) {
    // Mobile / Tablet: Clean vertical scrolling
    return <div className="w-full flex flex-col">{children}</div>
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Floating Previous Arrow Button */}
      {currentSlide > 0 && (
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-2xl bg-slate-900/85 hover:bg-indigo-600/30 backdrop-blur-xl border border-indigo-500/30 text-indigo-300 hover:scale-110 shadow-2xl transition-all duration-300 group cursor-pointer"
          title="Sezione precedente (Rotellina/Trackpad su, Freccia ◄)"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Floating Next Arrow Button */}
      {currentSlide < totalSlides - 1 && (
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-2xl bg-slate-900/85 hover:bg-indigo-600/30 backdrop-blur-xl border border-indigo-500/30 text-indigo-300 hover:scale-110 shadow-2xl transition-all duration-300 group cursor-pointer animate-pulse hover:animate-none"
          title="Sezione successiva (Rotellina/Trackpad giù, Freccia ►)"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Top-Right Futuristic Slide Counter & Navigation Pills */}
      <div className="fixed top-20 right-8 z-40 flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-2xl px-4 py-2 rounded-full border border-slate-700/60 shadow-2xl">
        <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider mr-1">
          0{currentSlide + 1} <span className="text-slate-500 font-normal">/</span> 0{totalSlides}
        </span>
        <div className="flex items-center gap-1.5">
          {childArray.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-7 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_#6366f1]'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Vai alla sezione 0${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Horizontal Scroll Hint */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400">
        <span>Scorri con rotellina / trackpad o usa le frecce ◄ ►</span>
      </div>

      {/* 60fps Hardware-Accelerated Sliding Track */}
      <div
        className="flex w-full h-full will-change-transform"
        style={{
          transform: `translateX(-${currentSlide * 100}vw)`,
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {childArray.map((child, index) => (
          <div
            key={index}
            ref={(el) => {
              slideRefs.current[index] = el
            }}
            className="w-screen h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden flex flex-col justify-start relative pt-20 pb-12 px-4 sm:px-8"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
