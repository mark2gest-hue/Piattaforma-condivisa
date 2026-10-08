import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

/**
 * Cron Endpoint: Notifica Telegram a -15 minuti dall'inizio degli eventi di calendario
 * Eseguibile periodicamente (es. ogni 2 o 5 minuti) tramite cron o webhook.
 */
export async function GET(req: NextRequest) {
  return handleCheckReminders(req)
}

export async function POST(req: NextRequest) {
  return handleCheckReminders(req)
}

async function handleCheckReminders(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url)
      const tokenQuery = url.searchParams.get('token')
      if (tokenQuery !== cronSecret) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
      }
    }

    const admin = createAdminClient()

    // Calcolo data e orario nel fuso orario italiano
    const now = new Date()
    const formatterDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const todayStr = formatterDate.format(now) // YYYY-MM-DD

    const formatterTime = new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const [currH, currM] = formatterTime.format(now).split(':').map(Number)
    const currentMinutes = currH * 60 + currM

    // Recupera eventi di oggi che non hanno ancora inviato il promemoria
    const { data: events, error } = await admin
      .from('calendar_events')
      .select('id, title, description, event_date, event_time, category')
      .eq('event_date', todayStr)
      .eq('reminder_sent', false)

    if (error) {
      console.error('[Calendar Cron] Errore recupero eventi:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'Nessun evento in attesa di notifica' })
    }

    let notifiedCount = 0

    for (const evt of events) {
      if (!evt.event_time) continue

      const [h, m] = evt.event_time.split(':').map(Number)
      if (isNaN(h) || isNaN(m)) continue

      const eventMinutes = h * 60 + m
      const diffMinutes = eventMinutes - currentMinutes

      // Se l'evento inizia entro i prossimi 15 minuti (finestra da 0 a 16 minuti prima)
      if (diffMinutes >= 0 && diffMinutes <= 16) {
        const categoryTag = evt.category ? ` [${evt.category.toUpperCase()}]` : ''
        const descInfo = evt.description ? `\n📝 <i>${escapeHtml(evt.description)}</i>` : ''
        
        const message =
          `⏰ <b>PROMEMORIA: Evento tra ${diffMinutes === 0 ? 'pochi istanti' : `${diffMinutes} minuti`}!</b>${escapeHtml(categoryTag)}\n\n` +
          `📌 <b>${escapeHtml(evt.title)}</b>\n` +
          `🕒 <b>Inizio:</b> ore ${evt.event_time}${descInfo}\n\n` +
          `🔗 <a href="https://aiutiamoci.cloud/calendario">Apri Calendario Team</a>`

        const tgRes = await sendTelegramMessage(message)

        if (tgRes.success) {
          await admin
            .from('calendar_events')
            .update({ reminder_sent: true })
            .eq('id', evt.id)

          notifiedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: events.length,
      notified: notifiedCount,
      timestamp: now.toISOString(),
    })
  } catch (err: any) {
    console.error('[Calendar Cron Exception]:', err)
    return NextResponse.json({ error: err?.message || 'Errore interno' }, { status: 500 })
  }
}
