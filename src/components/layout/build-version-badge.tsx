'use client'

import { useEffect, useRef, useState } from 'react'
import versionData from '../../../version.json'

export function BuildVersionBadge() {
  const [versionInfo, setVersionInfo] = useState({
    version: versionData.version || '1.0.0',
    build: versionData.build || 1,
  })
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
          console.log(`[BuildVersionBadge] Rilevata nuova build remota (#${remoteBuild} > #${currentBuildRef.current}). Ricaricamento per auto-update...`)
          currentBuildRef.current = remoteBuild
          window.location.reload()
        }
      } catch (err) {
        // Ignora errori di rete temporanei
      }
    }

    checkVersion()
    const interval = setInterval(checkVersion, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      className="fixed bottom-2 right-3 z-40 pointer-events-none select-none px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/70 backdrop-blur-xs shadow-sm flex items-center gap-1.5"
      title={`Versione attiva: v${versionInfo.version} • Build #${versionInfo.build}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>v{versionInfo.version} • Build #{versionInfo.build}</span>
    </div>
  )
}
