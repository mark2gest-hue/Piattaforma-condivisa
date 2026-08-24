'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSharedEmail(formData: {
  to: string
  subject: string
  body: string
  from?: string
  threadId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const chosenFrom = formData.from || process.env.RESEND_FROM_EMAIL || 'Ti AIuto <info@aiutiamoci.cloud>'

    console.log(`[Resend] Invio email da: ${chosenFrom} a: ${formData.to} | Oggetto: ${formData.subject}`)

    // Invio effettivo tramite Resend SDK
    const resendResponse = await resend.emails.send({
      from: chosenFrom,
      to: formData.to,
      subject: formData.subject,
      text: formData.body,
    })

    if (resendResponse.error) {
      console.error('[Resend Error]:', resendResponse.error)
      return { success: false, error: resendResponse.error.message }
    }

    console.log(`[Resend Success] Email inviata ID: ${resendResponse.data?.id}`)

    // Salva l'email inviata nel database Supabase
    await (supabase as any).from('emails').insert({
      direction: 'outbound',
      from_address: chosenFrom,
      to_address: [formData.to],
      subject: formData.subject,
      body_text: formData.body,
      status: 'sent',
      thread_id: formData.threadId || null,
      resend_id: resendResponse.data?.id,
      created_by: user?.id || null,
    })

    return { success: true, resendId: resendResponse.data?.id }
  } catch (error: any) {
    console.error('Errore server in sendSharedEmail:', error)
    return { success: false, error: error.message || 'Errore interno del server' }
  }
}

export async function updateEmailStatus(emailId: string, status: 'received' | 'read' | 'archived') {
  try {
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', emailId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Errore updateEmailStatus:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteSharedEmail(emailId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Errore deleteSharedEmail:', err)
    return { success: false, error: err.message }
  }
}
