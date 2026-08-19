'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  Inbox,
  Send,
  Reply,
  Paperclip,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
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

  const supabase = createClient()

  useEffect(() => {
    fetchEmails()

    // Realtime subscription for incoming emails
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
      alert('Email inviata con successo tramite Resend!')
      setReplyText('')
      // The realtime subscription will pick up the new outbound email and add it to the list
    } else {
      alert(`Errore durante l'invio: ${result.error}`)
    }
    setIsSending(false)
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            Posta Condivisa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestione messaggi email via Resend Webhook. Tutte le conversazioni sono condivise con il team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="py-1 px-3 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Webhook Resend Attivo
          </Badge>
        </div>
      </div>

      {/* 2-Pane Email Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Left Column: Email List */}
        <div className="lg:col-span-4 xl:col-span-5 border-r border-slate-200 flex flex-col max-h-full">
          {/* List Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-700 uppercase tracking-wider">
              <Inbox className="h-4 w-4 text-blue-600" />
              Tutti i Messaggi ({emails.length})
            </div>
          </div>

          {/* Email Items */}
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
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
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : em.status === 'received' 
                          ? 'bg-white hover:bg-slate-50 font-bold'
                          : 'bg-white hover:bg-slate-50/80 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs truncate ${em.status === 'received' ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}>
                        {em.direction === 'inbound' ? em.from_address : `A: ${em.to_address[0]}`}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(em.created_at)}
                      </span>
                    </div>

                    <div className={`text-xs line-clamp-1 mb-1 ${em.status === 'received' ? 'text-slate-800 font-bold' : 'text-slate-600 font-medium'}`}>
                      {em.subject}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {em.body_text?.substring(0, 100) || 'Nessun testo...'}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      {em.direction === 'outbound' ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-blue-600 border-blue-200 bg-blue-50">
                          Inviata da {em.senderProfile?.full_name?.split(' ')[0] || 'Team'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100">
                          In arrivo
                        </Badge>
                      )}
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
              <div className="p-6 pb-4 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar
                        fallback={selectedEmail.direction === 'inbound' ? selectedEmail.from_address.charAt(0) : 'T'}
                        className="h-10 w-10 bg-slate-100 text-slate-700 font-bold border border-slate-200"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                          {selectedEmail.direction === 'inbound' ? selectedEmail.from_address : 'Team Hub'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          A: {selectedEmail.to_address.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(selectedEmail.created_at)}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">
                {selectedEmail.body_text || selectedEmail.body_html || 'Nessun contenuto in questa email.'}
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Reply className="h-4 w-4 text-blue-600" />
                      Rispondi come Team a <strong className="text-slate-900 truncate max-w-[200px]">
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
                    className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700 gap-1.5 h-8">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Allega documento</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 px-5 gap-2 shadow-sm transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {isSending ? 'Invio in corso...' : 'Invia Email'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Mail className="h-12 w-12 text-slate-200" />
              <p className="text-sm">Seleziona un messaggio dalla lista per leggerlo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
