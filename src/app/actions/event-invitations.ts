

'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SelectableRecipient {
  id: string
  name: string
  email: string
  source: 'student' | 'client' | 'team' | 'lead'
  detail?: string
}

export async function getSelectableRecipientsAction(): Promise<{
  success: boolean
  recipients?: SelectableRecipient[]
  error?: string
}> {
  try {
    const adminClient = createAdminClient()
    const map = new Map<string, SelectableRecipient>()

    // 1. Studenti (student_codes)
    const { data: students } = await adminClient
      .from('student_codes')
      .select('id, student_email, student_name, access_tier, code')
      .eq('is_active', true)

    if (students) {
      students.forEach((s) => {
        const email = s.student_email?.trim()
        if (email && email.includes('@')) {
          const key = email.toLowerCase()
          if (!map.has(key)) {
            map.set(key, {
              id: `std-${s.id}`,
              name: s.student_name?.trim() || email.split('@')[0],
              email,
              source: 'student',
              detail: `Studente (${s.access_tier || 'Corso'}) • Cod: ${s.code}`,
            })
          }
        }
      })
    }

    // 2. Clienti Rubrica (clients)
    const { data: clients } = await adminClient
      .from('clients')
      .select('id, first_name, last_name, email, company, category')

    if (clients) {
      clients.forEach((c) => {
        const email = c.email?.trim()
        if (email && email.includes('@')) {
          const key = email.toLowerCase()
          if (!map.has(key)) {
            const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim()
            map.set(key, {
              id: `client-${c.id}`,
              name: fullName || c.company || email.split('@')[0],
              email,
              source: 'client',
              detail: c.company ? `Cliente • ${c.company}` : `Cliente (${c.category || 'Rubrica'})`,
            })
          }
        }
      })
    }

    // 3. Soci & Membri Team (profiles)
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name, role, is_agent')
      .eq('is_agent', false)

    if (profiles) {
      profiles.forEach((p) => {
        // I profili hanno tipicamente un'email ricavabile o nome
        const name = p.full_name?.trim()
        // Se non hanno colonna email in profiles, possiamo escludere o inserire se mappata
      })
    }

    // 4. Lead lista d'attesa (waitlist_leads)
    const { data: leads } = await adminClient
      .from('waitlist_leads')
      .select('id, email, name')

    if (leads) {
      leads.forEach((l) => {
        const email = l.email?.trim()
        if (email && email.includes('@')) {
          const key = email.toLowerCase()
          if (!map.has(key)) {
            map.set(key, {
              id: `lead-${l.id}`,
              name: l.name?.trim() || email.split('@')[0],
              email,
              source: 'lead',
              detail: 'Lead Lista Attesa',
            })
          }
        }
      })
    }

    const recipients = Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
    )

    return { success: true, recipients }
  } catch (err: any) {
    console.error('[getSelectableRecipientsAction] Errore:', err)
    return { success: false, error: err.message, recipients: [] }
  }
}

export interface SendEventInvitationsParams {
  eventTitle: string
  eventDate: string // YYYY-MM-DD
  eventTime: string
  meetUrl?: string
  description?: string
  recipientType?: 'single' | 'ai-start' | 'ai-pro' | 'all' | 'pending'
  recipientCategories?: ('single' | 'ai-start' | 'ai-pro' | 'pending' | 'waitlist')[]
  studentCohort?: 'new' | 'all' // 'new' = solo iscritti nuova edizione (Settembre-Ottobre 2026), 'all' = tutti
  customEmails?: string // separate da virgola
  scheduledAt?: string // ISO string o formato data/ora per l'invio programmato
  senderProfile?: 'campus' | 'impresa' // 'campus' (info@aiutiamoci.cloud) o 'impresa' (impresa@aiutiamoci.cloud / reply-to: info@mark2.cloud)
  customSenderName?: string
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
      let query = adminClient
        .from('student_codes')
        .select('student_email, student_name, access_tier, code, created_at')
        .eq('is_active', true)
        .in('access_tier', tiersToFetch)

      // Se selezionato solo nuova edizione (default), esclude i corsisti storici di Maggio e gli account interni
      if (params.studentCohort !== 'all') {
        query = query
          .gte('created_at', '2026-08-01T00:00:00Z')
          .not('code', 'in', '("SUPERADMIN","DEMO2026","LMS")')
      }

      const { data: students, error: stdError } = await query

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

    const isImpresa = params.senderProfile === 'impresa'
    const defaultSenderName = isImpresa ? 'aiutiamoci Impresa' : 'aiutiamoci'
    const senderDisplayName = params.customSenderName?.trim() || defaultSenderName
    
    // Mittente Resend (il dominio @aiutiamoci.cloud è verificato su Resend)
    const fromAddress = isImpresa ? 'impresa@aiutiamoci.cloud' : 'info@aiutiamoci.cloud'
    const fromEmail = `${senderDisplayName} <${fromAddress}>`
    
    // Indirizzo di risposta
    const replyToEmail = isImpresa ? 'info@mark2.cloud' : 'info@aiutiamoci.cloud'
    
    const brandHeader = isImpresa ? 'aiutiamoci Impresa • Soluzioni AI per PMI' : 'aiutiamoci • Campus Didattico'
    const brandFooter = isImpresa ? 'aiutiamoci Impresa • Divisione Consulenza & Sviluppo AI' : 'aiutiamoci • Campus Formativo & Operativo AI'
    const brandAccentColor = isImpresa ? '#0ea5e9' : '#0284c7'

