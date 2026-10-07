'use client'

import React, { useState, useRef } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: 'indigo' | 'emerald'
}

export function TiltCard({ children, className = '', glowColor = 'indigo' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calcola rotazione 3D max ~8-10 gradi per un effetto cinematico e fluido
    const rotX = -((y - centerY) / centerY) * 9
    const rotY = ((x - centerX) / centerX) * 9
    
    setRotateX(rotX)
    setRotateY(rotY)
    
    // Calcola posizione del riflesso di luce
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.25 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      style={{ perspective: '1200px' }}
      className="w-full h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative transition-all duration-200 ease-out will-change-transform ${className}`}
        style={{
          transform: isHovered
            ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic Light Glare Overlay */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none transition-opacity duration-300 z-30 overflow-hidden"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.18), transparent 70%)`,
          }}
        />

        {/* Card Content with 3D Depth */}
        <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }} className="h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  )
}
