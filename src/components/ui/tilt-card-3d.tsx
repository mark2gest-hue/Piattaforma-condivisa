'use client'

import React, { useRef, useState } from 'react'

interface TiltCard3DProps {
  href: string
  isExternal?: boolean
  children: (props: {
    headerRef: React.RefObject<HTMLDivElement | null>
    logoRef: React.RefObject<HTMLDivElement | null>
    buttonRef: React.RefObject<HTMLDivElement | null>
  }) => React.ReactNode
  className?: string
  accentColor?: 'blue' | 'emerald'
}

export function TiltCard3D({
  href,
  isExternal = false,
  children,
  className = '',
  accentColor = 'blue',
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Escludi dispositivi touch o schermi senza puntatore fine
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    const card = cardRef.current
    const inner = innerRef.current
    const glare = glareRef.current
    if (!card || !inner) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const normX = (x - centerX) / centerX
    const normY = (y - centerY) / centerY

    const maxTilt = 20
    const rotateX = normY * -maxTilt
    const rotateY = normX * maxTilt

    // Inclinazione card madre
    inner.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`

    // Blocco Header (Logo + Titolo) salta in avanti nello spazio Z (+130px) e slitta in parallasse
    if (headerRef.current) {
      headerRef.current.style.transform = `translateZ(130px) translateX(${(-normX * 18).toFixed(1)}px) translateY(${(-normY * 18).toFixed(1)}px) scale(1.06)`
    }

    // Logo icon si solleva ulteriormente e si ingrandisce in modo evidente
    if (logoRef.current) {
      logoRef.current.style.transform = `translateZ(45px) translateX(${(-normX * 8).toFixed(1)}px) translateY(${(-normY * 8).toFixed(1)}px) scale(1.30)`
    }

    // Pulsante in basso si solleva verso l'utente
    if (buttonRef.current) {
      buttonRef.current.style.transform = `translateZ(85px) translateX(${(-normX * 10).toFixed(1)}px) translateY(${(-normY * 10).toFixed(1)}px)`
    }

    // Glare dinamico speculare
    if (glare) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`
      glare.style.opacity = '1'
    }
  }

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }
    setIsHovered(true)
    const inner = innerRef.current
    if (inner) inner.style.transition = 'transform 0.1s ease-out'
    if (headerRef.current) headerRef.current.style.transition = 'transform 0.1s ease-out'
    if (logoRef.current) logoRef.current.style.transition = 'transform 0.1s ease-out'
    if (buttonRef.current) buttonRef.current.style.transition = 'transform 0.1s ease-out'
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    const inner = innerRef.current
    const glare = glareRef.current
    const spring = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)'

    if (inner) {
      inner.style.transition = spring
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }
    if (headerRef.current) {
      headerRef.current.style.transition = spring
      headerRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px) scale(1)'
    }
    if (logoRef.current) {
      logoRef.current.style.transition = spring
      logoRef.current.style.transform = 'translateZ(25px) translateX(0px) translateY(0px) scale(1)'
    }
    if (buttonRef.current) {
      buttonRef.current.style.transition = spring
      buttonRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px)'
    }
    if (glare) {
      glare.style.opacity = '0'
    }

    setTimeout(() => {
      if (inner) inner.style.transition = 'transform 0.12s ease-out'
      if (headerRef.current) headerRef.current.style.transition = 'transform 0.12s ease-out'
      if (logoRef.current) logoRef.current.style.transition = 'transform 0.12s ease-out'
      if (buttonRef.current) buttonRef.current.style.transition = 'transform 0.12s ease-out'
    }, 550)
  }

  const glowShadow = accentColor === 'emerald'
    ? '0 0 45px -10px rgba(52, 211, 153, 0.28), 0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 60px 120px -20px rgba(0, 0, 0, 0.98)'
    : '0 0 45px -10px rgba(70, 120, 220, 0.30), 0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 60px 120px -20px rgba(0, 0, 0, 0.98)'

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full cursor-pointer select-none [perspective:900px] md:[perspective:800px] ${className}`}
    >
      <div
        ref={innerRef}
        className="relative w-full h-full rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 [transform-style:preserve-3d] transition-all"
        style={{
          background: 'linear-gradient(180deg, #131c30 0%, #0a0f1d 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderTop: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: glowShadow,
        }}
      >
        {/* Dynamic Specular Glare */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 transition-opacity duration-300 [transform:translateZ(5px)]"
        />

        {children({ headerRef, logoRef, buttonRef })}
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full no-underline focus:outline-none"
      >
        {cardContent}
      </a>
    )
  }

  return (
    <a href={href} className="block w-full h-full no-underline focus:outline-none">
      {cardContent}
    </a>
  )
}