    const hasMeetLink = Boolean(params.meetUrl && params.meetUrl.trim().length > 0)
    const finalMeetUrl = hasMeetLink ? params.meetUrl!.trim() : ''

    const meetButtonHtml = hasMeetLink ? `
      <div style="margin: 26px 0; text-align: center; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px;">
        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
          🟢 Stanza Videochiamata Pronta
        </p>
        <a href="${finalMeetUrl}" target="_blank" style="background: linear-gradient(135deg, ${brandAccentColor} 0%, #0369a1 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(2,132,199,0.35);">
          📹 Accedi alla Videocall (Google Meet)
        </a>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #475569;">
          Link diretto: <a href="${finalMeetUrl}" target="_blank" style="color: ${brandAccentColor}; font-family: monospace; font-weight: 600; text-decoration: underline;">${finalMeetUrl}</a>
        </p>
      </div>
    ` : ''

    let sentCount = 0
    let failedCount = 0

    // Invio email (con limite concorrenza per non saturare Resend)
    for (const recipient of targetEmails) {
      const recipientName = recipient.name || 'Partecipante'
      const emailBadge = hasMeetLink ? 'Invito Ufficiale Riunione & Sessione' : 'Comunicazione Ufficiale & Avviso'
      const emailIntro = hasMeetLink 
        ? "Ti confermiamo la data e l'orario per la nostra prossima sessione live in videoconferenza:" 
        : "Ti inviamo una comunicazione importante in merito al seguente appuntamento / avviso:"
      const emailSubject = hasMeetLink
        ? `Invito: ${params.eventTitle} (${params.eventDate} ore ${params.eventTime})`
        : `Comunicazione: ${params.eventTitle} (${params.eventDate})`

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 12px; color: #0f172a; -webkit-text-size-adjust: 100%; }
            .container { max-width: 600px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .header { background: #0f172a; padding: 24px 20px; text-align: center; border-bottom: 4px solid ${brandAccentColor}; }
            .header h1 { margin: 0; font-size: 18px; color: #ffffff; font-weight: 800; letter-spacing: -0.02em; }
            .header p { margin: 4px 0 0 0; color: #38bdf8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            .content { padding: 24px 20px; }
            .event-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 18px 0; border: 1px solid #e2e8f0; border-left: 5px solid ${brandAccentColor}; }
            .event-title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3; }
            .event-row { font-size: 14px; color: #334155; margin: 6px 0; line-height: 1.4; display: block; }
            .message-box { margin-top: 14px; font-size: 14px; line-height: 1.6; color: #1e293b; background: #ffffff; padding: 14px 16px; border-radius: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap; word-break: break-word; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>${brandHeader}</p>
              <h1>${emailBadge}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 12px; color: #0f172a;">Gentile <strong>${recipientName}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 14px;">
                ${emailIntro}
              </p>

              <div class="event-card">
                <div class="event-title">📌 ${params.eventTitle}</div>
                ${hasMeetLink ? `
                  <div class="event-row">🗓️ <strong>Data:</strong>&nbsp;${params.eventDate}</div>
                  ${params.eventTime ? `<div class="event-row">⏰ <strong>Orario:</strong>&nbsp;${params.eventTime}</div>` : ''}
                ` : ''}
                ${params.description ? `<div class="message-box">${params.description.replace(/\n/g, '<br/>')}</div>` : ''}
              </div>

              ${meetButtonHtml}

              ${hasMeetLink ? `
                <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                  💡 <em>Ti consigliamo di collegarti qualche minuto prima per verificare microfono e webcam. Non è necessaria alcuna installazione: la stanza funziona direttamente nel tuo browser.</em>
                </p>
              ` : `
                <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                  💡 <em>Per qualsiasi domanda o chiarimento puoi rispondere direttamente a questa email.</em>
                </p>
              `}
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">${brandFooter}</p>
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 11px;">
                Ricevi questa comunicazione da <strong>${senderDisplayName}</strong> tramite la piattaforma <a href="https://aiutiamoci.cloud" style="color: #0284c7; text-decoration: none;">aiutiamoci.cloud</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                Per assistenza o informazioni rispondi a questa email o contatta <a href="mailto:${replyToEmail}" style="color: #64748b;">${replyToEmail}</a>.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const plainTextContent = `
Gentile ${recipientName},

${emailIntro}

📌 ${params.eventTitle}
🗓️ Data: ${params.eventDate}
${params.eventTime ? `⏰ Orario: ${params.eventTime}\n` : ''}${params.description ? `\nMessaggio:\n${params.description}\n` : ''}${hasMeetLink ? `\n🔗 Link per accedere alla videochiamata Google Meet:\n${finalMeetUrl}\n\nTi consigliamo di collegarti qualche minuto prima per verificare microfono e webcam.\nNon è necessaria alcuna installazione: la stanza funziona direttamente nel tuo browser.\n` : ''}
---
${brandFooter}
Per informazioni o assistenza rispondi a questa email o scrivi a ${replyToEmail}
`.trim()

      try {
        const emailPayload: any = {
          from: fromEmail,
          to: recipient.email,
          replyTo: replyToEmail,
          subject: emailSubject,
          html: htmlContent,
          text: plainTextContent,
        }

        if (params.scheduledAt && params.scheduledAt.trim().length > 0) {
          emailPayload.scheduledAt = params.scheduledAt.trim()
        }

        const res = await resend.emails.send(emailPayload)
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
