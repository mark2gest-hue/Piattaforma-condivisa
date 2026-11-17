'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import versionData from '../../../version.json'

interface BuildVersionBadgeProps {
  compact?: boolean
  className?: string
}

export function BuildVersionBadge({ compact = false, className }: BuildVersionBadgeProps) {
  const [versionInfo, setVersionInfo] = useState({
    version: versionData.version || '1.0.0',
    build: versionData.build || 1,
  })
  const [hasUpdate, setHasUpdate] = useState(false)
  const currentBuildRef = useRef<number>(Number(versionData.build) || 1)

  useEffect(() => {
    let mounted = true

    const checkVersion = async () => {
      try {
        const res = await fetch('/api/version?t=' + Date.now(), { cache: 'no-store' })
        if (!res.ok) return
        const remote = await res.json()
        if (!mounted || !remote || !remote.build) return

        const remoteBuild = Number(remote.build)
        setVersionInfo({
          version: remote.version || '1.0.0',
          build: remoteBuild,
        })

        if (currentBuildRef.current && remoteBuild > currentBuildRef.current) {
          // Segnala visivamente che è disponibile una nuova build senza MAI forzare il reload automatico
          setHasUpdate(true)
        }
      } catch (err) {
        // Ignora errori di rete temporanei
      }
    }

    // Primo controllo dopo 30 secondi dal mount, poi polling dolce ogni 5 minuti (300000ms)
    const initialTimeout = setTimeout(checkVersion, 30000)
    const interval = setInterval(checkVersion, 300000)

    return () => {
      mounted = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  const handleManualReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div
      onClick={hasUpdate ? handleManualReload : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 select-none rounded-full font-mono font-semibold transition-all backdrop-blur-xs shadow-xs',
        compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]',
        hasUpdate
          ? 'cursor-pointer pointer-events-auto bg-amber-950/90 text-amber-200 border border-amber-500/60 hover:bg-amber-900 animate-pulse'
          : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80',
        className
      )}
      title={
        hasUpdate
          ? `Nuova versione disponibile (v${versionInfo.version} • Build #${versionInfo.build}). Clicca per aggiornare la pagina!`
          : `Versione attiva: v${versionInfo.version} • Build #${versionInfo.build}`
      }
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          compact ? 'w-1 h-1' : 'w-1.5 h-1.5',
          hasUpdate ? 'bg-amber-400' : 'bg-emerald-400'
        )}
      />
      <span>
        {compact ? (
          <>
            #{versionInfo.build}
            {hasUpdate && ' (↻)'}
          </>
        ) : (
          <>
            v{versionInfo.version} • Build #{versionInfo.build}
            {hasUpdate && ' (Aggiorna ↻)'}
          </>
        )}
      </span>
    </div>
  )
}
