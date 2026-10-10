import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, isTest, companyName } = body

    if (!to || !to.includes('@')) {
      return NextResponse.json({ error: 'Indirizzo email destinatario mancante o non valido' }, { status: 400 })
    }

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'Oggetto ed email body obbligatori' }, { status: 400 })
    }

    // Mittente ufficiale verificato su Resend
    const sender = 'Marco | Mark2 Solutions <info@mark2.cloud>'
    const replyTo = 'info@mark2.cloud'

    // Formattazione HTML pulita con disclaimer GDPR di cortesia per cold outreach B2B
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { font-size: 15px; font-weight: 800; color: #0284c7; margin-bottom: 22px; border-bottom: 2px solid #0284c7; padding-bottom: 12px; letter-spacing: -0.3px; }
          .content { font-size: 14px; line-height: 1.65; color: #334155; white-space: pre-wrap; word-break: break-word; }
          .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; background-color: #e0f2fe; color: #0369a1; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          ${isTest ? '<div class="badge">⚠️ EMAIL DI TEST • ANTEPRIMA AUDIT</div>' : ''}
          <div class="header">Mark 2.0 Solutions • Sicurezza & Igiene Digitale</div>
          <div class="content">${emailBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">
            <strong>Mark 2.0 Solutions • Ecosistemi Digitali & Protezione Postura PMI</strong><br>
            Sede: Milano & Riviera • Web: <a href="https://mark2.cloud" style="color: #0284c7; text-decoration: none;">mark2.cloud</a> • Assistenza: <a href="mailto:info@mark2.cloud" style="color: #0284c7; text-decoration: none;">info@mark2.cloud</a><br>
            <span style="font-size: 10px; color: #cbd5e1; margin-top: 8px; display: inline-block;">
              Comunicazione tecnica B2B ai sensi dell'Art. 6.1(f) GDPR. Se non desidera ricevere ulteriori comunicazioni tecniche o suggerimenti sulla postura del vostro dominio, risponda semplicemente "Rimuovimi" a questa email.
            </span>
          </div>
        </div>
      </body>
      </html>
    `

    const finalSubject = isTest ? `[TEST AUDIT] ${subject}` : subject

    console.log(`[Outreach Send] Invio da: ${sender} a: ${to} | Oggetto: ${finalSubject} | Azienda: ${companyName || 'N/A'}`)

    const resendResponse = await resend.emails.send({
      from: sender,
      to: [to],
      replyTo,
      subject: finalSubject,
      html: formattedHtml,
      text: emailBody
    })

    if (resendResponse.error) {
      console.error('[Outreach Send Error]', resendResponse.error)
      return NextResponse.json({ error: resendResponse.error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: resendResponse.data?.id,
      to,
      isTest: !!isTest
    })
  } catch (error: any) {
    console.error('[Outreach Send Catch Error]', error)
    return NextResponse.json({ error: error.message || 'Errore interno del server' }, { status: 500 })
  }
}
