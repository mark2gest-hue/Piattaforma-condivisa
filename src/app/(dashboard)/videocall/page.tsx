'use client'

import { useState } from 'react'
import {
  Video,
  ExternalLink,
  Sparkles,
  Calendar,
  Copy,
  Check,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Provider = 'google_meet' | 'jitsi'

export default function VideocallPage() {
  const [provider, setProvider] = useState<Provider>('google_meet')
  const [inCall, setInCall] = useState(false)
  const [copied, setCopied] = useState(false)

  // Config Google Meet
  const googleMeetUrl = 'https://meet.google.com/new'

  // Config Jitsi Meet (Open Source 100% Gratis senza registrazione)
  const jitsiRoomName = 'teamhub-aiutiamoci-cloud'
  const jitsiRoomUrl = `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false`

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-sky-500" />
            Videocall & Riunioni Team
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Avvia riunioni istantanee in alta definizione con Google Meet Pro o la stanza protetta integrata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selettore Provider: Google Meet Pro (Default) vs Jitsi */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setProvider('google_meet')
                setInCall(false)
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                provider === 'google_meet'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>📹</span>
              Google Meet Pro
            </button>
            <button
              onClick={() => {
                setProvider('jitsi')
                setInCall(false)
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                provider === 'jitsi'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Stanza Integrata Jitsi
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(provider === 'google_meet' ? googleMeetUrl : jitsiRoomUrl, '_blank')
            }
            className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 gap-1.5 shadow-xs border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Nuova scheda
          </Button>
        </div>
      </div>

      {/* Main Room Viewport */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col min-h-[450px]">
        
        {/* Se Google Meet Pro è selezionato: Hub Google Meet Pro */}
        {provider === 'google_meet' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="text-center space-y-6 max-w-lg w-full">
              <div className="relative mx-auto w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10">
                <Video className="h-10 w-10 text-sky-400" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Google Meet Pro Hub</h3>
                  <Badge variant="outline" className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-[11px] font-semibold">
                    PRO ATTIVO
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Sfrutta la qualità massima, registrazione cloud, cancellazione rumore e condivisione schermo con il tuo account Google Pro.
                </p>
              </div>

              {/* Box Info Riunione */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Crittografia End-to-End Enterprise
                  </span>
                  <span className="font-mono text-sky-400">meet.google.com/new</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span>Fino a 250 partecipanti</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Durata illimitata Pro</span>
                  </div>
                </div>
              </div>

              {/* Bottoni di Azione */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => window.open(googleMeetUrl, '_blank')}
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold shadow-lg shadow-sky-500/25 px-8 h-12 cursor-pointer text-sm"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Avvia Google Meet Pro
                  <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleCopyLink(googleMeetUrl)}
                  className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 h-12 cursor-pointer text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-emerald-400" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copia Link
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-2">
                <a
                  href="/calendario"
                  className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Vuoi pianificare una riunione futura? Vai su /calendario ➔
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Se Jitsi Meet è selezionato */}
        {provider === 'jitsi' && inCall && (
          <iframe
            src={jitsiRoomUrl}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            className="w-full h-full border-0 absolute inset-0 z-0"
          />
        )}

        {provider === 'jitsi' && !inCall && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/95 backdrop-blur-xs p-6">
            <div className="text-center space-y-4 max-w-md">
              <div className="h-16 w-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Video className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Stanza WebRTC Integrata (Jitsi)</h3>
                <p className="text-xs text-slate-400">
                  Stanza aperta e gratuita direttamente all'interno della pagina senza login.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setInCall(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 px-8 h-11 cursor-pointer"
                >
                  Entra nella Stanza
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(jitsiRoomUrl, '_blank')}
                  className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 h-11 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apri via Browser
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
