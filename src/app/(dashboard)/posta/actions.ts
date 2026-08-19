'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')
const SHARED_DOMAIN = process.env.SHARED_EMAIL_DOMAIN || 'team.domain.com'

export async function sendSharedEmail(formData: {
  to: string
  subject: string
  body: string
  threadId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Utente non autenticato' }
    }

    // Invio effettivo tramite Resend API
    const resendResponse = await resend.emails.send({
      from: `Team Hub <team@${SHARED_DOMAIN}>`,
      to: formData.to,
      subject: formData.subject,
      text: formData.body,
    })

    if (resendResponse.error) {
      console.error('Errore Resend:', resendResponse.error)
      return { success: false, error: resendResponse.error.message }
    }

    // Salva l'email inviata nel database Supabase
    const { error: dbError } = await (supabase as any).from('emails').insert({
      direction: 'outbound',
      from_address: `team@${SHARED_DOMAIN}`,
      to_address: [formData.to],
      subject: formData.subject,
      body_text: formData.body,
      status: 'sent',
      thread_id: formData.threadId || null,
      resend_id: resendResponse.data?.id,
      created_by: user.id
    })

    if (dbError) {
      console.error('Errore salvataggio email Supabase:', dbError)
      return { success: false, error: 'Email inviata ma impossibile salvarla in archivio.' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Errore server in sendSharedEmail:', error)
    return { success: false, error: 'Errore interno del server' }
  }
}
