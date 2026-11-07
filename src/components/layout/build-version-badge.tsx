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
          // Guardia ferrea anti-loop reload
          try {
            const lastReloadBuild = sessionStorage.getItem('aiutiamoci_last_reload_build')
            const lastReloadTs = sessionStorage.getItem('aiutiamoci_last_reload_ts')
            const now = Date.now()

            if (lastReloadBuild === String(remoteBuild) || (lastReloadTs && now - Number(lastReloadTs) < 60000)) {
              // Già ricaricato di recente per questa build o negli ultimi 60s: non ricaricare
              return
            }

            sessionStorage.setItem('aiutiamoci_last_reload_build', String(remoteBuild))
            sessionStorage.setItem('aiutiamoci_last_reload_ts', String(now))
          } catch (e) {
            // sessionStorage non accessibile
          }

          console.log(`[BuildVersionBadge] Nuova build remota (#${remoteBuild} > #${currentBuildRef.current}). Ricaricamento controllato...`)
          currentBuildRef.current = remoteBuild
          window.location.reload()
        }
      } catch (err) {
        // Ignora errori di rete temporanei
      }
    }

    // Primo controllo dopo 15 secondi dal mount, poi polling ogni 3 minuti (180000ms)
    const initialTimeout = setTimeout(checkVersion, 15000)
    const interval = setInterval(checkVersion, 180000)

    return () => {
      mounted = false
      clearTimeout(initialTimeout)
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
