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

interface MeetRoom {
  id: string
  title: string
  badge: string
  badgeColor: string
  desc: string
  shortDesc: string
  url: string
  shortUrl: string
  target: string
  icon: string
}

const MEET_ROOMS: MeetRoom[] = [
  {
    id: 'team',
    title: 'Stanza Riservata Soci',
    badge: 'STANZA PROTETTA',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    desc: 'Stanza Google Meet fissa per allineamenti rapidi e decisioni operative riservate tra i soci.',
    shortDesc: 'Allineamento interno soci',
    url: 'https://meet.google.com/mth-rqxp-bdf',
    shortUrl: 'meet.google.com/mth-rqxp-bdf',
    target: 'Riservata ai 3 Soci',
    icon: '👥',
  },
  {
    id: 'masterclass',
    title: 'Masterclass Corsisti',
    badge: 'DIRETTE & Q&A',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    desc: 'Stanza d\'aula live per le lezioni del giovedì sera e sessioni di domande e risposte con gli studenti.',
    shortDesc: 'Dirette live del giovedì',
    url: 'https://meet.google.com/wsv-bqxm-bvr',
    shortUrl: 'meet.google.com/wsv-bqxm-bvr',
    target: 'Accessibile agli Studenti',
    icon: '🎓',
  },
  {
    id: 'clients',
    title: 'Clienti & Briefing B2B',
    badge: 'COMMERCIALE / PMI',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    desc: 'Stanza isolata per audit, call conoscitive e consulenze strategiche riservate con aziende.',
    shortDesc: 'Audit e call PMI riservate',
    url: 'https://meet.google.com/yme-pyws-osa',
    shortUrl: 'meet.google.com/yme-pyws-osa',
    target: 'Audit & Clienti PMI',
    icon: '🤝',
  },
  {
    id: 'lab',
    title: 'Lab Agenti AI Pro',
    badge: 'LABORATORIO AVANZATO',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    desc: 'Laboratorio tecnico per flussi n8n, framework multi-agente e architetture complesse.',
    shortDesc: 'Test tecnici & agenti',
    url: 'https://meet.google.com/dwe-rczj-uxz',
    shortUrl: 'meet.google.com/dwe-rczj-uxz',
    target: 'Sessioni Tecniche Pro',
    icon: '🛠️',
  },
]

type Provider = 'google_meet' | 'jitsi'

