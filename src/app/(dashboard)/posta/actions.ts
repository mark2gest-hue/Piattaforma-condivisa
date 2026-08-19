'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// Indirizzo mittente predefinito accettato da Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Ti AIuto <onboarding@resend.dev>'

export async function sendSharedEmail(formData: {
  to: string
  subject: string
  body: string
  threadId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log(`[Resend] Invio email a: ${formData.to} | Oggetto: ${formData.subject}`)

    // Invio effettivo tramite Resend SDK
    const resendResponse = await resend.emails.send({
      from: FROM_EMAIL,
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
      from_address: FROM_EMAIL,
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
