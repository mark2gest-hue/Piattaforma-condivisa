'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEventInvitationsParams {
  eventTitle: string
  eventDate: string // YYYY-MM-DD
  eventTime: string
  meetUrl?: string
  description?: string
  recipientType?: 'single' | 'ai-start' | 'ai-pro' | 'all' | 'pending'
  recipientCategories?: ('single' | 'ai-start' | 'ai-pro' | 'pending' | 'waitlist')[]
  customEmails?: string // separate da virgola
}

export async function sendEventInvitationsAction(params: SendEventInvitationsParams) {
  try {
    const adminClient = createAdminClient()
    const targetEmails: { email: string; name?: string }[] = []

    // Normalizza le categorie selezionate
    const categories = new Set<string>()
    if (params.recipientCategories && params.recipientCategories.length > 0) {
      params.recipientCategories.forEach(c => categories.add(c))
    } else if (params.recipientType) {
      if (params.recipientType === 'all') {
        categories.add('ai-start')
        categories.add('ai-pro')
        categories.add('pending')
        categories.add('waitlist')
      } else {
        categories.add(params.recipientType)
      }
    }

    // 1. Email Singole / Manuali
    if (categories.has('single') || (params.customEmails && params.customEmails.trim())) {
      if (params.customEmails && params.customEmails.trim()) {
        const raw = params.customEmails.split(/[,;\n]/)
        for (const item of raw) {
          const email = item.trim()
          if (email && email.includes('@')) {
            if (!targetEmails.some((t) => t.email.toLowerCase() === email.toLowerCase())) {
              targetEmails.push({ email, name: email.split('@')[0] })
            }
          }
        }
      }
    }

    // 2. Studenti con codice attivo (AI Start e/o AI Pro)
    const tiersToFetch: string[] = []
    if (categories.has('ai-start')) tiersToFetch.push('ai-start', 'both', 'all')
    if (categories.has('ai-pro')) tiersToFetch.push('ai-pro', 'both', 'all')

    if (tiersToFetch.length > 0) {
      const { data: students, error: stdError } = await adminClient
        .from('student_codes')
        .select('student_email, student_name, access_tier')
        .eq('is_active', true)
        .in('access_tier', tiersToFetch)

      if (stdError) {
        console.error('[sendEventInvitationsAction] Errore fetch studenti:', stdError)
      } else if (students) {
        students.forEach((s) => {
          if (s.student_email && !targetEmails.some((t) => t.email.toLowerCase() === s.student_email.toLowerCase())) {
            targetEmails.push({ email: s.student_email, name: s.student_name || 'Studente' })
          }
        })
      }
    }

    // 3. Utenti registrati in attesa di pagamento / approvazione (course_registrations)
    if (categories.has('pending')) {
      const { data: pendingRegs, error: pendingErr } = await adminClient
        .from('course_registrations')
        .select('email, name, status, approved')
        .or('status.eq.pending,approved.eq.false')

      if (pendingErr) {
        console.error('[sendEventInvitationsAction] Errore fetch registrati in attesa:', pendingErr)
      } else if (pendingRegs) {
        pendingRegs.forEach((p) => {
          if (p.email && !targetEmails.some((t) => t.email.toLowerCase() === p.email.toLowerCase())) {
            targetEmails.push({ email: p.email, name: p.name || 'Partecipante' })
          }
        })
      }
    }

    // 4. Lead lista d'attesa (waitlist_leads)
    if (categories.has('waitlist')) {
      const { data: waitlist } = await adminClient.from('waitlist_leads').select('email, name')
      if (waitlist) {
        waitlist.forEach((w) => {
          if (w.email && !targetEmails.some((t) => t.email.toLowerCase() === w.email.toLowerCase())) {
            targetEmails.push({ email: w.email, name: w.name || 'Professionista' })
          }
        })
      }
    }

    if (targetEmails.length === 0) {
      return { success: false, error: 'Nessun indirizzo email valido specificato o trovato' }
    }

    console.log(`[sendEventInvitationsAction] Invio a ${targetEmails.length} destinatari per evento "${params.eventTitle}"`)

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'aiutiamoci <info@aiutiamoci.cloud>'
    const finalMeetUrl = (params.meetUrl && params.meetUrl.trim().length > 0)
      ? params.meetUrl.trim()
      : 'https://meet.google.com/wsv-bqxm-bvr'

    const meetButtonHtml = `
      <div style="margin: 26px 0; text-align: center; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px;">
        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
          🟢 Stanza Videochiamata Pronta
        </p>
        <a href="${finalMeetUrl}" target="_blank" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(2,132,199,0.35);">
          📹 Accedi alla Videocall (Google Meet)
        </a>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #475569;">
          Link diretto: <a href="${finalMeetUrl}" target="_blank" style="color: #0284c7; font-family: monospace; font-weight: 600; text-decoration: underline;">${finalMeetUrl}</a>
        </p>
      </div>
    `

    let sentCount = 0
    let failedCount = 0

    // Invio email (con limite concorrenza per non saturare Resend)
    for (const recipient of targetEmails) {
      const recipientName = recipient.name || 'Partecipante'
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 28px; text-align: center; border-bottom: 4px solid #0284c7; }
            .header h1 { margin: 0; font-size: 20px; color: #ffffff; font-weight: 800; letter-spacing: -0.02em; }
            .header p { margin: 6px 0 0 0; color: #38bdf8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            .content { padding: 32px 28px; }
            .event-card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 5px solid #0284c7; }
            .event-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; }
            .event-detail { font-size: 14px; color: #334155; margin: 4px 0; display: flex; align-items: center; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>aiutiamoci • Campus Didattico</p>
              <h1>Invito Ufficiale Riunione & Masterclass</h1>
            </div>
            <div class="content">
              <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Ciao <strong>${recipientName}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Ti confermiamo la data e l'orario per la nostra prossima sessione live in videoconferenza:
              </p>

              <div class="event-card">
                <div class="event-title">📌 ${params.eventTitle}</div>
                <div class="event-detail">🗓️ <strong>Data:</strong>&nbsp;${params.eventDate}</div>
                <div class="event-detail">⏰ <strong>Orario:</strong>&nbsp;${params.eventTime}</div>
                ${params.description ? `<div class="event-detail" style="margin-top: 10px; font-style: italic; color: #64748b;">${params.description}</div>` : ''}
              </div>

              ${meetButtonHtml}

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                💡 <em>Ti consigliamo di collegarti qualche minuto prima per verificare microfono e webcam. Non è necessaria alcuna installazione: la stanza funziona direttamente nel tuo browser.</em>
              </p>
            </div>
            <div class="footer">
              Piattaforma Lavoro Condivisa • aiutiamoci.cloud<br>
              Per assistenza rispondi a questa email o visita <a href="https://aiutiamoci.cloud" style="color: #0284c7; text-decoration: none;">aiutiamoci.cloud</a>
            </div>
          </div>
        </body>
        </html>
      `

      try {
        const res = await resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: `🔴 Invito Live: ${params.eventTitle} (${params.eventDate} alle ${params.eventTime})`,
          html: htmlContent,
        })
        if (res.error) {
          console.error(`[Resend error to ${recipient.email}]:`, res.error)
          failedCount++
        } else {
          sentCount++
        }
      } catch (sendErr) {
        console.error(`[Resend exception to ${recipient.email}]:`, sendErr)
        failedCount++
      }
    }

    return {
      success: true,
      sentCount,
      failedCount,
      total: targetEmails.length,
    }
  } catch (err: any) {
    console.error('[sendEventInvitationsAction] Errore critico:', err)
    return { success: false, error: err.message }
  }
}
