import { Resend } from 'resend'

interface EmailAttachment {
  filename: string
  content: string // Base64 string
  contentType?: string
}

export interface SendEmailPayload {
  from: string
  to: string | string[]
  replyTo?: string
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
}

export interface SendEmailResult {
  success: boolean
  provider: 'resend' | 'brevo'
  messageId?: string
  error?: string
}

const resend = new Resend(process.env.RESEND_API_KEY)
const BREVO_API_KEY = process.env.BREVO_API_KEY || ''

/**
 * Invia email tramite Brevo REST API v3
 */
async function sendViaBrevo(payload: SendEmailPayload): Promise<{ messageId: string }> {
  // Parsing del sender (es. "Aiutiamoci <info@aiutiamoci.cloud>" oppure "info@aiutiamoci.cloud")
  let senderName = 'Aiutiamoci'
  let senderEmail = 'info@aiutiamoci.cloud'

  const senderMatch = payload.from.match(/^(.*?)\s*<(.+?)>$/)
  if (senderMatch) {
    senderName = senderMatch[1].trim() || 'Aiutiamoci'
    senderEmail = senderMatch[2].trim()
  } else if (payload.from.includes('@')) {
    senderEmail = payload.from.trim()
  }

  // Normalizza destinatari
  const recipients = (Array.isArray(payload.to) ? payload.to : [payload.to]).map((em) => ({
    email: em.trim(),
  }))

  const brevoBody: Record<string, any> = {
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject: payload.subject,
    htmlContent: payload.html || payload.text || '',
    textContent: payload.text || undefined,
  }

  if (payload.replyTo) {
    brevoBody.replyTo = { email: payload.replyTo }
  }

  if (payload.headers) {
    brevoBody.headers = payload.headers
  }

  if (payload.attachments && payload.attachments.length > 0) {
    brevoBody.attachment = payload.attachments.map((att) => ({
      name: att.filename,
      content: att.content, // Base64
    }))
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(brevoBody),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`[Brevo API Error ${res.status}]: ${errText}`)
  }

  const data = await res.json()
  return { messageId: data.messageId || `brevo-${Date.now()}` }
}

/**
 * Dispatcher con Dual-Engine Fallback:
 * 1. Prova prima Resend (Primario transazionale)
 * 2. Se fallisce per quota, rate-limit (429) o errore rete -> passa all'istante su Brevo (Paracadute)
 */
export async function sendEmailWithFallback(payload: SendEmailPayload): Promise<SendEmailResult> {
  // 1. TENTATIVO CON RESEND
  try {
    const resendAttachments = payload.attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.contentType,
    }))

    const resendResponse = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text || '',
      html: payload.html,
      attachments: resendAttachments && resendAttachments.length > 0 ? resendAttachments : undefined,
      headers: payload.headers,
    })

    if (!resendResponse.error) {
      return {
        success: true,
        provider: 'resend',
        messageId: resendResponse.data?.id,
      }
    }

    console.warn('⚠️ [Resend ha risposto con errore]:', resendResponse.error.message)
    console.log('🔄 Attivazione automatica Paracadute Brevo...')
  } catch (resendErr: any) {
    console.warn('⚠️ [Eccezione Resend]:', resendErr?.message)
    console.log('🔄 Attivazione automatica Paracadute Brevo...')
  }

  // 2. FALLBACK SU BREVO
  try {
    const brevoRes = await sendViaBrevo(payload)
    console.log(`✅ [Brevo Fallback Success] Email inviata con successo ID: ${brevoRes.messageId}`)
    return {
      success: true,
      provider: 'brevo',
      messageId: brevoRes.messageId,
    }
  } catch (brevoErr: any) {
    console.error('❌ [Brevo Fallback Failed]:', brevoErr?.message)
    return {
      success: false,
      provider: 'brevo',
      error: `Entrambi i provider falliti. Brevo: ${brevoErr?.message}`,
    }
  }
}
