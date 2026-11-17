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
  SlidersHorizontal,
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
  sessionId?: string
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

interface DeviceItem {
  deviceId: string
  label: string
  groupId?: string
}

const RTC_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

function isContinuityOrPhoneDevice(label: string): boolean {
  return /iphone|ipad|continuity|fotocamera di|microfono di/i.test(label || '')
}

function isDesktopClient(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '')
  )
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

  const trackSignature = stream
    ? stream
        .getTracks()
        .map((t) => `${t.kind}:${t.id}:${t.readyState}`)
        .join('|')
    : ''

  useEffect(() => {
    if (hasVideo && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
      }
      videoRef.current.play().catch(() => {})
    } else if (!hasVideo && audioRef.current) {
      if (audioRef.current.srcObject !== stream) {
        audioRef.current.srcObject = stream
      }
      audioRef.current.play().catch(() => {})
    }
  }, [stream, hasVideo, trackSignature])

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

  const clientSessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  )

  const [joined, setJoined] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [audioInputs, setAudioInputs] = useState<DeviceItem[]>([])
  const [videoInputs, setVideoInputs] = useState<DeviceItem[]>([])
  const [selectedAudioInputId, setSelectedAudioInputId] = useState<string | null>(null)
  const [selectedVideoInputId, setSelectedVideoInputId] = useState<string | null>(null)
  const [showDeviceSettings, setShowDeviceSettings] = useState(false)

  const selectedAudioInputIdRef = useRef<string | null>(null)
  const selectedVideoInputIdRef = useRef<string | null>(null)
  selectedAudioInputIdRef.current = selectedAudioInputId
  selectedVideoInputIdRef.current = selectedVideoInputId

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

  const pickBestDevice = useCallback(
    (
      devices: MediaDeviceInfo[],
      kind: 'audioinput' | 'videoinput',
      manualId?: string | null
    ): string | undefined => {
      const matching = devices.filter((d) => d.kind === kind && d.deviceId)
      if (matching.length === 0) return undefined

      if (manualId && matching.some((d) => d.deviceId === manualId)) {
        return manualId
      }

      const isDesktop = isDesktopClient()
      const candidates = isDesktop
        ? matching.filter((d) => !isContinuityOrPhoneDevice(d.label))
        : matching

      const pool = candidates.length > 0 ? candidates : matching

      const builtIn = pool.find(
        (d) =>
          /built-in|integrat|facetime|macbook|imac|mac mini|studio display|internal/i.test(d.label) &&
          d.deviceId !== 'default' &&
          d.deviceId !== 'communications'
      )
      if (builtIn) return builtIn.deviceId

      const nonDefault = pool.find(
        (d) => d.deviceId !== 'default' && d.deviceId !== 'communications'
      )
      if (nonDefault) return nonDefault.deviceId

      return pool[0]?.deviceId
    },
    []
  )

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const audios: DeviceItem[] = all
        .filter((d) => d.kind === 'audioinput' && d.deviceId)
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Microfono ${idx + 1}`,
          groupId: d.groupId,
        }))
      const videos: DeviceItem[] = all
        .filter((d) => d.kind === 'videoinput' && d.deviceId)
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Videocamera ${idx + 1}`,
          groupId: d.groupId,
        }))

      setAudioInputs(audios)
      setVideoInputs(videos)
    } catch (err) {
      console.warn('[ChatHuddleBar] enumerateDevices warning:', err)
    }
  }, [])

  useEffect(() => {
    refreshDevices()
    const handler = () => {
      refreshDevices()
    }
    navigator.mediaDevices?.addEventListener?.('devicechange', handler)
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', handler)
    }
  }, [refreshDevices])

  const syncLocalDisplayStream = useCallback(() => {
    const camStream = localStreamRef.current
    const screenStream = screenStreamRef.current
    const screenVideoTrack = screenStream?.getVideoTracks()?.[0]
    const camVideoTrack = camStream?.getVideoTracks()?.[0]
    const activeVideoTrack =
      screenVideoTrack || (videoEnabledRef.current ? camVideoTrack : undefined)

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
          sessionId: clientSessionIdRef.current,
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

  const updateRemotePeersMetaFromPresence = useCallback(
    (list: HuddlePeerPresence[]) => {
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
    },
    [currentUser.id]
  )

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

  const attachLocalTracksToPc = useCallback(async (pc: RTCPeerConnection): Promise<void> => {
    const senders = pc.getSenders()
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0]
    if (audioTrack) {
      const audioTransceiver = pc
        .getTransceivers()
        .find((t) => t.receiver?.track?.kind === 'audio' || t.sender?.track?.kind === 'audio')
      if (audioTransceiver) {
        audioTransceiver.direction = 'sendrecv'
        await audioTransceiver.sender.replaceTrack(audioTrack).catch(() => {})
      } else if (!senders.some((s) => s.track?.kind === 'audio')) {
        pc.addTrack(audioTrack, localStreamRef.current!)
      }
    }

    const screenVideoTrack = screenStreamRef.current?.getVideoTracks()?.[0]
    const camVideoTrack = videoEnabledRef.current
      ? localStreamRef.current?.getVideoTracks()?.[0]
      : undefined
    const videoTrack = screenVideoTrack || camVideoTrack
    const videoSourceStream = screenVideoTrack ? screenStreamRef.current : localStreamRef.current

    const videoTransceiver = pc
      .getTransceivers()
      .find((t) => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video')

    if (videoTrack && videoSourceStream) {
      if (videoTransceiver) {
        videoTransceiver.direction = 'sendrecv'
        await videoTransceiver.sender.replaceTrack(videoTrack).catch(() => {})
      } else {
        pc.addTrack(videoTrack, videoSourceStream)
      }
    } else if (videoTransceiver) {
      if (videoTransceiver.direction !== 'recvonly') {
        videoTransceiver.direction = 'recvonly'
        await videoTransceiver.sender.replaceTrack(null).catch(() => {})
      }
    } else {
      try {
        pc.addTransceiver('video', { direction: 'recvonly' })
      } catch {
        // fallback
      }
    }
  }, [])

  const getOrCreatePeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = pcsRef.current[peerId]
      if (existing) {
        if (existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
          return existing
        }
        if (existing.connectionState === 'failed') {
          closePeerConnection(peerId)
        }
      }

      const pc = new RTCPeerConnection(RTC_ICE_SERVERS)
      pcsRef.current[peerId] = pc

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

        const updatePeerStreamInstance = () => {
          const curStream = remoteStreamsRef.current[peerId]
          if (!curStream) return
          const nextStream = new MediaStream(curStream.getTracks())
          remoteStreamsRef.current[peerId] = nextStream
          const meta = activePeersRef.current.find((p) => p.userId === peerId)
          setRemotePeers((prev) => ({
            ...prev,
            [peerId]: {
              userId: peerId,
              name: meta?.name || prev[peerId]?.name || 'Partecipante',
              avatarUrl: meta?.avatarUrl ?? prev[peerId]?.avatarUrl ?? null,
              stream: nextStream,
              audioEnabled: meta?.audioEnabled ?? prev[peerId]?.audioEnabled ?? true,
              videoEnabled: meta?.videoEnabled ?? prev[peerId]?.videoEnabled ?? false,
              screenSharing: meta?.screenSharing ?? prev[peerId]?.screenSharing ?? false,
            },
          }))
        }

        event.track.onunmute = () => {
          updatePeerStreamInstance()
        }

        updatePeerStreamInstance()
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeerConnection(peerId)
        }
      }

      return pc
    },
    [closePeerConnection, currentUser.id]
  )

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

  const sendOfferToPeer = useCallback(
    async (peerId: string) => {
      const ch = channelRef.current
      if (!ch || !joinedRef.current) return
      try {
        const pc = getOrCreatePeerConnection(peerId)
        if (pc.connectionState === 'closed') return
        await attachLocalTracksToPc(pc)
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

  const updateVideoTrackOnAllPeers = useCallback(
    async (nextTrack: MediaStreamTrack | null, sourceStream: MediaStream | null) => {
      const peerIds = Object.keys(pcsRef.current)
      for (const peerId of peerIds) {
        const pc = pcsRef.current[peerId]
        if (!pc) continue

        const videoTransceiver = pc
          .getTransceivers()
          .find((t) => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video')

        if (videoTransceiver) {
          if (nextTrack) {
            videoTransceiver.direction = 'sendrecv'
            await videoTransceiver.sender.replaceTrack(nextTrack).catch((err) => {
              console.warn('[ChatHuddleBar] replaceTrack warning:', err)
            })
          } else {
            await videoTransceiver.sender.replaceTrack(null).catch(() => {})
            videoTransceiver.direction = 'recvonly'
          }
          if (pc.signalingState === 'stable') {
            await sendOfferToPeer(peerId)
          }
        } else if (nextTrack && sourceStream) {
          pc.addTrack(nextTrack, sourceStream)
          if (pc.signalingState === 'stable') {
            await sendOfferToPeer(peerId)
          }
        }
      }
    },
    [sendOfferToPeer]
  )

  const handleTrackEnded = useCallback(
    async (kind: 'audio' | 'video', endedTrack: MediaStreamTrack) => {
      if (!joinedRef.current) return
      console.warn(`[ChatHuddleBar] Local ${kind} track ended inaspettatamente:`, endedTrack.label)

      if (kind === 'audio') {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
          const bestMic = pickBestDevice(devices, 'audioinput')
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: bestMic ? { deviceId: { exact: bestMic } } : true,
          })
          const newAudioTrack = newStream.getAudioTracks()[0]
          if (newAudioTrack && joinedRef.current) {
            newAudioTrack.enabled = audioEnabledRef.current
            newAudioTrack.onended = () => {
              handleTrackEnded('audio', newAudioTrack)
            }

            if (localStreamRef.current) {
              localStreamRef.current.removeTrack(endedTrack)
              localStreamRef.current.addTrack(newAudioTrack)
            } else {
              localStreamRef.current = newStream
            }

            for (const pc of Object.values(pcsRef.current)) {
              const audioTransceiver = pc
                .getTransceivers()
                .find(
                  (t) => t.receiver?.track?.kind === 'audio' || t.sender?.track?.kind === 'audio'
                )
              if (audioTransceiver) {
                audioTransceiver.direction = 'sendrecv'
                await audioTransceiver.sender.replaceTrack(newAudioTrack).catch(() => {})
              } else {
                const sender = pc.getSenders().find((s) => s.track?.kind === 'audio')
                if (sender) {
                  await sender.replaceTrack(newAudioTrack).catch(() => {})
                }
              }
            }
            setErrorMsg('Microfono commutato su dispositivo locale.')
            setTimeout(() => setErrorMsg(null), 3000)
          }
        } catch (fallbackErr) {
          console.error('[ChatHuddleBar] Auto-fallback audio fallito:', fallbackErr)
        }
      } else if (kind === 'video') {
        if (screenSharingRef.current) return

        try {
          const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
          const bestCam = pickBestDevice(devices, 'videoinput')

          if (bestCam) {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: bestCam } },
            })
            const newVideoTrack = newStream.getVideoTracks()[0]
            if (newVideoTrack && joinedRef.current && videoEnabledRef.current) {
              newVideoTrack.onended = () => {
                handleTrackEnded('video', newVideoTrack)
              }
              if (localStreamRef.current) {
                localStreamRef.current.removeTrack(endedTrack)
                localStreamRef.current.addTrack(newVideoTrack)
              } else {
                localStreamRef.current = newStream
              }
              await updateVideoTrackOnAllPeers(newVideoTrack, localStreamRef.current)
              syncLocalDisplayStream()
              setErrorMsg('Videocamera commutata su dispositivo locale.')
              setTimeout(() => setErrorMsg(null), 3000)
              return
            }
          }
        } catch (camErr) {
          console.warn('[ChatHuddleBar] Riconnessione video fallita:', camErr)
        }

        videoEnabledRef.current = false
        setVideoEnabled(false)
        if (localStreamRef.current) {
          localStreamRef.current.removeTrack(endedTrack)
        }
        await updateVideoTrackOnAllPeers(null, null)
        syncLocalDisplayStream()
        await trackCurrentPresence({ videoEnabled: false })
        setErrorMsg('Videocamera disconnessa. Chiamata mantenuta in solo audio.')
        setTimeout(() => setErrorMsg(null), 4000)
      }
    },
    [pickBestDevice, syncLocalDisplayStream, trackCurrentPresence, updateVideoTrackOnAllPeers]
  )

  const attachTrackEndedHandlers = useCallback(
    (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        if (track.kind === 'audio') {
          track.onended = () => {
            handleTrackEnded('audio', track)
          }
        } else if (track.kind === 'video') {
          track.onended = () => {
            handleTrackEnded('video', track)
          }
        }
      })
    },
    [handleTrackEnded]
  )

  const leaveHuddle = useCallback(
    (notifyRemote = true) => {
      if (notifyRemote && channelRef.current && joinedRef.current) {
        try {
          channelRef.current.send({
            type: 'broadcast',
            event: 'peer-leave',
            payload: {
              from: currentUser.id,
              sessionId: clientSessionIdRef.current,
            },
          })
          channelRef.current.untrack()
        } catch {
          // ignore
        }
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          t.onended = null
          t.stop()
        })
        localStreamRef.current = null
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => {
          t.onended = null
          t.stop()
        })
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
      setShowDeviceSettings(false)
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
        let wantVideo = mode === 'video'
        const allDevices = await navigator.mediaDevices.enumerateDevices().catch(() => [])

        const bestAudio = pickBestDevice(allDevices, 'audioinput', selectedAudioInputIdRef.current)
        const bestVideo = wantVideo
          ? pickBestDevice(allDevices, 'videoinput', selectedVideoInputIdRef.current)
          : undefined

        let stream: MediaStream | null = null

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: bestAudio ? { deviceId: { exact: bestAudio } } : true,
            video: wantVideo ? (bestVideo ? { deviceId: { exact: bestVideo } } : true) : false,
          })
        } catch (firstErr) {
          if (wantVideo) {
            let recovered = false
            if (bestVideo) {
              try {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: bestAudio ? { deviceId: { exact: bestAudio } } : true,
                  video: true,
                })
                recovered = true
              } catch {
                // fallback to audio
              }
            }
            if (!recovered) {
              try {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: bestAudio ? { deviceId: { exact: bestAudio } } : true,
                  video: false,
                })
                wantVideo = false
                setErrorMsg('Videocamera non disponibile. Connesso in solo audio.')
              } catch {
                try {
                  stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                  })
                  wantVideo = false
                  setErrorMsg('Videocamera non disponibile. Connesso in solo audio.')
                } catch {
                  throw firstErr
                }
              }
            }
          } else {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
              })
            } catch {
              throw firstErr
            }
          }
        }

        if (!stream) {
          throw new Error('Impossibile acquisire il flusso multimediale.')
        }

        await refreshDevices()
        const updatedDevices = await navigator.mediaDevices.enumerateDevices().catch(() => [])

        let currentAudioTrack = stream.getAudioTracks()[0]
        if (currentAudioTrack && isDesktopClient() && isContinuityOrPhoneDevice(currentAudioTrack.label)) {
          const localMicId = pickBestDevice(updatedDevices, 'audioinput')
          const chosenLabel = updatedDevices.find((d) => d.deviceId === localMicId)?.label || ''
          if (localMicId && !isContinuityOrPhoneDevice(chosenLabel)) {
            try {
              const replacementStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: localMicId } },
                video: false,
              })
              const replacementTrack = replacementStream.getAudioTracks()[0]
              if (replacementTrack) {
                currentAudioTrack.onended = null
                currentAudioTrack.stop()
                stream.removeTrack(currentAudioTrack)
                stream.addTrack(replacementTrack)
                currentAudioTrack = replacementTrack
              }
            } catch (switchErr) {
              console.warn('[ChatHuddleBar] Continuity auto-switch audio failed:', switchErr)
            }
          }
        }

        let currentVideoTrack = stream.getVideoTracks()[0]
        if (currentVideoTrack && isDesktopClient() && isContinuityOrPhoneDevice(currentVideoTrack.label)) {
          const localCamId = pickBestDevice(updatedDevices, 'videoinput')
          const chosenLabel = updatedDevices.find((d) => d.deviceId === localCamId)?.label || ''
          if (localCamId && !isContinuityOrPhoneDevice(chosenLabel)) {
            try {
              const replacementStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: localCamId } },
              })
              const replacementTrack = replacementStream.getVideoTracks()[0]
              if (replacementTrack) {
                currentVideoTrack.onended = null
                currentVideoTrack.stop()
                stream.removeTrack(currentVideoTrack)
                stream.addTrack(replacementTrack)
                currentVideoTrack = replacementTrack
              }
            } catch (switchErr) {
              console.warn('[ChatHuddleBar] Continuity auto-switch video failed:', switchErr)
            }
          }
        }

        if (currentAudioTrack) {
          const actualAudioDeviceId =
            currentAudioTrack.getSettings?.().deviceId ||
            updatedDevices.find(
              (d) => d.kind === 'audioinput' && d.label && d.label === currentAudioTrack.label
            )?.deviceId ||
            ''
          if (actualAudioDeviceId) {
            selectedAudioInputIdRef.current = actualAudioDeviceId
            setSelectedAudioInputId(actualAudioDeviceId)
          }
        }

        if (currentVideoTrack && wantVideo) {
          const actualVideoDeviceId =
            currentVideoTrack.getSettings?.().deviceId ||
            updatedDevices.find(
              (d) => d.kind === 'videoinput' && d.label && d.label === currentVideoTrack.label
            )?.deviceId ||
            ''
          if (actualVideoDeviceId) {
            selectedVideoInputIdRef.current = actualVideoDeviceId
            setSelectedVideoInputId(actualVideoDeviceId)
          }
        }

        attachTrackEndedHandlers(stream)

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
            payload: {
              from: currentUser.id,
              sessionId: clientSessionIdRef.current,
            },
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
      attachTrackEndedHandlers,
      currentUser.id,
      isConnecting,
      leaveHuddle,
      pickBestDevice,
      refreshDevices,
      syncLocalDisplayStream,
      trackCurrentPresence,
    ]
  )

  const switchAudioDevice = async (deviceId: string) => {
    selectedAudioInputIdRef.current = deviceId
    setSelectedAudioInputId(deviceId)
    if (!joinedRef.current) return

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      })
      const newAudioTrack = newStream.getAudioTracks()[0]
      if (!newAudioTrack) return
      newAudioTrack.enabled = audioEnabledRef.current

      const oldAudioTrack = localStreamRef.current?.getAudioTracks()[0]
      if (oldAudioTrack) {
        oldAudioTrack.onended = null
        oldAudioTrack.stop()
        localStreamRef.current?.removeTrack(oldAudioTrack)
      }
      localStreamRef.current?.addTrack(newAudioTrack)
      if (localStreamRef.current) {
        attachTrackEndedHandlers(localStreamRef.current)
      }

      for (const pc of Object.values(pcsRef.current)) {
        const audioTransceiver = pc
          .getTransceivers()
          .find((t) => t.receiver?.track?.kind === 'audio' || t.sender?.track?.kind === 'audio')
        if (audioTransceiver) {
          audioTransceiver.direction = 'sendrecv'
          await audioTransceiver.sender.replaceTrack(newAudioTrack).catch(() => {})
        } else {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'audio')
          if (sender) {
            await sender.replaceTrack(newAudioTrack).catch(() => {})
          }
        }
      }
    } catch (err) {
      console.warn('[ChatHuddleBar] switchAudioDevice error:', err)
    }
  }

  const switchVideoDevice = async (deviceId: string) => {
    selectedVideoInputIdRef.current = deviceId
    setSelectedVideoInputId(deviceId)
    if (!joinedRef.current || !videoEnabledRef.current || screenSharingRef.current) return

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      })
      const newVideoTrack = newStream.getVideoTracks()[0]
      if (!newVideoTrack) return

      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0]
      if (oldVideoTrack) {
        oldVideoTrack.onended = null
        oldVideoTrack.stop()
        localStreamRef.current?.removeTrack(oldVideoTrack)
      }
      localStreamRef.current?.addTrack(newVideoTrack)
      if (localStreamRef.current) {
        attachTrackEndedHandlers(localStreamRef.current)
      }

      await updateVideoTrackOnAllPeers(newVideoTrack, localStreamRef.current)
      syncLocalDisplayStream()
    } catch (err) {
      console.warn('[ChatHuddleBar] switchVideoDevice error:', err)
    }
  }

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
          const allDevs = await navigator.mediaDevices.enumerateDevices().catch(() => [])
          const bestCam = pickBestDevice(allDevs, 'videoinput', selectedVideoInputIdRef.current)
          let camStream = await navigator.mediaDevices.getUserMedia({
            video: bestCam ? { deviceId: { exact: bestCam } } : true,
          })
          camTrack = camStream.getVideoTracks()[0] || null

          if (camTrack) {
            await refreshDevices()
            const updatedDevs = await navigator.mediaDevices.enumerateDevices().catch(() => [])
            if (isDesktopClient() && isContinuityOrPhoneDevice(camTrack.label)) {
              const localCamId = pickBestDevice(updatedDevs, 'videoinput')
              const chosenLabel = updatedDevs.find((d) => d.deviceId === localCamId)?.label || ''
              if (localCamId && !isContinuityOrPhoneDevice(chosenLabel)) {
                try {
                  const replStream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: localCamId } },
                  })
                  const replTrack = replStream.getVideoTracks()[0]
                  if (replTrack) {
                    camTrack.stop()
                    camStream = replStream
                    camTrack = replTrack
                  }
                } catch (replErr) {
                  console.warn('[ChatHuddleBar] Continuity auto-switch in toggleVideo failed:', replErr)
                }
              }
            }

            const activeCamTrack = camTrack
            const actualCamId =
              activeCamTrack.getSettings?.().deviceId ||
              updatedDevs.find(
                (d) => d.kind === 'videoinput' && d.label && d.label === activeCamTrack.label
              )?.deviceId ||
              ''
            if (actualCamId) {
              selectedVideoInputIdRef.current = actualCamId
              setSelectedVideoInputId(actualCamId)
            }

            if (localStreamRef.current) {
              localStreamRef.current.addTrack(camTrack)
              attachTrackEndedHandlers(localStreamRef.current)
            } else {
              localStreamRef.current = camStream
              attachTrackEndedHandlers(localStreamRef.current)
            }
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
        t.onended = null
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

    const fallbackCamTrack = videoEnabledRef.current
      ? localStreamRef.current?.getVideoTracks()?.[0] || null
      : null
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
      config: { presence: { key: `${currentUser.id}:${clientSessionIdRef.current}` } },
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

        // Se siamo uniti e la nostra presenza non è registrata nel sync, re-traccia silenziosamente
        if (joinedRef.current) {
          const myKey = `${currentUser.id}:${clientSessionIdRef.current}`
          if (!state[myKey]) {
            trackCurrentPresence().catch(() => {})
          }
        }

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
        const leaveSessionId = payload?.sessionId as string | undefined
        if (!from || from === currentUser.id) return

        // Verifica se from ha ancora un'altra sessione attiva
        const state = roomChannel.presenceState<HuddlePeerPresence>()
        let hasOtherActiveSession = false
        for (const key of Object.keys(state)) {
          const entries = state[key]
          if (Array.isArray(entries)) {
            for (const e of entries) {
              if (e.userId === from && (!leaveSessionId || e.sessionId !== leaveSessionId)) {
                hasOtherActiveSession = true
                break
              }
            }
          }
          if (hasOtherActiveSession) break
        }

        if (!hasOtherActiveSession) {
          closePeerConnection(from)
        }
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
          await attachLocalTracksToPc(pc)

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
    trackCurrentPresence,
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

          {/* Selettore Dispositivi Live */}
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowDeviceSettings((v) => !v)}
              className={`h-7 px-2 text-xs gap-1 ${
                showDeviceSettings
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Scegli microfono o videocamera"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Dispositivi</span>
            </Button>

            {showDeviceSettings && (
              <div className="absolute right-0 top-9 z-50 w-72 rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-1 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
                    <span>Dispositivi Audio / Video</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDeviceSettings(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Microfono */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                    <Mic className="h-3 w-3 text-emerald-400" />
                    <span>Microfono</span>
                  </label>
                  <select
                    value={selectedAudioInputId || ''}
                    onChange={(e) => switchAudioDevice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {audioInputs.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microfono (${d.deviceId.slice(0, 8)})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Videocamera */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                    <Video className="h-3 w-3 text-blue-400" />
                    <span>Videocamera</span>
                  </label>
                  <select
                    value={selectedVideoInputId || ''}
                    onChange={(e) => switchVideoDevice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {videoInputs.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Videocamera (${d.deviceId.slice(0, 8)})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

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
