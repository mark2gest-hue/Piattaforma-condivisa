'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Video,
  PhoneOff,
  ShieldCheck,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'

export default function VideocallPage() {
  const [inCall, setInCall] = useState(false)
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const dailyRoomUrl = `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'teamhub.daily.co'}/${
    process.env.NEXT_PUBLIC_DAILY_ROOM_NAME || 'team-stanza-principale'
  }`

  const joinCall = useCallback(() => {
    if (!containerRef.current) return
    
    // Create the Daily iframe
    const newCallObject = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        backgroundColor: '#0f172a', // slate-950
      },
      showLeaveButton: true,
      showFullscreenButton: true,
      theme: {
        colors: {
          accent: '#2563eb', // blue-600
          accentText: '#ffffff',
          background: '#0f172a',
          backgroundAccent: '#1e293b',
          baseText: '#f8fafc',
          border: '#334155',
          mainAreaBg: '#020617',
          mainAreaBgAccent: '#0f172a',
          mainAreaText: '#f8fafc',
          supportiveText: '#94a3b8',
        },
      },
    })

    newCallObject.on('left-meeting', () => {
      setInCall(false)
      newCallObject.destroy()
      setCallObject(null)
    })

    setCallObject(newCallObject)
    newCallObject.join({ url: dailyRoomUrl })
    setInCall(true)
  }, [dailyRoomUrl])

  const leaveCall = useCallback(() => {
    if (callObject) {
      callObject.leave()
    }
  }, [callObject])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObject) {
        callObject.leave().then(() => callObject.destroy())
      }
    }
  }, [callObject])

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            Stanza Videocall WebRTC
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
            onClick={() => navigator.clipboard.writeText(dailyRoomUrl)}
            className="text-xs bg-white text-slate-700 hover:bg-slate-50 gap-1.5 shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            Copia Link
          </Button>
        </div>
      </div>

      {/* Main Room Viewport */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col">
        
        {/* Iframe Container */}
        <div 
          ref={containerRef} 
          className={`flex-1 w-full h-full transition-opacity duration-300 ${inCall ? 'opacity-100' : 'opacity-0 hidden'}`} 
        />

        {/* Join Screen (Idle State) */}
        {!inCall && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
            <div className="text-center space-y-4 max-w-md p-6">
              <div className="h-16 w-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Video className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Pronto per entrare nella videocall?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'interfaccia pre-integrata di Daily gestirà i dispositivi audio/video e la condivisione schermo.
                </p>
              </div>
              <Button
                size="lg"
                onClick={joinCall}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 px-8 mt-2"
              >
                Entra nella Chiamata
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
