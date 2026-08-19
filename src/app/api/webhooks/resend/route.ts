import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Webhook endpoint server-to-server con privilegi admin per inserimento email in entrata
export async function POST(request: Request) {
  try {
    const svixId = request.headers.get('svix-id') || ''
    const svixTimestamp = request.headers.get('svix-timestamp') || ''
    const svixSignatureHeader = request.headers.get('svix-signature') || ''

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || ''

    const rawBody = await request.text()

    if (webhookSecret) {
      if (!svixId || !svixTimestamp || !svixSignatureHeader) {
        return NextResponse.json(
          { error: 'Firma mancante. Richiesta non autorizzata.' },
          { status: 401 }
        )
      }

      // 1. Verifica la tolleranza del timestamp (5 minuti) per prevenire replay attacks
      const timestampMs = parseInt(svixTimestamp, 10) * 1000
      const toleranceMs = 5 * 60 * 1000
      const now = Date.now()
      if (isNaN(timestampMs) || Math.abs(now - timestampMs) > toleranceMs) {
        return NextResponse.json(
          { error: 'Timestamp non valido o scaduto.' },
          { status: 401 }
        )
      }

      // 2. Calcola HMAC-SHA256 sul payload concitato
      const secretPart = webhookSecret.startsWith('whsec_')
        ? webhookSecret.substring(6)
        : webhookSecret
      const secretKey = Buffer.from(secretPart, 'base64')
      const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signedContent)
        .digest('base64')

      // 3. Confronta le firme
      const signatures = svixSignatureHeader.split(' ')
      let isValid = false
      for (const sig of signatures) {
        const [version, signatureValue] = sig.split(',')
        if (version === 'v1' && signatureValue === computedSignature) {
          isValid = true
          break
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'Firma webhook non valida.' },
          { status: 401 }
        )
      }
    } else {
      console.warn('[Resend Webhook] RESEND_WEBHOOK_SECRET non configurato in .env. Webhook accettato senza firma.')
    }

    const payload = JSON.parse(rawBody)

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
