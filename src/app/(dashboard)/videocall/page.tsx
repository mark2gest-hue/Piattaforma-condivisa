'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Video,
  PhoneOff,
  ShieldCheck,
  Share2,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'

export default function VideocallPage() {
  const [inCall, setInCall] = useState(false)
  const [joining, setJoining] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const rawRoomName = process.env.NEXT_PUBLIC_DAILY_ROOM_NAME || 'team-stanza-principale'
  const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'teamhub.daily.co'
  const dailyRoomUrl = rawRoomName.startsWith('http')
    ? rawRoomName
    : `https://${domain.replace(/^https?:\/\//, '')}/${rawRoomName}`

  const joinCall = useCallback(() => {
    if (!containerRef.current) return
    setJoining(true)
    setErrorMessage(null)

    // Se esiste un frame precedente, puliscilo
    if (callObject) {
      callObject.destroy()
    }

    try {
      const newCallObject = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '16px',
          backgroundColor: '#0f172a',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      })

      newCallObject.on('joined-meeting', () => {
        setInCall(true)
        setJoining(false)
      })

      newCallObject.on('left-meeting', () => {
        setInCall(false)
        setJoining(false)
        newCallObject.destroy()
        setCallObject(null)
      })

      newCallObject.on('error', (e) => {
        console.error('Errore Daily.co:', e)
        setErrorMessage(`Impossibile connettersi alla stanza (${e.errorMsg || 'Verifica la stanza su Daily.co'})`)
        setJoining(false)
        setInCall(false)
      })

      setCallObject(newCallObject)
      newCallObject.join({ url: dailyRoomUrl })
    } catch (err: any) {
      console.error('Errore creazione frame:', err)
      setErrorMessage('Errore durante l’inizializzazione del componente videocall.')
      setJoining(false)
    }
  }, [dailyRoomUrl, callObject])

  const leaveCall = useCallback(() => {
    if (callObject) {
      callObject.leave()
    }
  }, [callObject])

  useEffect(() => {
    return () => {
      if (callObject) {
        callObject.destroy()
      }
    }
  }, [callObject])

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Stanza Videocall WebRTC
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Riunioni istantanee ad alta definizione basate su Daily.co SDK.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" className="py-1 px-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Crittografia E2E
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(dailyRoomUrl, '_blank')}
            className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 gap-1.5 shadow-xs border-slate-200 dark:border-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Apri in nuova scheda
          </Button>
        </div>
      </div>

      {/* Main Room Viewport */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col min-h-[450px]">
        
        {/* Iframe Container - Sempre presente nel DOM per permettere l'aggancio di Daily */}
        <div 
          ref={containerRef} 
          className="w-full h-full absolute inset-0 z-0"
        />

        {/* Join Screen (Idle State Overlay) */}
        {!inCall && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/95 backdrop-blur-xs p-6">
            <div className="text-center space-y-4 max-w-md">
              <div className="h-16 w-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Video className="h-8 w-8" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Pronto per entrare nella videocall?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stanza collegata a: <strong className="text-slate-200 font-mono">{dailyRoomUrl}</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={joinCall}
                  disabled={joining}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 px-8 h-11"
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connessione...
                    </>
                  ) : (
                    'Entra nella Chiamata'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(dailyRoomUrl, '_blank')}
                  className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 h-11"
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
