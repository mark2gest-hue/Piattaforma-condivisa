import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook endpoint server-to-server con privilegi admin per inserimento email in entrata
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    // Inizializza il client Supabase Admin con Service Role Key per superare le RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await (supabaseAdmin as any).from('emails').insert({
      direction: 'inbound',
      from_address: typeof from === 'string' ? from : from?.email || String(from),
      to_address: Array.isArray(to) ? to : [typeof to === 'string' ? to : to?.email || String(to)],
      subject: subject,
      body_html: html || null,
      body_text: text || text || html || '',
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
