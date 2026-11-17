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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import {
  getStudentCommunityChatAction,
  sendStudentCommunityMessageAction,
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

function getCommunityLastReadKey(code: string) {
  return `aiutiamoci_student_community_last_read_${code.toUpperCase()}`
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

  const bottomRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isOpen) {
      loadData()
      const timer = setInterval(() => loadData(true), 15000)
      return () => clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentCode])

  const activeDmChannel = useMemo(() => {
    if (!studentId || !selectedTeacherId) return ''
    return `dm:${[studentId, selectedTeacherId].sort().join('_')}`
  }, [studentId, selectedTeacherId])

  const visibleMessages = useMemo(() => {
    const rawList =
      viewMode === 'community'
        ? communityMessages
        : dmMessages.filter((m) => m.channel === activeDmChannel)

    // Escludi eventuali reply di thread secondari oppure mostrali inline in ordine cronologico
    return rawList.filter((m) => {
      const att = Array.isArray(m.attachments) ? m.attachments : []
      const meta = att.find((a: any) => a && a.type === '__chat_meta__')
      return !meta?.parent_id
    })
  }, [viewMode, communityMessages, dmMessages, activeDmChannel])

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, viewMode, selectedTeacherId, visibleMessages.length])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return
    if (viewMode === 'dm' && !activeDmChannel) return

    setSending(true)
    const text = inputText.trim()
    setInputText('')

    const res = await sendStudentCommunityMessageAction({
      studentCode,
      content: text,
      targetChannel: viewMode === 'community' ? 'community-studenti' : activeDmChannel,
    })

    setSending(false)

    if (res.success) {
      await loadData(true)
    } else {
      setInputText(text)
      alert(res.error || 'Errore invio messaggio')
    }
  }

  if (!isOpen) return null

  const selectedTeacher = teamTeachers.find((t) => t.id === selectedTeacherId) || null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modale */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Canale Studenti & Docenti</span>
                <Badge variant="purple" className="text-[10px] font-mono">
                  #community-studenti
                </Badge>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Confrontati con i corsisti dell&apos;Academy o scrivi in privato 1-a-1 ai docenti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('community')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'dm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Messaggi Diretti Docenti (DM 1-a-1)</span>
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
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50/30 dark:bg-slate-950/60">
            {viewMode === 'dm' && selectedTeacher && (
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs flex items-center gap-2 shrink-0">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Conversazione privata con {selectedTeacher.full_name}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
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
                  const att = Array.isArray(msg.attachments) ? msg.attachments : []
                  const meta = att.find((a: any) => a && a.type === '__chat_meta__')
                  const senderStudentId = meta?.sender_student_id || null
                  const isMine =
                    senderStudentId === studentId ||
                    (!senderStudentId && msg.sender_id === studentId)
                  const authorLabel = isMine
                    ? `${studentName} (Tu)`
                    : meta?.sender_name || msg.sender?.full_name || 'Team AIutiamoci'
                  const isTeacher = !senderStudentId

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1 max-w-[85%] ${
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
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

                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                placeholder={
                  viewMode === 'community'
                    ? 'Scrivi un messaggio in #community-studenti...'
                    : `Scrivi in privato a ${selectedTeacher?.full_name || 'docente'}...`
                }
                className="text-xs h-10 dark:bg-slate-800 dark:border-slate-700"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 rounded-xl shrink-0"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Invia</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
