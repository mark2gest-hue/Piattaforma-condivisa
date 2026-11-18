'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Users,
  MessageCircle,
  Send,
  Loader2,
  Hash,
  UserCheck,
  RefreshCw,
  Paperclip,
  Mic,
  Trash2,
  Download,
  FileText,
  Eye,
  Volume2,
  CornerDownRight,
  Copy,
  Check,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate, formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  getStudentCommunityChatAction,
  sendStudentCommunityMessageAction,
  createStudentChatUploadUrlAction,
  StudentCommunityTeacher,
} from '@/app/actions/chat'

interface StudentCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  studentCode: string
  studentName: string
  initialView?: 'community' | 'dm'
  onUnreadCountChange?: (count: number) => void
}

interface ChatAttachmentItem {
  name: string
  url: string
  size: number
  type: string
}

function getCommunityLastReadKey(code: string) {
  return `aiutiamoci_student_community_last_read_${code.toUpperCase()}`
}

function extractStudentMsgMeta(msg: any) {
  const raw = Array.isArray(msg?.attachments) ? msg.attachments : []
  const meta = raw.find((a: any) => a && a.type === '__chat_meta__')
  const files = raw.filter((a: any) => a && a.type !== '__chat_meta__') as ChatAttachmentItem[]
  return {
    parentId: (msg?.parent_message_id || meta?.parent_id || null) as string | null,
    senderName: (meta?.sender_name || null) as string | null,
    senderStudentId: (meta?.sender_student_id || null) as string | null,
    files,
  }
}

function isAudioAttachment(att: ChatAttachmentItem): boolean {
  const mime = (att.type || '').toLowerCase()
  return (
    mime.startsWith('audio/') ||
    (!mime.startsWith('video/') && /\.(webm|ogg|mp3|m4a|wav|aac)$/i.test(att.name || ''))
  )
}

function isImageAttachment(att: ChatAttachmentItem): boolean {
  const mime = (att.type || '').toLowerCase()
  return (
    (mime.startsWith('image/') && !mime.includes('svg')) ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(att.name || '')
  )
}

function formatVoiceDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function renderStudentMessageText(content: string, isMine: boolean) {
  if (!content) return null
  const parts = content.split(/(@[a-zA-Z0-9À-ÿ_]+)/g)
  return (
    <span>
      {parts.map((part, idx) =>
        part.startsWith('@') ? (
          <span
            key={idx}
            className={`inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md font-semibold text-[11px] sm:text-xs ${
              isMine
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </span>
  )
}

function StudentVoicePlayer({ att, isMine }: { att: ChatAttachmentItem; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1)

  const cycleSpeed = () => {
    const next: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1
    setPlaybackRate(next)
    if (audioRef.current) {
      audioRef.current.playbackRate = next
    }
  }

  const displayName = /^vocale-/i.test(att.name || '') ? 'Messaggio vocale' : att.name

  return (
    <div
      className={`p-2.5 rounded-xl border shadow-xs flex flex-col gap-1.5 min-w-[220px] sm:min-w-[260px] ${
        isMine
          ? 'bg-indigo-700/85 border-indigo-500/60 text-white'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isMine ? 'bg-indigo-500/30 text-white' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold truncate">{displayName}</p>
            <p className="text-[10px] opacity-75">{formatBytes(att.size || 0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
              isMine
                ? 'bg-indigo-600/80 hover:bg-indigo-600 border-indigo-400/50 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Cambia velocità"
          >
            {playbackRate}x
          </button>
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            download={att.name}
            className="p-1 rounded hover:opacity-80 transition-opacity"
            title="Scarica audio"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={att.url}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate
          }
        }}
        className="w-full h-8"
      />
    </div>
  )
}

export function StudentCommunityModal({
  isOpen,
  onClose,
  studentCode,
  studentName,
  initialView = 'community',
  onUnreadCountChange,
}: StudentCommunityModalProps) {
  const [viewMode, setViewMode] = useState<'community' | 'dm'>(initialView)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [studentId, setStudentId] = useState<string>('')
  const [communityMessages, setCommunityMessages] = useState<any[]>([])
  const [dmMessages, setDmMessages] = useState<any[]>([])
  const [teamTeachers, setTeamTeachers] = useState<StudentCommunityTeacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string; snippet: string } | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isSendingVoice, setIsSendingVoice] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const cancelRecordingRef = useRef(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setViewMode(initialView)
  }, [initialView])

  const markReadNow = () => {
    try {
      localStorage.setItem(getCommunityLastReadKey(studentCode), new Date().toISOString())
      onUnreadCountChange?.(0)
    } catch {
      // Ignora errori storage
    }
  }

  const loadData = async (silent = false) => {
    if (!studentCode) return
    if (!silent) setLoading(true)

    const res = await getStudentCommunityChatAction(studentCode)
    if (res.success) {
      setCommunityMessages(res.communityMessages || [])
      setDmMessages(res.dmMessages || [])
      setTeamTeachers(res.teamTeachers || [])
      if (res.student?.id) setStudentId(res.student.id)

      if (!selectedTeacherId && res.teamTeachers && res.teamTeachers.length > 0) {
        setSelectedTeacherId(res.teamTeachers[0].id)
      }

      if (isOpen) {
        markReadNow()
      }
    }
    setLoading(false)
  }

  const cleanupVoiceRecording = () => {
    cancelRecordingRef.current = true
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // ignore
      }
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((t) => t.stop())
      recordingStreamRef.current = null
    }
    setIsRecordingVoice(false)
    setRecordingSeconds(0)
  }

  useEffect(() => {
    if (!isOpen) {
      cleanupVoiceRecording()
      setPreviewImageUrl(null)
      return
    }
    loadData()
    const timer = setInterval(() => loadData(true), 15000)
    return () => {
      clearInterval(timer)
      cleanupVoiceRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentCode])

  useEffect(() => {
    if (!previewImageUrl) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImageUrl(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewImageUrl])

  useEffect(() => {
    setReplyingTo(null)
  }, [viewMode, selectedTeacherId])

  const activeDmChannel = useMemo(() => {
    if (!studentId || !selectedTeacherId) return ''
    return `dm:${[studentId, selectedTeacherId].sort().join('_')}`
  }, [studentId, selectedTeacherId])

  const visibleMessages = useMemo(() => {
    return viewMode === 'community'
      ? communityMessages
      : dmMessages.filter((m) => m.channel === activeDmChannel)
  }, [viewMode, communityMessages, dmMessages, activeDmChannel])

  const messagesById = useMemo(() => {
    const map = new Map<string, any>()
    for (const m of visibleMessages) {
      map.set(m.id, m)
    }
    return map
  }, [visibleMessages])

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, viewMode, selectedTeacherId, visibleMessages.length])

  const getMessageAuthorLabel = (msg: any) => {
    const meta = extractStudentMsgMeta(msg)
    const isMine =
      meta.senderStudentId === studentId ||
      (!meta.senderStudentId && msg.sender_id === studentId)
    if (isMine) return `${studentName} (Tu)`
    return meta.senderName || msg.sender?.full_name || 'Team AIutiamoci'
  }

  const getMessageQuoteSnippet = (msg: any) => {
    const text = (msg?.content || '').trim()
    if (text) return text.length > 90 ? `${text.slice(0, 90)}…` : text
    const { files } = extractStudentMsgMeta(msg)
    if (files.length > 0) {
      return isAudioAttachment(files[0]) ? '🎙️ Vocale' : '📎 Allegato'
    }
    return ''
  }

  const normalizePastedOrDroppedFiles = (files: File[], isPaste = false): File[] => {
    return files.map((file) => {
      const isGenericName =
        !file.name ||
        /^image(\.(png|jpe?g|webp|gif))?$/i.test(file.name) ||
        file.name === 'blob'
      if (isPaste && isGenericName) {
        const rawExt = file.type?.split('/')[1]?.split('+')[0] || 'png'
        const ext = rawExt.toLowerCase() === 'jpeg' ? 'jpg' : rawExt.toLowerCase()
        return new File([file], `screenshot-${Date.now()}.${ext}`, {
          type: file.type || `image/${ext}`,
        })
      }
      return file
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      setPendingFiles((prev) => [...prev, ...selected].slice(0, 5))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePasteFiles = (e: React.ClipboardEvent) => {
    if (sending || isSendingVoice) return
    const extracted: File[] = []
    const items = e.clipboardData?.items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const f = item.getAsFile()
          if (f) extracted.push(f)
        }
      }
    }
    if (extracted.length === 0 && e.clipboardData?.files && e.clipboardData.files.length > 0) {
      extracted.push(...Array.from(e.clipboardData.files))
    }
    if (extracted.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      const normalized = normalizePastedOrDroppedFiles(extracted, true)
      setPendingFiles((prev) => [...prev, ...normalized].slice(0, 5))
    }
  }

  const hasFilesInDrag = (e: React.DragEvent<HTMLDivElement>) =>
    Boolean(e.dataTransfer?.types?.includes('Files'))

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDraggingOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!hasFilesInDrag(e) && !(e.dataTransfer?.files && e.dataTransfer.files.length > 0)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDraggingOver(false)
    if (sending || isSendingVoice) return
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const normalized = normalizePastedOrDroppedFiles(Array.from(e.dataTransfer.files), false)
      setPendingFiles((prev) => [...prev, ...normalized].slice(0, 5))
      textInputRef.current?.focus()
    }
  }

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(msgId)
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === msgId ? null : prev))
      }, 2000)
    } catch (err) {
      console.error('Errore copia messaggio:', err)
    }
  }

  const uploadStudentFiles = async (
    filesToUpload: File[],
    targetChannel: string
  ): Promise<ChatAttachmentItem[]> => {
    const uploaded: ChatAttachmentItem[] = []
    for (const file of filesToUpload.slice(0, 5)) {
      const signRes = await createStudentChatUploadUrlAction({
        studentCode,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
        targetChannel,
      })

      if (!signRes.success || !signRes.path || !signRes.token || !signRes.publicUrl) {
        throw new Error(signRes.error || `Upload non consentito per ${file.name}`)
      }

      const { error: upErr } = await supabase.storage
        .from('team-files')
        .uploadToSignedUrl(signRes.path, signRes.token, file, {
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
        })

      if (upErr) {
        throw new Error(upErr.message || `Errore caricamento ${file.name}`)
      }

      uploaded.push({
        name: file.name,
        url: signRes.publicUrl,
        size: file.size,
        type: file.type || 'application/octet-stream',
      })
    }
    return uploaded
  }

  const startVoiceRecording = async () => {
    if (sending || isSendingVoice || isRecordingVoice) return
    if (viewMode === 'dm' && !activeDmChannel) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Registrazione vocale non supportata su questo browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream
      recordingChunksRef.current = []
      cancelRecordingRef.current = false

      const candidateMimes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ]
      const supportedMime = candidateMimes.find((m) => MediaRecorder.isTypeSupported(m)) || ''
      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordingChunksRef.current.push(ev.data)
        }
      }

      recorder.onstop = async () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((t) => t.stop())
          recordingStreamRef.current = null
        }

        const wasCancelled = cancelRecordingRef.current
        const chunks = [...recordingChunksRef.current]
        const mimeType = recorder.mimeType || supportedMime || 'audio/webm'

        recordingChunksRef.current = []
        mediaRecorderRef.current = null
        setIsRecordingVoice(false)
        setRecordingSeconds(0)

        if (wasCancelled || chunks.length === 0) return

        const ext = mimeType.includes('mp4')
          ? 'm4a'
          : mimeType.includes('ogg')
          ? 'ogg'
          : 'webm'

        const voiceBlob = new Blob(chunks, { type: mimeType })
        const voiceFile = new File([voiceBlob], `vocale-${Date.now()}.${ext}`, {
          type: mimeType,
        })

        const targetChannel = viewMode === 'community' ? 'community-studenti' : activeDmChannel
        if (!targetChannel) return

        setIsSendingVoice(true)
        try {
          const uploaded = await uploadStudentFiles([voiceFile], targetChannel)
          const res = await sendStudentCommunityMessageAction({
            studentCode,
            content: '',
            targetChannel,
            parentId: replyingTo?.id,
            uploadedFiles: uploaded,
          })
          if (res.success) {
            setReplyingTo(null)
            await loadData(true)
          } else {
            alert(res.error || 'Errore invio messaggio vocale')
          }
        } catch (err: any) {
          alert(err?.message || 'Errore caricamento messaggio vocale')
        } finally {
          setIsSendingVoice(false)
        }
      }

      recorder.start(250)
      setIsRecordingVoice(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      cleanupVoiceRecording()
      alert(
        err?.name === 'NotAllowedError'
          ? 'Permesso microfono negato. Abilitalo nelle impostazioni del browser.'
          : 'Impossibile avviare la registrazione vocale.'
      )
    }
  }

  const stopVoiceRecording = (shouldSend: boolean) => {
    cancelRecordingRef.current = !shouldSend
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      cleanupVoiceRecording()
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputText.trim() && pendingFiles.length === 0) || sending || isSendingVoice) return
    if (viewMode === 'dm' && !activeDmChannel) return

    const targetChannel = viewMode === 'community' ? 'community-studenti' : activeDmChannel
    setSending(true)
    const text = inputText.trim()
    const filesToSend = [...pendingFiles]

    try {
      const uploadedFiles =
        filesToSend.length > 0 ? await uploadStudentFiles(filesToSend, targetChannel) : []

      const res = await sendStudentCommunityMessageAction({
        studentCode,
        content: text,
        targetChannel,
        parentId: replyingTo?.id,
        uploadedFiles,
      })

      if (res.success) {
        setInputText('')
        setPendingFiles([])
        setReplyingTo(null)
        await loadData(true)
      } else {
        alert(res.error || 'Errore invio messaggio')
      }
    } catch (err: any) {
      alert(err?.message || 'Errore caricamento allegato')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  const selectedTeacher = teamTeachers.find((t) => t.id === selectedTeacherId) || null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.zip"
        className="hidden"
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl h-[90dvh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modale */}
        <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span className="truncate">Canale Studenti & Docenti</span>
                <Badge variant="purple" className="text-[10px] font-mono shrink-0">
                  #community-studenti
                </Badge>
              </h3>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Confrontati con i corsisti dell&apos;Academy o scrivi in privato 1-a-1 ai docenti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => loadData(true)}
              className="h-8 w-8 rounded-xl"
              title="Aggiorna messaggi"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Switch Tab Interni */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('community')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'community'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>#community-studenti ({communityMessages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'dm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>DM Docenti (1-a-1)</span>
          </button>
        </div>

        {/* Corpo Principale */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar Docenti (solo in vista DM) */}
          {viewMode === 'dm' && (
            <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 space-y-2 overflow-y-auto max-h-40 md:max-h-full">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Seleziona Docente / Tutor
              </div>
              <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible">
                {teamTeachers.map((teacher) => {
                  const isSelected = teacher.id === selectedTeacherId
                  return (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      <UserCheck className="h-3.5 w-3.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate">{teacher.full_name}</div>
                        <div
                          className={`text-[9px] uppercase font-mono ${
                            isSelected ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {teacher.role}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Area Messaggi + Input */}
          <div
            className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50/30 dark:bg-slate-950/60 relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePasteFiles}
          >
            {isDraggingOver && (
              <div className="absolute inset-0 z-30 bg-indigo-600/10 dark:bg-indigo-500/15 backdrop-blur-xs border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-200 dark:border-indigo-800 shadow-xl flex flex-col items-center gap-2 max-w-xs">
                  <UploadCloud className="h-9 w-9 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Rilascia per allegare file o immagini
                  </p>
                </div>
              </div>
            )}

            {viewMode === 'dm' && selectedTeacher && (
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs flex items-center gap-2 shrink-0">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Conversazione privata con {selectedTeacher.full_name}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : visibleMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400 space-y-2">
                  <MessageCircle className="h-8 w-8 opacity-40" />
                  <p>
                    {viewMode === 'community'
                      ? 'Nessun messaggio in #community-studenti. Scrivi il primo saluto o una domanda!'
                      : `Inizia una chat privata 1-a-1 con ${selectedTeacher?.full_name || 'un docente'}.`}
                  </p>
                </div>
              ) : (
                visibleMessages.map((msg) => {
                  const meta = extractStudentMsgMeta(msg)
                  const isMine =
                    meta.senderStudentId === studentId ||
                    (!meta.senderStudentId && msg.sender_id === studentId)
                  const authorLabel = getMessageAuthorLabel(msg)
                  const isTeacher = !meta.senderStudentId
                  const parentMsg = meta.parentId ? messagesById.get(meta.parentId) : null

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1 max-w-[88%] sm:max-w-[82%] ${
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {authorLabel}
                        </span>
                        {isTeacher && !isMine && (
                          <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                            DOCENTE
                          </Badge>
                        )}
                        <span>{formatDate(msg.created_at)}</span>
                      </div>

                      {parentMsg && (
                        <div
                          className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] border max-w-full ${
                            isMine
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200'
                              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <CornerDownRight className="h-3 w-3 shrink-0 mt-0.5 opacity-75" />
                          <span className="truncate">
                            In risposta a <strong>{getMessageAuthorLabel(parentMsg)}</strong>:{' '}
                            &ldquo;{getMessageQuoteSnippet(parentMsg)}&rdquo;
                          </span>
                        </div>
                      )}

                      {msg.content && (
                        <div
                          className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words select-text shadow-xs ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                          }`}
                        >
                          {renderStudentMessageText(msg.content, isMine)}
                        </div>
                      )}

                      {meta.files.length > 0 && (
                        <div className="space-y-1.5 max-w-full">
                          {meta.files.map((att, idx) => {
                            if (isImageAttachment(att)) {
                              return (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/30"
                                  onClick={() => setPreviewImageUrl(att.url)}
                                >
                                  <img
                                    src={att.url}
                                    alt={att.name || 'Immagine allegata'}
                                    className="max-h-56 max-w-full rounded-xl object-cover"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    <span>Ingrandisci</span>
                                  </div>
                                </div>
                              )
                            }
                            if (isAudioAttachment(att)) {
                              return <StudentVoicePlayer key={idx} att={att} isMine={isMine} />
                            }
                            return (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.name}
                                className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                                  isMine
                                    ? 'bg-indigo-700/85 hover:bg-indigo-700 border-indigo-500/60 text-white'
                                    : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[240px]">
                                      {att.name}
                                    </p>
                                    <p className="text-[10px] opacity-75">{formatBytes(att.size || 0)}</p>
                                  </div>
                                </div>
                                <Download className="h-4 w-4 shrink-0 opacity-80" />
                              </a>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo({
                              id: msg.id,
                              author: authorLabel,
                              snippet: getMessageQuoteSnippet(msg),
                            })
                            textInputRef.current?.focus()
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CornerDownRight className="h-3 w-3" />
                          <span>Rispondi</span>
                        </button>
                        {msg.content && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                              copiedMessageId === msg.id
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copiato</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copia</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {replyingTo && (
              <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center justify-between gap-2 text-[11px] shrink-0">
                <div className="flex items-center gap-1.5 min-w-0 text-indigo-800 dark:text-indigo-200">
                  <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    Rispondi a <strong>{replyingTo.author}</strong>: &ldquo;{replyingTo.snippet}&rdquo;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0"
                  title="Annulla risposta"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center gap-1.5 overflow-x-auto shrink-0">
                {pendingFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 shrink-0"
                  >
                    <Paperclip className="h-3 w-3 text-indigo-500" />
                    <span className="max-w-[130px] truncate font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                      title="Rimuovi allegato"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 sm:gap-2 shrink-0"
            >
              {isRecordingVoice ? (
                <>
                  <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 truncate">
                      Registrazione vocale {formatVoiceDuration(recordingSeconds)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => stopVoiceRecording(false)}
                    className="h-9 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 gap-1 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Annulla</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => stopVoiceRecording(true)}
                    className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 rounded-xl shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Invia Vocale</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || isSendingVoice}
                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                    title="Allega foto o documenti"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={startVoiceRecording}
                    disabled={sending || isSendingVoice}
                    className="h-9 w-9 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                    title="Registra messaggio vocale"
                  >
                    {isSendingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    ref={textInputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onPaste={handlePasteFiles}
                    disabled={sending || isSendingVoice}
                    placeholder={
                      pendingFiles.length > 0
                        ? 'Aggiungi una didascalia...'
                        : viewMode === 'community'
                        ? 'Scrivi o incolla/trascina file in #community-studenti...'
                        : `Scrivi o incolla file a ${selectedTeacher?.full_name || 'docente'}...`
                    }
                    className="text-xs h-10 dark:bg-slate-800 dark:border-slate-700 min-w-0 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={(!inputText.trim() && pendingFiles.length === 0) || sending || isSendingVoice}
                    className="h-10 px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 rounded-xl shrink-0"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="hidden sm:inline">Invia</span>
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90dvh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 self-end">
              <a
                href={previewImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Apri / Scarica</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Chiudi anteprima (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={previewImageUrl}
              alt="Anteprima immagine"
              className="max-h-[80dvh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
