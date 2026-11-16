import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllPushSubscriptions, sendWebPushNotification } from '@/lib/web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Webhook Inbound Blindato con firma HMAC SHA-256.
 * Riceve notifiche esterne da n8n, CRM o sistemi esterni e le inoltra
 * come messaggio di sistema sul canale chat e via Web Push istantaneo.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // 1. Verifica Firma HMAC SHA-256
    const sigHeader =
      request.headers.get('x-signature-256') ||
      request.headers.get('x-hub-signature-256') ||
      ''

    const secret =
      process.env.CHAT_WEBHOOK_SECRET ||
      process.env.VAPID_PRIVATE_KEY_PEM ||
      'aiutiamoci-webhook-secret-2026'

    const expectedHex = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex')

    const sigClean = sigHeader.startsWith('sha256=')
      ? sigHeader.slice(7).trim()
      : sigHeader.trim()

    const expectedBuf = Buffer.from(expectedHex, 'utf8')
    const sigBuf = Buffer.from(sigClean, 'utf8')

    if (
      !sigClean ||
      expectedBuf.length !== sigBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, sigBuf)
    ) {
      return NextResponse.json(
        { error: 'Firma HMAC non valida o mancante' },
        { status: 401 }
      )
    }

    // 2. Parsing Payload
    let payload: {
      channel?: string
      title?: string
      message: string
      source?: string
    }

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Payload JSON non valido' },
        { status: 400 }
      )
    }

    if (!payload.message || typeof payload.message !== 'string' || !payload.message.trim()) {
      return NextResponse.json(
        { error: 'Campo message obbligatorio' },
        { status: 400 }
      )
    }

    const channel = (payload.channel || 'generale').trim().toLowerCase()
    const source = (payload.source || 'webhook').trim()
    const title = payload.title?.trim() || null
    const message = payload.message.trim()

    // 3. Risoluzione profilo di sistema per sender_id (vincolo NOT NULL REFERENCES profiles)
    const admin = createAdminClient()
    const { data: systemProfile, error: profileErr } = await (admin.from('profiles') as any)
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (profileErr || !systemProfile?.id) {
      console.error('[webhook/chat] Nessun profilo di sistema trovato:', profileErr)
      return NextResponse.json(
        { error: 'Nessun profilo di sistema trovato nel database' },
        { status: 500 }
      )
    }

    // 4. Formattazione contenuto messaggio
    const formattedContent = title
      ? `**[${source.toUpperCase()}] ${title}**\n${message}`
      : `**[${source.toUpperCase()}]** ${message}`

    // 5. Inserimento messaggio in chat
    const { data: insertedMsg, error: insertErr } = await (admin.from('messages') as any)
      .insert({
        channel,
        sender_id: systemProfile.id,
        is_system: true,
        content: formattedContent,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[webhook/chat] Inserimento messaggio fallito:', insertErr)
      return NextResponse.json(
        { error: `Errore salvataggio messaggio: ${insertErr.message}` },
        { status: 500 }
      )
    }

    // 6. Invio Web Push istantaneo (non bloccante)
    try {
      const subscriptions = await getAllPushSubscriptions()
      const pushTitle = title || `🔔 Aggiornamento ${source}`
      const pushPayload = {
        title: pushTitle,
        body: message,
        url: `/chat?channel=${encodeURIComponent(channel)}`,
        tag: `webhook-${Date.now()}`,
      }

      await Promise.allSettled(
        subscriptions.map((sub) => sendWebPushNotification(sub, pushPayload))
      )
    } catch (pushErr) {
      console.warn('[webhook/chat] Invio Web Push non bloccante fallito:', pushErr)
    }

    return NextResponse.json(
      { success: true, messageId: insertedMsg?.id },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[webhook/chat] Errore imprevisto:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno del server' },
      { status: 500 }
    )
  }
}
