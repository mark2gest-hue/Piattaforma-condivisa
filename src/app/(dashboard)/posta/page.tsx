'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  Inbox,
  Send,
  Reply,
  Paperclip,
  Loader2,
  Trash2,
  PlusCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Email, Profile } from '@/types/index'
import { requestNotificationPermission, sendDesktopNotification } from '@/lib/notifications'
import { sendSharedEmail } from './actions'

type EmailWithSender = Email & { senderProfile?: Profile }

export default function PostaCondivisaPage() {
  const [emails, setEmails] = useState<EmailWithSender[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailWithSender | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)

  // Modal Nuova Email da zero
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchEmails()

    // Realtime subscription per email in arrivo ed inviate
    const channel = supabase
      .channel('public:emails')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emails' },
        (payload) => {
          const newEmail = payload.new as Email
          setEmails((prev) => [newEmail, ...prev])

          if (newEmail.direction === 'inbound') {
            sendDesktopNotification(
              `Nuova Email da ${newEmail.from_address}`,
              { body: newEmail.subject },
              'email'
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchEmails = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('emails')
      .select('*, senderProfile:profiles(*)')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setEmails(data)
      if (data.length > 0) {
        setSelectedEmail(data[0])
      }
    }
    setLoading(false)
  }

  // Invio risposta ad un'email esistente
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedEmail) return
    setIsSending(true)

    const recipient = selectedEmail.direction === 'inbound' 
      ? selectedEmail.from_address 
      : selectedEmail.to_address[0]

    const subject = selectedEmail.subject.startsWith('Re:') 
      ? selectedEmail.subject 
      : `Re: ${selectedEmail.subject}`

    const result = await sendSharedEmail({
      to: recipient,
      subject: subject,
      body: replyText,
      threadId: selectedEmail.thread_id || selectedEmail.id,
    })

    if (result.success) {
      alert('Risposta inviata con successo tramite Resend!')
      setReplyText('')
    } else {
      alert(`Errore durante l'invio: ${result.error}`)
    }
    setIsSending(false)
  }

  // Invio nuova email da zero a qualsiasi destinatario
  const handleSendNewEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return
    setIsComposing(true)

    const result = await sendSharedEmail({
      to: composeTo.trim(),
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    })

    if (result.success) {
      alert(`Email inviata con successo a ${composeTo}!`)
      setIsComposeModalOpen(false)
      setComposeTo('')
      setComposeSubject('')
      setComposeBody('')
    } else {
      alert(`Errore durante l'invio dell'email: ${result.error}`)
    }
    setIsComposing(false)
  }

  // Eliminazione email dal database Supabase
  const handleDeleteEmail = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Sei sicuro di voler eliminare questa email dal sistema condiviso?')) return

    const { error } = await supabase.from('emails').delete().eq('id', emailId)

    if (error) {
      alert(`Impossibile eliminare l'email: ${error.message}`)
      return
    }

    const updated = emails.filter((em) => em.id !== emailId)
    setEmails(updated)

    if (selectedEmail?.id === emailId) {
      setSelectedEmail(updated.length > 0 ? updated[0] : null)
    }
  }

  const markAsRead = async (emailId: string) => {
    await (supabase as any).from('emails').update({ status: 'read' }).eq('id', emailId)
    setEmails(emails.map(e => e.id === emailId ? { ...e, status: 'read' } : e))
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Posta Condivisa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestione messaggi email via Resend SDK & Webhook condivisa con il team.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="py-1 px-3 hidden sm:flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Webhook Resend Attivo
          </Badge>

          <Button
            onClick={() => setIsComposeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs text-xs font-semibold h-9 px-4"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuova Email</span>
          </Button>
        </div>
      </div>

      {/* 2-Pane Email Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-h-[500px]">
        {/* Left Column: Email List */}
        <div className="lg:col-span-4 xl:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col max-h-full">
          {/* List Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Tutti i Messaggi ({emails.length})
            </div>
          </div>

          {/* Email Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : emails.length > 0 ? (
              emails.map((em) => {
                const isSelected = selectedEmail?.id === em.id
                return (
                  <div
                    key={em.id}
                    onClick={() => {
                      setSelectedEmail(em)
                      if (em.status === 'received') markAsRead(em.id)
                    }}
                    className={`p-4 cursor-pointer transition-colors relative group ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : em.status === 'received' 
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs truncate ${em.status === 'received' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'}`}>
                        {em.direction === 'inbound' ? em.from_address : `A: ${em.to_address[0]}`}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(em.created_at)}
                      </span>
                    </div>

                    <div className={`text-xs line-clamp-1 mb-1 ${em.status === 'received' ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                      {em.subject}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {em.body_text?.substring(0, 100) || 'Nessun testo...'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {em.direction === 'outbound' ? (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
                            Inviata da {em.senderProfile?.full_name?.split(' ')[0] || 'Team'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            In arrivo
                          </Badge>
                        )}
                      </div>

                      {/* Pulsante Elimina Rapido */}
                      <button
                        onClick={(e) => handleDeleteEmail(em.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
                        title="Elimina Email"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Nessuna email presente.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Viewer & Reply */}
        <div className="lg:col-span-8 xl:col-span-7 flex flex-col p-0 h-full">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Message Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar
                        fallback={selectedEmail.direction === 'inbound' ? selectedEmail.from_address.charAt(0) : 'T'}
                        className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {selectedEmail.direction === 'inbound' ? selectedEmail.from_address : 'Team Hub'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          A: {selectedEmail.to_address.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(selectedEmail.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Elimina questa email"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">
                {selectedEmail.body_text || selectedEmail.body_html || 'Nessun contenuto in questa email.'}
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Rispondi come Team a <strong className="text-slate-900 dark:text-white truncate max-w-[200px]">
                        {selectedEmail.direction === 'inbound' ? selectedEmail.from_address : selectedEmail.to_address[0]}
                      </strong>
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline-block">via Resend API</span>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Scrivi qui la risposta condivisa..."
                    className="w-full text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 gap-1.5 h-8">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Allega documento</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-5 gap-2 shadow-xs transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSending ? 'Invio in corso...' : 'Invia Risposta'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Mail className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">Seleziona un messaggio dalla lista per leggerlo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuova Email da Zero */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nuova Email di Team</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsComposeModalOpen(false)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSendNewEmail} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">A (Destinatario) *</label>
                <Input
                  autoFocus
                  required
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Es. cliente@azienda.com"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Oggetto *</label>
                <Input
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Es. Offerta Consulenza / Aggiornamento Progetto"
                  className="text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Messaggio *</label>
                <textarea
                  required
                  rows={5}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Scrivi qui il contenuto dell'email..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsComposeModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isComposing} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  {isComposing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Invia Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
