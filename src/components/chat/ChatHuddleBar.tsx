'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Headphones,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Maximize2,
  Minimize2,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface ChatHuddleBarProps {
  channelName: string
  currentUser: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
  huddleRequest: { mode: 'audio' | 'video'; seq: number } | null
  onNotifyStart?: (mode: 'audio' | 'video') => void
  onJoinedChange?: (joined: boolean) => void
}

interface HuddlePeerPresence {
  userId: string
  name: string
  avatarUrl?: string | null
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
}

interface RemotePeerState {
  userId: string
  name: string
  avatarUrl?: string | null
  stream: MediaStream | null
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
}

const RTC_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

function StreamMediaView({
  stream,
  muted,
  hasVideo,
}: {
  stream: MediaStream | null
  muted: boolean
  hasVideo: boolean
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (hasVideo && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
      }
    } else if (!hasVideo && audioRef.current) {
      if (audioRef.current.srcObject !== stream) {
        audioRef.current.srcObject = stream
      }
    }
  }, [stream, hasVideo])

  if (hasVideo) {
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
    )
  }

  return <audio ref={audioRef} autoPlay playsInline muted={muted} />
}

export function ChatHuddleBar({
  channelName,
  currentUser,
  huddleRequest,
  onNotifyStart,
  onJoinedChange,
}: ChatHuddleBarProps) {
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const [joined, setJoined] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [activePeers, setActivePeers] = useState<HuddlePeerPresence[]>([])
  const [remotePeers, setRemotePeers] = useState<Record<string, RemotePeerState>>({})
  const [localDisplayStream, setLocalDisplayStream] = useState<MediaStream | null>(null)

  const joinedRef = useRef(false)
  const audioEnabledRef = useRef(true)
  const videoEnabledRef = useRef(false)
  const screenSharingRef = useRef(false)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({})
  const remoteStreamsRef = useRef<Record<string, MediaStream>>({})
  const pendingIceRef = useRef<Record<string, RTCIceCandidateInit[]>>({})
  const activePeersRef = useRef<HuddlePeerPresence[]>([])
  const lastSeqRef = useRef<number | null>(null)

  const onJoinedChangeRef = useRef(onJoinedChange)
  const onNotifyStartRef = useRef(onNotifyStart)
  onJoinedChangeRef.current = onJoinedChange
  onNotifyStartRef.current = onNotifyStart

  const syncLocalDisplayStream = useCallback(() => {
    const camStream = localStreamRef.current
    const screenStream = screenStreamRef.current
    const screenVideoTrack = screenStream?.getVideoTracks()?.[0]
    const camVideoTrack = camStream?.getVideoTracks()?.[0]
    const activeVideoTrack = screenVideoTrack || (videoEnabledRef.current ? camVideoTrack : undefined)

    if (activeVideoTrack) {
      setLocalDisplayStream(new MediaStream([activeVideoTrack]))
    } else {
      setLocalDisplayStream(null)
    }
  }, [])

  const trackCurrentPresence = useCallback(
    async (overrides?: Partial<HuddlePeerPresence>) => {
      const ch = channelRef.current
      if (!ch || !joinedRef.current) return
      try {
        await ch.track({
          userId: currentUser.id,
          name: currentUser.full_name,
          avatarUrl: currentUser.avatar_url || null,
          audioEnabled: overrides?.audioEnabled ?? audioEnabledRef.current,
          videoEnabled: overrides?.videoEnabled ?? videoEnabledRef.current,
          screenSharing: overrides?.screenSharing ?? screenSharingRef.current,
        })
      } catch (err) {
        console.warn('[ChatHuddleBar] Presence track warning:', err)
      }
    },
    [currentUser.avatar_url, currentUser.full_name, currentUser.id]
  )

  const updateRemotePeersMetaFromPresence = useCallback((list: HuddlePeerPresence[]) => {
    setRemotePeers((prev) => {
      const next = { ...prev }
      for (const peer of list) {
        if (peer.userId === currentUser.id) continue
        if (next[peer.userId]) {
          next[peer.userId] = {
            ...next[peer.userId],
            name: peer.name,
            avatarUrl: peer.avatarUrl,
            audioEnabled: peer.audioEnabled,
            videoEnabled: peer.videoEnabled,
            screenSharing: peer.screenSharing,
          }
        }
      }
      return next
    })
  }, [currentUser.id])

  const closePeerConnection = useCallback((peerId: string) => {
    const pc = pcsRef.current[peerId]
    if (pc) {
      try {
        pc.onicecandidate = null
        pc.ontrack = null
        pc.onconnectionstatechange = null
        pc.close()
      } catch {
        // ignore
      }
      delete pcsRef.current[peerId]
    }
    delete remoteStreamsRef.current[peerId]
    delete pendingIceRef.current[peerId]
    setRemotePeers((prev) => {
      if (!prev[peerId]) return prev
      const next = { ...prev }
      delete next[peerId]
      return next
    })
  }, [])

  const attachLocalTracksToPc = useCallback((pc: RTCPeerConnection) => {
    const senders = pc.getSenders()
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0]
    if (audioTrack && !senders.some((s) => s.track?.kind === 'audio')) {
      pc.addTrack(audioTrack, localStreamRef.current!)
    }

    const screenVideoTrack = screenStreamRef.current?.getVideoTracks()?.[0]
    const camVideoTrack = videoEnabledRef.current
      ? localStreamRef.current?.getVideoTracks()?.[0]
      : undefined
    const videoTrack = screenVideoTrack || camVideoTrack
    const videoSourceStream = screenVideoTrack ? screenStreamRef.current : localStreamRef.current

    if (videoTrack && videoSourceStream) {
      const existingVideoSender =
        pc
          .getTransceivers()
          .find((t) => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video')
          ?.sender || senders.find((s) => s.track?.kind === 'video')
      if (existingVideoSender) {
        existingVideoSender.replaceTrack(videoTrack).catch(() => {})
      } else {
        pc.addTrack(videoTrack, videoSourceStream)
      }
    }
  }, [])

  const flushPendingIce = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const queued = pendingIceRef.current[peerId]
    if (!queued || queued.length === 0) return
    pendingIceRef.current[peerId] = []
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.warn('[ChatHuddleBar] ICE flush warning:', err)
      }
    }
  }, [])

  const getOrCreatePeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = pcsRef.current[peerId]
      if (existing && existing.connectionState !== 'closed') {
        return existing
      }

      const pc = new RTCPeerConnection(RTC_ICE_SERVERS)
      pcsRef.current[peerId] = pc

      attachLocalTracksToPc(pc)

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'webrtc-ice',
            payload: {
              to: peerId,
              from: currentUser.id,
              candidate: event.candidate.toJSON(),
            },
          })
        }
      }

      pc.ontrack = (event) => {
        let stream = remoteStreamsRef.current[peerId]
        if (!stream) {
          stream = new MediaStream()
          remoteStreamsRef.current[peerId] = stream
        }
        if (event.streams && event.streams[0]) {
          for (const tr of event.streams[0].getTracks()) {
            if (!stream.getTracks().some((t) => t.id === tr.id)) {
              stream.addTrack(tr)
            }
          }
        } else if (event.track && !stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track)
        }

        const meta = activePeersRef.current.find((p) => p.userId === peerId)
        setRemotePeers((prev) => ({
          ...prev,
          [peerId]: {
            userId: peerId,
            name: meta?.name || prev[peerId]?.name || 'Partecipante',
            avatarUrl: meta?.avatarUrl ?? prev[peerId]?.avatarUrl ?? null,
            stream,
            audioEnabled: meta?.audioEnabled ?? prev[peerId]?.audioEnabled ?? true,
            videoEnabled: meta?.videoEnabled ?? prev[peerId]?.videoEnabled ?? false,
            screenSharing: meta?.screenSharing ?? prev[peerId]?.screenSharing ?? false,
          },
        }))
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeerConnection(peerId)
        }
      }

      return pc
    },
    [attachLocalTracksToPc, closePeerConnection, currentUser.id]
  )

  const sendOfferToPeer = useCallback(
    async (peerId: string) => {
      const ch = channelRef.current
      if (!ch || !joinedRef.current) return
      try {
        const pc = getOrCreatePeerConnection(peerId)
        attachLocalTracksToPc(pc)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ch.send({
          type: 'broadcast',
          event: 'webrtc-offer',
          payload: {
            to: peerId,
            from: currentUser.id,
            sdp: pc.localDescription,
          },
        })
      } catch (err) {
        console.warn('[ChatHuddleBar] Offer creation error:', err)
      }
    },
    [attachLocalTracksToPc, currentUser.id, getOrCreatePeerConnection]
  )

  const leaveHuddle = useCallback(
    (notifyRemote = true) => {
      if (notifyRemote && channelRef.current && joinedRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'peer-leave',
            payload: { from: currentUser.id },
          })
          channelRef.current.untrack()
        } catch {
          // ignore
        }
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }

      for (const peerId of Object.keys(pcsRef.current)) {
        closePeerConnection(peerId)
      }

      joinedRef.current = false
      audioEnabledRef.current = true
      videoEnabledRef.current = false
      screenSharingRef.current = false

      setJoined(false)
      setIsConnecting(false)
      setAudioEnabled(true)
      setVideoEnabled(false)
      setScreenSharing(false)
      setLocalDisplayStream(null)
      setRemotePeers({})
      setErrorMsg(null)
      onJoinedChangeRef.current?.(false)
    },
    [closePeerConnection, currentUser.id]
  )

  const joinHuddle = useCallback(
    async (mode: 'audio' | 'video', triggeredByRequest = false) => {
      if (joinedRef.current || isConnecting) return
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Il browser non supporta microfono/videocamera WebRTC.')
        return
      }

      setIsConnecting(true)
      setErrorMsg(null)

      try {
        const wantVideo = mode === 'video'
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: wantVideo,
        })

        localStreamRef.current = stream
        audioEnabledRef.current = true
        videoEnabledRef.current = wantVideo
        screenSharingRef.current = false
        joinedRef.current = true

        setAudioEnabled(true)
        setVideoEnabled(wantVideo)
        setScreenSharing(false)
        setJoined(true)
        setIsExpanded(true)
        syncLocalDisplayStream()
        onJoinedChangeRef.current?.(true)

        const remoteCountAtJoin = activePeersRef.current.filter(
          (p) => p.userId !== currentUser.id
        ).length

        await trackCurrentPresence({
          audioEnabled: true,
          videoEnabled: wantVideo,
          screenSharing: false,
        })

        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'peer-join',
            payload: { from: currentUser.id },
          })
        }

        if (remoteCountAtJoin === 0 || triggeredByRequest) {
          onNotifyStartRef.current?.(mode)
        }
      } catch (err: any) {
        console.error('[ChatHuddleBar] getUserMedia error:', err)
        setErrorMsg(
          err?.name === 'NotAllowedError'
            ? 'Permesso microfono/videocamera negato.'
            : 'Impossibile accedere a microfono o videocamera.'
        )
        leaveHuddle(false)
      } finally {
        setIsConnecting(false)
      }
    },
    [
      currentUser.id,
      isConnecting,
      leaveHuddle,
      syncLocalDisplayStream,
      trackCurrentPresence,
    ]
  )

  const updateVideoTrackOnAllPeers = useCallback(
    async (nextTrack: MediaStreamTrack | null, sourceStream: MediaStream | null) => {
      const peerIds = Object.keys(pcsRef.current)
      for (const peerId of peerIds) {
        const pc = pcsRef.current[peerId]
        if (!pc) continue
        const existingVideoSender =
          pc
            .getTransceivers()
            .find((t) => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video')
            ?.sender || pc.getSenders().find((s) => s.track?.kind === 'video')

        if (existingVideoSender) {
          try {
            await existingVideoSender.replaceTrack(nextTrack)
          } catch (err) {
            console.warn('[ChatHuddleBar] replaceTrack warning:', err)
          }
        } else if (nextTrack && sourceStream) {
          pc.addTrack(nextTrack, sourceStream)
          await sendOfferToPeer(peerId)
        }
      }
    },
    [sendOfferToPeer]
  )

  const toggleAudio = async () => {
    const next = !audioEnabledRef.current
    audioEnabledRef.current = next
    setAudioEnabled(next)
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = next
    })
    await trackCurrentPresence({ audioEnabled: next })
  }

  const toggleVideo = async () => {
    if (!joinedRef.current) return
    const next = !videoEnabledRef.current

    if (next) {
      let camTrack = localStreamRef.current?.getVideoTracks()?.[0] || null
      if (!camTrack) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true })
          camTrack = camStream.getVideoTracks()[0] || null
          if (camTrack && localStreamRef.current) {
            localStreamRef.current.addTrack(camTrack)
          } else if (camTrack) {
            localStreamRef.current = camStream
          }
        } catch (err) {
          console.error('[ChatHuddleBar] Errore attivazione cam:', err)
          setErrorMsg('Impossibile attivare la videocamera.')
          return
        }
      } else {
        camTrack.enabled = true
      }

      videoEnabledRef.current = true
      setVideoEnabled(true)

      if (!screenSharingRef.current && camTrack && localStreamRef.current) {
        await updateVideoTrackOnAllPeers(camTrack, localStreamRef.current)
      }
    } else {
      videoEnabledRef.current = false
      setVideoEnabled(false)
      localStreamRef.current?.getVideoTracks().forEach((t) => {
        t.enabled = false
        t.stop()
        localStreamRef.current?.removeTrack(t)
      })
      if (!screenSharingRef.current) {
        await updateVideoTrackOnAllPeers(null, null)
      }
    }

    syncLocalDisplayStream()
    await trackCurrentPresence({ videoEnabled: videoEnabledRef.current })
  }

  const stopScreenShareInternal = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => {
        t.onended = null
        t.stop()
      })
      screenStreamRef.current = null
    }
    screenSharingRef.current = false
    setScreenSharing(false)

    const fallbackCamTrack =
      videoEnabledRef.current ? localStreamRef.current?.getVideoTracks()?.[0] || null : null
    await updateVideoTrackOnAllPeers(
      fallbackCamTrack,
      fallbackCamTrack ? localStreamRef.current : null
    )
    syncLocalDisplayStream()
    await trackCurrentPresence({ screenSharing: false })
  }, [syncLocalDisplayStream, trackCurrentPresence, updateVideoTrackOnAllPeers])

  const toggleScreenShare = async () => {
    if (!joinedRef.current) return

    if (screenSharingRef.current) {
      await stopScreenShareInternal()
      return
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setErrorMsg('Condivisione schermo non supportata dal browser.')
      return
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      const screenTrack = displayStream.getVideoTracks()[0]
      if (!screenTrack) return

      screenTrack.onended = () => {
        stopScreenShareInternal()
      }

      screenStreamRef.current = displayStream
      screenSharingRef.current = true
      setScreenSharing(true)

      await updateVideoTrackOnAllPeers(screenTrack, displayStream)
      syncLocalDisplayStream()
      await trackCurrentPresence({ screenSharing: true })
    } catch (err) {
      console.warn('[ChatHuddleBar] Screen share annullata o fallita:', err)
    }
  }

  // Subscription Realtime per canale
  useEffect(() => {
    const supabase = supabaseRef.current
    const roomChannel = supabase.channel(`huddle:${channelName}`, {
      config: { presence: { key: currentUser.id } },
    })
    channelRef.current = roomChannel

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState<HuddlePeerPresence>()
        const dedup = new Map<string, HuddlePeerPresence>()
        for (const key of Object.keys(state)) {
          const entries = state[key]
          if (Array.isArray(entries) && entries.length > 0) {
            const latest = entries[entries.length - 1]
            if (latest?.userId) {
              dedup.set(latest.userId, latest)
            }
          }
        }
        const list = Array.from(dedup.values())
        activePeersRef.current = list
        setActivePeers(list)
        updateRemotePeersMetaFromPresence(list)

        const presentIds = new Set(list.map((p) => p.userId))
        for (const peerId of Object.keys(pcsRef.current)) {
          if (!presentIds.has(peerId)) {
            closePeerConnection(peerId)
          }
        }
      })
      .on('broadcast', { event: 'peer-join' }, async ({ payload }) => {
        const from = payload?.from as string | undefined
        if (!from || from === currentUser.id || !joinedRef.current) return
        await sendOfferToPeer(from)
      })
      .on('broadcast', { event: 'peer-leave' }, ({ payload }) => {
        const from = payload?.from as string | undefined
        if (!from || from === currentUser.id) return
        closePeerConnection(from)
      })
      .on('broadcast', { event: 'webrtc-offer' }, async ({ payload }) => {
        const to = payload?.to as string | undefined
        const from = payload?.from as string | undefined
        const sdp = payload?.sdp as RTCSessionDescriptionInit | undefined
        if (!to || !from || !sdp || to !== currentUser.id || !joinedRef.current) return

        try {
          const pc = getOrCreatePeerConnection(from)
          if (pc.signalingState !== 'stable') {
            if (currentUser.id < from) {
              await pc.setLocalDescription({ type: 'rollback' })
            } else {
              return
            }
          }

          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          await flushPendingIce(from, pc)
          attachLocalTracksToPc(pc)

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          roomChannel.send({
            type: 'broadcast',
            event: 'webrtc-answer',
            payload: {
              to: from,
              from: currentUser.id,
              sdp: pc.localDescription,
            },
          })
        } catch (err) {
          console.warn('[ChatHuddleBar] Handle offer error:', err)
        }
      })
      .on('broadcast', { event: 'webrtc-answer' }, async ({ payload }) => {
        const to = payload?.to as string | undefined
        const from = payload?.from as string | undefined
        const sdp = payload?.sdp as RTCSessionDescriptionInit | undefined
        if (!to || !from || !sdp || to !== currentUser.id || !joinedRef.current) return

        try {
          const pc = pcsRef.current[from]
          if (!pc) return
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          await flushPendingIce(from, pc)
        } catch (err) {
          console.warn('[ChatHuddleBar] Handle answer error:', err)
        }
      })
      .on('broadcast', { event: 'webrtc-ice' }, async ({ payload }) => {
        const to = payload?.to as string | undefined
        const from = payload?.from as string | undefined
        const candidate = payload?.candidate as RTCIceCandidateInit | undefined
        if (!to || !from || !candidate || to !== currentUser.id || !joinedRef.current) return

        const pc = pcsRef.current[from]
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.warn('[ChatHuddleBar] addIceCandidate warning:', err)
          }
        } else {
          if (!pendingIceRef.current[from]) {
            pendingIceRef.current[from] = []
          }
          pendingIceRef.current[from].push(candidate)
        }
      })
      .subscribe()

    return () => {
      leaveHuddle(true)
      activePeersRef.current = []
      setActivePeers([])
      channelRef.current = null
      supabase.removeChannel(roomChannel)
    }
  }, [
    attachLocalTracksToPc,
    channelName,
    closePeerConnection,
    currentUser.id,
    flushPendingIce,
    getOrCreatePeerConnection,
    leaveHuddle,
    sendOfferToPeer,
    updateRemotePeersMetaFromPresence,
  ])

  // Reagisci alle richieste provenienti dall'header chat
  useEffect(() => {
    if (!huddleRequest) return
    if (lastSeqRef.current === huddleRequest.seq) return
    lastSeqRef.current = huddleRequest.seq

    if (!joinedRef.current) {
      joinHuddle(huddleRequest.mode, true)
    } else {
      setIsExpanded(true)
      if (huddleRequest.mode === 'video' && !videoEnabledRef.current) {
        toggleVideo()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huddleRequest?.seq])

  const remotePresencePeers = activePeers.filter((p) => p.userId !== currentUser.id)
  const remotePresenceCount = remotePresencePeers.length

  if (!joined && remotePresenceCount === 0) {
    if (!errorMsg) return null
    return (
      <div className="px-3 sm:px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 shrink-0">
        <span>{errorMsg}</span>
        <button
          type="button"
          onClick={() => setErrorMsg(null)}
          className="font-semibold underline ml-3"
        >
          Chiudi
        </button>
      </div>
    )
  }

  if (!joined && remotePresenceCount > 0) {
    return (
      <div className="px-3 sm:px-4 py-2 bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">
            🟢 In vocale ora: {remotePresencePeers.map((p) => p.name.split(' ')[0]).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => joinHuddle('audio', false)}
            disabled={isConnecting}
            className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Unisciti</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => joinHuddle('video', false)}
            disabled={isConnecting}
            className="h-7 px-2.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 gap-1"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Video</span>
          </Button>
        </div>
      </div>
    )
  }

  const remoteList = Object.values(remotePeers)
  const totalConnected = 1 + Math.max(remoteList.length, remotePresenceCount)

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white shrink-0">
      {/* Top Huddle Control Bar */}
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[10px] px-2 py-0.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE • {totalConnected} connessi</span>
          </Badge>
          {errorMsg && <span className="text-[11px] text-rose-400">{errorMsg}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleAudio}
            className={`h-7 px-2.5 text-xs gap-1 ${
              audioEnabled
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-rose-600/90 text-white hover:bg-rose-600'
            }`}
            title={audioEnabled ? 'Disattiva microfono' : 'Attiva microfono'}
          >
            {audioEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Mic' : 'Mutato'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleVideo}
            className={`h-7 px-2.5 text-xs gap-1 ${
              videoEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={videoEnabled ? 'Spegni videocamera' : 'Attiva videocamera'}
          >
            {videoEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{videoEnabled ? 'Video' : 'Cam Off'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleScreenShare}
            className={`h-7 px-2.5 text-xs gap-1 ${
              screenSharing
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Condividi schermo"
          >
            <MonitorUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{screenSharing ? 'Stop Schermo' : 'Schermo'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded((v) => !v)}
            className="h-7 w-7 p-0 bg-slate-800 text-slate-300 hover:bg-slate-700"
            title={isExpanded ? 'Comprimi stanza' : 'Espandi stanza'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => leaveHuddle(true)}
            className="h-7 px-2.5 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1"
            title="Esci dalla stanza live"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Esci</span>
          </Button>
        </div>
      </div>

      {/* Persistent remote audio elements so audio never interrupts on expand/collapse or cam toggle */}
      <div className="hidden">
        {remoteList.map((peer) => (
          <StreamMediaView
            key={`audio-${peer.userId}`}
            stream={peer.stream}
            muted={false}
            hasVideo={false}
          />
        ))}
      </div>

      {/* Expanded Participants Grid */}
      {isExpanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto">
          {/* Local User Card */}
          <div className="relative rounded-xl bg-slate-800 border border-slate-700 overflow-hidden aspect-video sm:aspect-[16/9] flex items-center justify-center min-h-[110px]">
            {localDisplayStream && (videoEnabled || screenSharing) ? (
              <StreamMediaView stream={localDisplayStream} muted={true} hasVideo={true} />
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Avatar
                  fallback={currentUser.full_name}
                  src={currentUser.avatar_url || undefined}
                  className="h-11 w-11 bg-blue-600 text-white font-bold text-sm border border-blue-400/50"
                />
                <span className="text-[11px] text-slate-300 font-medium">Tu</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-slate-950/75 text-[10px] font-semibold text-white truncate">
                {currentUser.full_name} (Tu){screenSharing ? ' • Schermo' : ''}
              </span>
              <span className="p-1 rounded bg-slate-950/75">
                {audioEnabled ? (
                  <Mic className="h-3 w-3 text-emerald-400" />
                ) : (
                  <MicOff className="h-3 w-3 text-rose-400" />
                )}
              </span>
            </div>
          </div>

          {/* Remote Peers Cards */}
          {remoteList.map((peer) => {
            const peerHasVideo = Boolean(
              peer.stream &&
                peer.stream.getVideoTracks().length > 0 &&
                (peer.videoEnabled || peer.screenSharing)
            )
            return (
              <div
                key={peer.userId}
                className="relative rounded-xl bg-slate-800 border border-slate-700 overflow-hidden aspect-video sm:aspect-[16/9] flex items-center justify-center min-h-[110px]"
              >
                {peerHasVideo ? (
                  <StreamMediaView stream={peer.stream} muted={true} hasVideo={true} />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Avatar
                      fallback={peer.name}
                      src={peer.avatarUrl || undefined}
                      className="h-11 w-11 bg-emerald-600 text-white font-bold text-sm border border-emerald-400/50"
                    />
                    <span className="text-[11px] text-slate-300 font-medium">{peer.name}</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-slate-950/75 text-[10px] font-semibold text-white truncate">
                    {peer.name}
                    {peer.screenSharing ? ' • Schermo' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    {peer.videoEnabled && (
                      <span className="p-1 rounded bg-slate-950/75">
                        <Video className="h-3 w-3 text-blue-400" />
                      </span>
                    )}
                    <span className="p-1 rounded bg-slate-950/75">
                      {peer.audioEnabled ? (
                        <Mic className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <MicOff className="h-3 w-3 text-rose-400" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {remoteList.length === 0 && (
            <div className="rounded-xl bg-slate-800/50 border border-dashed border-slate-700 flex flex-col items-center justify-center p-4 text-center min-h-[110px]">
              <Users className="h-5 w-5 text-slate-400 mb-1" />
              <p className="text-xs text-slate-300 font-medium">In attesa di altri partecipanti...</p>
              <p className="text-[10px] text-slate-400">
                Gli utenti nel canale possono unirsi con 1 click.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