export default function VideocallPage() {
  const [provider, setProvider] = useState<Provider>('google_meet')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [inCall, setInCall] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentRoom = MEET_ROOMS.find((r) => r.id === selectedRoomId) || null

  // Config Stanza WebRTC Alternativa
  const jitsiRoomName = 'teamhub-soci-aiutiamoci'
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
            Seleziona la stanza desiderata o avvia riunioni istantanee in alta definizione.
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
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              WebRTC Free
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={provider === 'google_meet' && !currentRoom}
            onClick={() => {
              if (provider === 'google_meet' && currentRoom) {
                window.open(currentRoom.url, '_blank')
              } else if (provider === 'jitsi') {
                window.open(jitsiRoomUrl, '_blank')
              }
            }}
            className={`text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 gap-1.5 shadow-xs border-slate-200 dark:border-slate-700 ${
              provider === 'google_meet' && !currentRoom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Nuova scheda
          </Button>
        </div>
      </div>

      {/* Main Room Viewport */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col min-h-[500px]">
        
        {/* Se Google Meet Pro è selezionato: Hub Google Meet Pro con 4 Stanze */}
        {provider === 'google_meet' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
            <div className="text-center space-y-5 max-w-2xl w-full my-auto">
              
              {/* I 4 Tasti Rapidi per Selezionare la Stanza */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {MEET_ROOMS.map((room) => {
                  const isSelected = selectedRoomId === room.id
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500/50'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base">{room.icon}</span>
                        {isSelected ? (
                          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                        )}
                      </div>
                      <div>
                        <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {room.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {room.shortDesc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Card Dettaglio Stanza Selezionata o Stato di Attesa */}
              {currentRoom ? (
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-xl backdrop-blur-xs transition-all duration-300 animate-in fade-in zoom-in-95">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10">
                    <span className="text-2xl">{currentRoom.icon}</span>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {currentRoom.title}
                      </h3>
                      <Badge variant="outline" className={`${currentRoom.badgeColor} text-[10px] font-semibold tracking-wide`}>
                        {currentRoom.badge}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                      {currentRoom.desc}
                    </p>
                  </div>

                  {/* Box Info Tecniche */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 text-left space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300 text-[11px] sm:text-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        Crittografia Google Enterprise
                      </span>
                      <span className="font-mono text-sky-400 font-bold text-[11px] sm:text-xs truncate ml-2">
                        {currentRoom.shortUrl}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{currentRoom.target}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">Link permanente (no scadenza)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottoni di Azione ATTIVI */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                    <Button
                      size="lg"
                      onClick={() => window.open(currentRoom.url, '_blank')}
                      className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold shadow-lg shadow-sky-500/25 px-7 h-11 cursor-pointer text-xs sm:text-sm transition-all"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Entra nella Stanza
                      <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleCopyLink(currentRoom.url)}
                      className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 h-11 cursor-pointer text-xs sm:text-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-emerald-400" />
                          Link Copiato!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copia Link
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Link Community Telegram & Tutor AI per Masterclass Corsisti */}
                  {currentRoom.id === 'masterclass' && (
                    <div className="pt-2">
                      <a
                        href="https://t.me/Corsi_Masterclass_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-semibold transition-all shadow-xs w-full sm:w-auto cursor-pointer"
                      >
                        <span className="text-sm">💬</span>
                        <span>Entra nella Community Telegram & Tutor AI (@Corsi_Masterclass_bot)</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </a>
                    </div>
                  )}

                  <div>
                    <a
                      href="/calendario"
                      className="text-[11px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 transition-colors"
                    >
                      <Calendar className="h-3 w-3" />
                      Vuoi pianificare una riunione futura con inviti email? Vai su /calendario ➔
                    </a>
                  </div>
                </div>
              ) : (
                /* Stato Neutro quando NESSUNA Stanza è Selezionata */
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xl backdrop-blur-xs">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center shadow-inner text-slate-400">
                    <Video className="h-8 w-8 text-slate-400" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Scegli una Sala Riunioni
                      </h3>
                      <Badge variant="outline" className="bg-slate-800/60 text-slate-400 border-slate-700 text-[10px] font-semibold">
                        IN ATTESA DI SELEZIONE
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                      Clicca su una delle 4 sale in alto (Soci, Masterclass, Clienti o Lab) per sbloccare l'accesso e visualizzare il link protetto.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3.5 text-center text-xs text-slate-500">
                    🔒 Nessuna stanza attualmente attiva. Seleziona una card sopra per abilitare il collegamento.
                  </div>

                  {/* Bottoni Disabilitati */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                    <Button
                      size="lg"
                      disabled={true}
                      className="w-full sm:w-auto bg-slate-800/70 border border-slate-700/60 text-slate-500 font-semibold px-7 h-11 cursor-not-allowed opacity-60 shadow-none text-xs sm:text-sm"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Seleziona prima una Sala
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      disabled={true}
                      className="w-full sm:w-auto bg-slate-950/40 border-slate-800 text-slate-600 h-11 cursor-not-allowed opacity-60 text-xs sm:text-sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copia Link
                    </Button>
                  </div>

                  <div>
                    <a
                      href="/calendario"
                      className="text-[11px] text-slate-500 hover:text-slate-400 inline-flex items-center gap-1 transition-colors"
                    >
                      <Calendar className="h-3 w-3" />
                      Vuoi pianificare una riunione futura con inviti email? Vai su /calendario ➔
                    </a>
                  </div>
                </div>
              )}
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
