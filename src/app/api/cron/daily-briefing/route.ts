import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Cron Endpoint: Invio Morning Briefing Email ai soci
 * Raccoglie eventi della giornata e compiti/lavori aperti e invia un report via Resend.
 */
export async function GET(req: NextRequest) {
  return handleDailyBriefing(req)
}

export async function POST(req: NextRequest) {
  return handleDailyBriefing(req)
}

async function handleDailyBriefing(req: NextRequest) {
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

    // Data odierna in fuso orario italiano
    const now = new Date()
    const formatterDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const todayStr = formatterDate.format(now) // YYYY-MM-DD

    const dateFormattedHuman = new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now)

    // 1. Recupera Eventi di oggi
    const { data: events } = await admin
      .from('calendar_events')
      .select('id, title, description, event_time, category')
      .eq('event_date', todayStr)
      .order('event_time', { ascending: true })

    // 2. Recupera Compiti/Task (in scadenza oggi o aperti e prioritari)
    const { data: tasks } = await admin
      .from('tasks')
      .select('id, title, status, priority, due_date, assigned_to, profiles!tasks_assigned_to_fkey(full_name)')
      .neq('status', 'done')
      .order('priority', { ascending: false })

    const todayTasks = (tasks || []).filter((t) => t.due_date === todayStr)
    const priorityTasks = (tasks || []).filter(
      (t) => t.due_date !== todayStr && (t.priority === 'urgent' || t.priority === 'high')
    )

    // 3. Recupera Email dei destinatari del team
    const { data: profiles } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('is_active', true)
      .eq('is_agent', false)

    const recipientEmails = (profiles || [])
      .map((p) => p.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes('@') && !e.endsWith('.local') && !e.includes('nemotron')))

    if (recipientEmails.length === 0) {
      return NextResponse.json({ error: 'Nessun destinatario trovato in profiles' }, { status: 400 })
    }

    // Costruzione HTML dell'email
    const eventsHtml =
      events && events.length > 0
        ? events
            .map(
              (e) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 12px; font-weight: 600; color: #0f172a; width: 85px;">⏰ ${e.event_time || '09:00'}</td>
            <td style="padding: 10px 12px;">
              <span style="font-weight: 600; color: #1e293b;">${escapeHtml(e.title)}</span>
              ${e.description ? `<br><span style="font-size: 12px; color: #64748b;">${escapeHtml(e.description)}</span>` : ''}
            </td>
            <td style="padding: 10px 12px; text-align: right;">
              <span style="background: #f1f5f9; color: #475569; font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase;">
                ${escapeHtml(e.category)}
              </span>
            </td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="3" style="padding: 14px; text-align: center; color: #64748b; font-style: italic;">Nessun evento o meeting programmato per oggi.</td></tr>`

    const todayTasksHtml =
      todayTasks.length > 0
        ? todayTasks
            .map(
              (t: any) => `
          <li style="margin-bottom: 8px; color: #1e293b;">
            <b>${escapeHtml(t.title)}</b> 
            <span style="font-size: 12px; color: #ef4444; font-weight: 600;">(In scadenza oggi!)</span>
            ${t.profiles?.full_name ? `<span style="font-size: 12px; color: #64748b;"> — Assegnato a: ${escapeHtml(t.profiles.full_name)}</span>` : ''}
          </li>`
            )
            .join('')
        : `<p style="color: #64748b; margin: 0; font-size: 13px; font-style: italic;">Nessun compito in scadenza oggi.</p>`

    const priorityTasksHtml =
      priorityTasks.length > 0
        ? priorityTasks
            .map(
              (t: any) => `
          <li style="margin-bottom: 8px; color: #1e293b;">
            <b>${escapeHtml(t.title)}</b> 
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: ${t.priority === 'urgent' ? '#fee2e2; color: #dc2626;' : '#fef3c7; color: #d97706;'}">
              ${t.priority.toUpperCase()}
            </span>
            ${t.profiles?.full_name ? `<span style="font-size: 12px; color: #64748b;"> — Assegnato a: ${escapeHtml(t.profiles.full_name)}</span>` : ''}
          </li>`
            )
            .join('')
        : `<p style="color: #64748b; margin: 0; font-size: 13px; font-style: italic;">Nessun altro compito urgente aperto.</p>`

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; margin: 0; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: #0f172a; padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">🌅 Morning Briefing Operativo</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8; text-transform: capitalize;">${escapeHtml(dateFormattedHuman)}</p>
        </div>

        <div style="padding: 24px 28px;">
          <!-- Sezione 1: Calendario & Meeting -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
              📅 Agenda & Riunioni di Oggi (${events?.length || 0})
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tbody>${eventsHtml}</tbody>
            </table>
          </div>

          <!-- Sezione 2: Compiti in Scadenza Oggi -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
              🚨 Compiti in Scadenza Oggi (${todayTasks.length})
            </h2>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              ${todayTasksHtml}
            </ul>
          </div>

          <!-- Sezione 3: Lavori Prioritari Aperti -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
              ⚡ Lavori Urgenti / Priorità Alta Aperti (${priorityTasks.length})
            </h2>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              ${priorityTasksHtml}
            </ul>
          </div>

          <!-- Bottone di Apertura Piattaforma -->
          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
            <a href="https://aiutiamoci.cloud" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Apri la Piattaforma di Lavoro
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Report automatico generato da aiutiamoci.cloud • Invio giornaliero per il team
        </div>
      </div>
    </body>
    </html>
    `

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'aiutiamoci Impresa <impresa@aiutiamoci.cloud>'
    const sendRes = await resend.emails.send({
      from: fromEmail,
      to: recipientEmails,
      subject: `🌅 Morning Briefing: ${events?.length || 0} eventi e ${todayTasks.length} scadenze per oggi`,
      html: emailHtml,
    })

    if (sendRes.error) {
      console.error('[Daily Briefing Resend Error]:', sendRes.error)
      return NextResponse.json({ error: sendRes.error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipients: recipientEmails,
      eventsCount: events?.length || 0,
      todayTasksCount: todayTasks.length,
      priorityTasksCount: priorityTasks.length,
      emailId: sendRes.data?.id,
    })
  } catch (err: any) {
    console.error('[Daily Briefing Exception]:', err)
    return NextResponse.json({ error: err?.message || 'Errore interno' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
