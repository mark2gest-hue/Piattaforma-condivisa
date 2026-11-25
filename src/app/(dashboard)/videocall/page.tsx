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
  GraduationCap,
  Handshake,
  Wrench,
  MessageCircle,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  icon: LucideIcon
}

const MEET_ROOMS: MeetRoom[] = [
  {
    id: 'team',
    title: 'Stanza Riservata Soci',
    badge: 'STANZA PROTETTA',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    desc: 'Stanza Google Meet fissa per allineamenti rapidi e decisioni operative riservate tra i soci.',
    shortDesc: 'Allineamento interno soci',
    url: 'https://meet.google.com/mth-rqxp-bdf',
    shortUrl: 'meet.google.com/mth-rqxp-bdf',
    target: 'Riservata ai 3 Soci',
    icon: Users,
  },
  {
    id: 'masterclass',
    title: 'Masterclass Corsisti',
    badge: 'DIRETTE & Q&A',
    badgeColor: 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/25',
    desc: "Stanza d'aula live per le lezioni del giovedì sera e sessioni di domande e risposte con gli studenti.",
    shortDesc: 'Dirette live del giovedì',
    url: 'https://meet.google.com/wsv-bqxm-bvr',
    shortUrl: 'meet.google.com/wsv-bqxm-bvr',
    target: 'Accessibile agli Studenti',
    icon: GraduationCap,
  },
  {
    id: 'clients',
    title: 'Clienti & Briefing B2B',
    badge: 'COMMERCIALE / PMI',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    desc: 'Stanza isolata per audit, call conoscitive e consulenze strategiche riservate con aziende.',
    shortDesc: 'Audit e call PMI riservate',
    url: 'https://meet.google.com/yme-pyws-osa',
    shortUrl: 'meet.google.com/yme-pyws-osa',
    target: 'Audit & Clienti PMI',
    icon: Handshake,
  },
  {
    id: 'lab',
    title: 'Lab Agenti AI Pro',
    badge: 'LABORATORIO AVANZATO',
    badgeColor: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/25',
    desc: 'Laboratorio tecnico per flussi n8n, framework multi-agente e architetture complesse.',
    shortDesc: 'Test tecnici & agenti',
    url: 'https://meet.google.com/dwe-rczj-uxz',
    shortUrl: 'meet.google.com/dwe-rczj-uxz',
    target: 'Sessioni Tecniche Pro',
    icon: Wrench,
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
    <div className="h-full flex flex-col overflow-hidden bg-[#f7f6f3] dark:bg-[#0d0d0f] text-[#111113] dark:text-[#f4f4f5]">
      {/* Command Bar */}
      <div className="min-h-[52px] px-5 py-2 border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Video className="h-4 w-4 text-[#6366f1] shrink-0" />
          <h1 className="text-sm font-semibold tracking-tight text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)] truncate">
            Videocall & Riunioni Team
          </h1>
          <span className="hidden sm:inline-block text-[11px] font-[family-name:var(--font-mono)] text-zinc-500 dark:text-zinc-400 border-l border-[#e5e3dc] dark:border-white/[0.08] pl-3">
            {provider === 'google_meet' ? `${MEET_ROOMS.length} stanze` : 'WebRTC Jitsi'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Selettore Provider: Google Meet Pro vs WebRTC Free */}
          <div className="bg-[#f7f6f3] dark:bg-[#141417] p-0.5 rounded-md flex items-center gap-0.5 border border-[#e5e3dc] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setProvider('google_meet')
                setInCall(false)
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                provider === 'google_meet'
                  ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              Google Meet Pro
            </button>
            <button
              type="button"
              onClick={() => {
                setProvider('jitsi')
                setInCall(false)
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                provider === 'jitsi'
                  ? 'bg-[#111113] text-white dark:bg-[#f4f4f5] dark:text-[#0d0d0f]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5]'
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
            className={`h-8 text-xs bg-[#ffffff] dark:bg-[#141417] text-[#111113] dark:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] gap-1.5 border-[#e5e3dc] dark:border-white/[0.08] ${
              provider === 'google_meet' && !currentRoom ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Nuova scheda
          </Button>
        </div>
      </div>

      {/* Main Room Viewport */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {provider === 'google_meet' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Strip delle 4 Stanze — Swiss Hairline */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#e5e3dc] dark:divide-white/[0.08] border-b border-[#e5e3dc] dark:border-white/[0.08] bg-[#ffffff] dark:bg-[#111114] shrink-0">
              {MEET_ROOMS.map((room) => {
                const isSelected = selectedRoomId === room.id
                const RoomIcon = room.icon
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`px-4 py-3 text-left transition-colors cursor-pointer flex items-center justify-between gap-3 relative ${
                      isSelected
                        ? 'bg-[#6366f1]/[0.06] dark:bg-[#6366f1]/[0.12]'
                        : 'hover:bg-[#f7f6f3] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]'
                            : 'border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        <RoomIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate text-[#111113] dark:text-[#f4f4f5]">
                          {room.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {room.shortDesc}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isSelected ? 'bg-[#6366f1]' : 'bg-[#e5e3dc] dark:bg-white/15'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            {/* Area Centrale Stanza */}
            <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4 sm:p-8 bg-[#f7f6f3] dark:bg-[#0d0d0f]">
              {currentRoom ? (
                (() => {
                  const CurrentIcon = currentRoom.icon
                  return (
                    <div className="w-full max-w-2xl bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg divide-y divide-[#e5e3dc] dark:divide-white/[0.08]">
                      <div className="p-6 flex items-start gap-4">
                        <div className="relative h-12 w-12 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-center shrink-0 text-[#6366f1]">
                          <CurrentIcon className="h-5 w-5" />
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#ffffff] dark:ring-[#111114]" />
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-semibold text-[#111113] dark:text-[#f4f4f5] tracking-tight font-[family-name:var(--font-jakarta)]">
                              {currentRoom.title}
                            </h2>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium tracking-wide font-[family-name:var(--font-mono)] ${currentRoom.badgeColor}`}
                            >
                              {currentRoom.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {currentRoom.desc}
                          </p>
                        </div>
                      </div>

                      {/* Specifiche Tecniche */}
                      <div className="px-6 py-4 bg-[#f7f6f3]/60 dark:bg-[#141417] space-y-2.5">
                        <div className="flex items-center justify-between gap-3 text-xs pb-2 border-b border-[#e5e3dc] dark:border-white/[0.08]">
                          <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Crittografia Google Enterprise
                          </span>
                          <span className="font-[family-name:var(--font-mono)] text-[#6366f1] font-medium text-[11px] truncate">
                            {currentRoom.shortUrl}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{currentRoom.target}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <Sparkles className="h-3.5 w-3.5 text-[#6366f1] shrink-0" />
                            <span className="truncate">Link permanente (no scadenza)</span>
                          </div>
                        </div>
                      </div>

                      {/* Azioni */}
                      <div className="p-6 flex flex-col sm:flex-row items-center gap-2.5">
                        <Button
                          size="lg"
                          onClick={() => window.open(currentRoom.url, '_blank')}
                          className="w-full sm:flex-1 bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] font-medium h-10 cursor-pointer text-xs sm:text-sm"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Entra nella Stanza
                          <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-70" />
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleCopyLink(currentRoom.url)}
                          className="w-full sm:w-auto bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] h-10 cursor-pointer text-xs sm:text-sm px-5"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-emerald-500" />
                              Link Copiato
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copia Link
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Footer Link Telegram / Calendario */}
                      <div className="px-6 py-3 bg-[#f7f6f3]/40 dark:bg-[#111114] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        {currentRoom.id === 'masterclass' ? (
                          <a
                            href="https://t.me/+QSql9PpGLlMzYmI0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#6366f1] hover:underline font-medium"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Gruppo Telegram Corsisti (Aiutiamoci Corsi)</span>
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-[11px] font-[family-name:var(--font-mono)] text-zinc-500 dark:text-zinc-400">
                            ROOM ID: {currentRoom.id.toUpperCase()}
                          </span>
                        )}

                        <a
                          href="/calendario"
                          className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Calendar className="h-3 w-3" />
                          Pianifica con inviti email su /calendario
                        </a>
                      </div>
                    </div>
                  )
                })()
              ) : (
                /* Stato Neutro quando nessuna stanza è selezionata */
                <div className="w-full max-w-xl bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg divide-y divide-[#e5e3dc] dark:divide-white/[0.08]">
                  <div className="p-8 text-center space-y-3">
                    <div className="mx-auto h-11 w-11 rounded-md border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-[#111113] dark:text-[#f4f4f5] tracking-tight font-[family-name:var(--font-jakarta)]">
                          Scegli una Sala Riunioni
                        </h2>
                        <span className="px-2 py-0.5 rounded border border-[#e5e3dc] dark:border-white/[0.08] bg-[#f7f6f3] dark:bg-[#141417] text-zinc-500 dark:text-zinc-400 text-[10px] font-[family-name:var(--font-mono)]">
                          IN ATTESA
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                        Seleziona una delle 4 sale in alto (Soci, Masterclass, Clienti o Lab) per sbloccare l&apos;accesso e visualizzare il link protetto.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-[#f7f6f3]/60 dark:bg-[#141417] flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>Nessuna stanza selezionata. Scegli una sala dalla barra superiore.</span>
                  </div>

                  <div className="p-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <Button
                      size="lg"
                      disabled
                      className="w-full sm:flex-1 bg-[#f7f6f3] dark:bg-[#141417] border border-[#e5e3dc] dark:border-white/[0.08] text-zinc-400 dark:text-zinc-500 font-medium h-10 cursor-not-allowed shadow-none text-xs sm:text-sm"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Seleziona prima una Sala
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled
                      className="w-full sm:w-auto bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-zinc-400 dark:text-zinc-500 h-10 cursor-not-allowed text-xs sm:text-sm px-5"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copia Link
                    </Button>
                  </div>

                  <div className="px-6 py-3 text-center">
                    <a
                      href="/calendario"
                      className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-[#111113] dark:hover:text-[#f4f4f5] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Calendar className="h-3 w-3" />
                      Vuoi pianificare una riunione futura con inviti email? Vai su /calendario
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
          <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-[#f7f6f3] dark:bg-[#0d0d0f]">
            <div className="w-full max-w-md bg-[#ffffff] dark:bg-[#111114] border border-[#e5e3dc] dark:border-white/[0.08] rounded-lg divide-y divide-[#e5e3dc] dark:divide-white/[0.08]">
              <div className="p-6 text-center space-y-3">
                <div className="h-11 w-11 rounded-md bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/25 flex items-center justify-center mx-auto">
                  <Video className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-[#111113] dark:text-[#f4f4f5] font-[family-name:var(--font-jakarta)]">
                    Stanza WebRTC Integrata (Jitsi)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Stanza aperta e gratuita direttamente all&apos;interno della pagina senza login.
                  </p>
                </div>
              </div>

              <div className="p-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Button
                  size="lg"
                  onClick={() => setInCall(true)}
                  className="w-full sm:flex-1 bg-[#111113] hover:bg-[#111113]/90 text-white dark:bg-[#f4f4f5] dark:hover:bg-[#f4f4f5]/90 dark:text-[#0d0d0f] font-medium h-10 cursor-pointer text-xs sm:text-sm"
                >
                  Entra nella Stanza
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(jitsiRoomUrl, '_blank')}
                  className="w-full sm:w-auto bg-[#ffffff] dark:bg-[#141417] border-[#e5e3dc] dark:border-white/[0.08] text-[#111113] dark:text-[#f4f4f5] hover:bg-[#f7f6f3] dark:hover:bg-white/[0.04] h-10 cursor-pointer text-xs sm:text-sm"
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
