import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Webhook endpoint per la ricezione delle email di dominio inoltrate da Resend
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Resend Inbound Email Event payload
    const { from, to, subject, html, text, message_id } = payload?.data || payload

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: `Payload incompleto per l'email in ingresso.` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any).from('emails').insert({
      direction: 'inbound',
      from_address: from,
      to_address: Array.isArray(to) ? to : [to],
      subject: subject,
      body_html: html || null,
      body_text: text || null,
      status: 'received',
      message_id: message_id || null,
    })

    if (error) {
      console.error('Errore inserimento email Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email salvata con successo' })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Errore interno nel processare il webhook' },
      { status: 500 }
    )
  }
}
