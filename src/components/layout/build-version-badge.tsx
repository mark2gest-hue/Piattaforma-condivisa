'use client'

import { useEffect, useRef, useState } from 'react'
import versionData from '../../../version.json'

export function BuildVersionBadge() {
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
      className={`fixed bottom-2 right-3 z-40 select-none px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold backdrop-blur-xs shadow-sm flex items-center gap-1.5 transition-all ${
        hasUpdate
          ? 'cursor-pointer pointer-events-auto bg-amber-950/90 text-amber-200 border border-amber-500/60 hover:bg-amber-900 animate-pulse'
          : 'pointer-events-none bg-slate-900/80 text-slate-300 border border-slate-700/70'
      }`}
      title={
        hasUpdate
          ? `Nuova versione disponibile (v${versionInfo.version} • Build #${versionInfo.build}). Clicca per aggiornare la pagina!`
          : `Versione attiva: v${versionInfo.version} • Build #${versionInfo.build}`
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          hasUpdate ? 'bg-amber-400' : 'bg-emerald-400'
        }`}
      />
      <span>
        v{versionInfo.version} • Build #{versionInfo.build}
        {hasUpdate && ' (Aggiorna ↻)'}
      </span>
    </div>
  )
}
