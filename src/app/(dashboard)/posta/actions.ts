'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { autoIndexToSecondBrain } from '@/app/actions/knowledge'
import { sendEmailWithFallback } from '@/lib/email-sender'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSharedEmail(formData: {
  to: string
  subject: string
  body: string
  from?: string
  threadId?: string
  attachments?: {
    filename: string
    content: string // Base64 encoded string
    contentType?: string
  }[]
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const chosenFrom = formData.from || process.env.RESEND_FROM_EMAIL || 'aiutiamoci Impresa <impresa@aiutiamoci.cloud>'
    const isImpresa = chosenFrom.includes('impresa@') || chosenFrom.includes('mark2.cloud') || chosenFrom.includes('mar2.cloud')
    
    const replyToAddress = chosenFrom.includes('impresa@') ? 'impresa@aiutiamoci.cloud' : isImpresa ? 'info@mark2.cloud' : 'info@aiutiamoci.cloud'
    const headerTitle = isImpresa ? 'aiutiamoci Impresa • Soluzioni AI per PMI' : 'aiutiamoci • Campus Formativo AI'
    const footerText = isImpresa 
      ? `aiutiamoci Impresa • Divisione Consulenza & Sviluppo AI<br>Per assistenza o informazioni contatta <a href="mailto:${replyToAddress}" style="color: #0284c7;">${replyToAddress}</a>.` 
      : 'Ricevi questa email dalla piattaforma aiutiamoci.cloud.<br>Per assistenza rispondi direttamente a questa email o contatta info@aiutiamoci.cloud.'
    const accentColor = isImpresa ? '#0ea5e9' : '#0284c7'

    console.log(`[Resend] Invio email da: ${chosenFrom} (Reply-To: ${replyToAddress}) a: ${formData.to} | Oggetto: ${formData.subject} | Allegati: ${formData.attachments?.length || 0}`)

    // Generazione HTML formattato pulito per supporto multi-part (HTML + Plain Text)
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 28px; }
          .header { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 2px solid ${accentColor}; padding-bottom: 12px; }
          .content { font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
          .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">${headerTitle}</div>
          <div class="content">${formData.body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="footer">
            ${footerText}
          </div>
        </div>
      </body>
      </html>
    `

    // Invio con Dual-Engine Fallback (Resend primario -> Brevo automatico se quota superata o errore)
    const sendResult = await sendEmailWithFallback({
      from: chosenFrom,
      to: formData.to,
      replyTo: replyToAddress,
      subject: formData.subject,
      text: formData.body,
      html: formattedHtml,
      attachments: formData.attachments,
      headers: {
        'X-Entity-Ref-ID': `aiutiamoci-${Date.now()}`,
      },
    })

    if (!sendResult.success) {
      console.error('[Email Send Error (Entrambi i provider falliti)]:', sendResult.error)
      return { success: false, error: sendResult.error || 'Errore invio email' }
    }

    console.log(`[Email Success] Inviata tramite ${sendResult.provider} - ID: ${sendResult.messageId}`)

    // Salva l'email inviata nel database Supabase
    await (supabase as any).from('emails').insert({
      direction: 'outbound',
      from_address: chosenFrom,
      to_address: [formData.to],
      subject: formData.subject,
      body_text: formData.body,
      status: 'sent',
      thread_id: formData.threadId || null,
      resend_id: sendResult.messageId,
      created_by: user?.id || null,
    })

    return { success: true, resendId: sendResult.messageId, provider: sendResult.provider }
  } catch (error: any) {
    console.error('Errore server in sendSharedEmail:', error)
    return { success: false, error: error.message || 'Errore interno del server' }
  }
}

export async function updateEmailStatus(emailId: string, status: 'received' | 'read' | 'archived') {
  try {
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', emailId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Errore updateEmailStatus:', err)
    return { success: false, error: err.message }
  }
}

export async function moveToTrash(emailId: string) {
  try {
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'trash', updated_at: new Date().toISOString() })
      .eq('id', emailId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Errore moveToTrash:', err)
    return { success: false, error: err.message }
  }
}

export async function moveToTrashBulk(emailIds: string[]) {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'trash', updated_at: new Date().toISOString() })
      .in('id', emailIds)

    if (error) throw error
    return { success: true, count: emailIds.length }
  } catch (err: any) {
    console.error('Errore moveToTrashBulk:', err)
    return { success: false, error: err.message }
  }
}

export async function restoreFromTrash(emailId: string) {
  return updateEmailStatus(emailId, 'read')
}

export async function restoreFromTrashBulk(emailIds: string[]) {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .in('id', emailIds)

    if (error) throw error
    return { success: true, count: emailIds.length }
  } catch (err: any) {
    console.error('Errore restoreFromTrashBulk:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Eliminazione Definitiva (Hard-Delete):
 * 1. Salva i message_id in deleted_email_identifiers (blacklist anti-reimport)
 * 2. Si connette alle caselle Aruba IMAP per rimuovere fisicamente i messaggi
 * 3. Cancella le righe dalla tabella emails
 */
export async function permanentlyDeleteEmails(emailIds: string[]): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()

    // 1. Recupera le email da eliminare per avere i message_id e gli account associati
    const { data: emailsToDelete, error: fetchErr } = await supabase
      .from('emails')
      .select('id, message_id, to_address, from_address')
      .in('id', emailIds)

    if (fetchErr) throw fetchErr

    const validEmails = emailsToDelete || []
    const messageIds = validEmails.map((e) => e.message_id).filter(Boolean) as string[]

    // 2. Inserisci i message_id nella tabella blacklist anti-reimport
    if (messageIds.length > 0) {
      const recordsToBlacklist = messageIds.map((msgId) => ({
        message_id: msgId,
        deleted_at: new Date().toISOString(),
      }))
      await (supabase as any)
        .from('deleted_email_identifiers')
        .upsert(recordsToBlacklist, { onConflict: 'message_id' })
    }

    // 3. Prova a cancellare fisicamente i messaggi dai server IMAP di Aruba
    try {
      const imapConfigRes = await getImapAccountsConfig()
      const accounts = imapConfigRes.accounts || []

      if (accounts.length > 0 && messageIds.length > 0) {
        const { ImapFlow } = await import('imapflow')

        for (const acc of accounts) {
          if (!acc.email || !acc.password) continue

          const client = new ImapFlow({
            host: 'imaps.aruba.it',
            port: 993,
            secure: true,
            auth: {
              user: acc.email.trim(),
              pass: acc.password.trim(),
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 10000,
            logger: false,
          })

          try {
            await client.connect()
            const lock = await client.getMailboxLock('INBOX')

            try {
              for (const emailItem of validEmails) {
                if (!emailItem.message_id) continue

                // Cerca per message-id header su IMAP
                const searchCriteria: any = {
                  header: { 'message-id': emailItem.message_id }
                }

                // Cerca messaggi corrispondenti
                const uids = await client.search(searchCriteria)
                if (uids && uids.length > 0) {
                  // Contrassegna come Deleted ed esegui expunge
                  await client.messageDelete(uids)
                }
              }
            } finally {
              lock.release()
            }

            await client.logout()
          } catch (imapErr: any) {
            console.warn(`[Hard-Delete IMAP] Errore rimozione da server Aruba per ${acc.email}:`, imapErr.message)
          }
        }
      }
    } catch (e: any) {
      console.warn('[Hard-Delete IMAP] Modulo ImapFlow non eseguito o errore generico:', e.message)
    }

    // 4. Cancella definitivamente le righe dalla tabella emails di Supabase
    const { error: delErr } = await supabase
      .from('emails')
      .delete()
      .in('id', emailIds)

    if (delErr) throw delErr

    return { success: true, count: validEmails.length }
  } catch (err: any) {
    console.error('Errore permanentlyDeleteEmails:', err)
    return { success: false, error: err.message }
  }
}

// Retrocompatibilità per codice esistente
export async function deleteSharedEmail(emailId: string) {
  return moveToTrash(emailId)
}

export async function deleteSharedEmailsBulk(emailIds: string[]) {
  return moveToTrashBulk(emailIds)
}

export async function markEmailsAsReadBulk(emailIds: string[]) {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .in('id', emailIds)

    if (error) throw error
    return { success: true, count: emailIds.length }
  } catch (err: any) {
    console.error('Errore markEmailsAsReadBulk:', err)
    return { success: false, error: err.message }
  }
}

export async function archiveSharedEmail(emailId: string) {
  return updateEmailStatus(emailId, 'archived')
}

export async function unarchiveSharedEmail(emailId: string) {
  return updateEmailStatus(emailId, 'read')
}

export async function archiveEmailsBulk(emailIds: string[]) {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .in('id', emailIds)

    if (error) throw error
    return { success: true, count: emailIds.length }
  } catch (err: any) {
    console.error('Errore archiveEmailsBulk:', err)
    return { success: false, error: err.message }
  }
}

export async function unarchiveEmailsBulk(emailIds: string[]) {
  try {
    if (!emailIds || emailIds.length === 0) return { success: true, count: 0 }
    const supabase = await createClient()
    const { error } = await (supabase as any)
      .from('emails')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .in('id', emailIds)

    if (error) throw error
    return { success: true, count: emailIds.length }
  } catch (err: any) {
    console.error('Errore unarchiveEmailsBulk:', err)
    return { success: false, error: err.message }
  }
}

export interface EmailAIAnalysis {
  category: 'urgente' | 'supporto' | 'commerciale' | 'informativo' | 'spam'
  priority: 1 | 2 | 3 | 4 | 5
  summary: string
  suggestedReply: string
  autoReplyCandidate: boolean
  sentiment: 'positivo' | 'neutro' | 'critico' | 'urgente'
  confidence: number
}

export async function analyzeEmailWithAI(emailData: {
  emailId: string
  subject: string
  body: string
  fromAddress: string
  toAddress?: string
}): Promise<{ success: boolean; analysis?: EmailAIAnalysis; error?: string }> {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: 'GEMINI_API_KEY non trovata nelle variabili d\'ambiente. Se l\'hai appena aggiunta su Vercel, esegui un Redeploy del progetto.',
      }
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)

    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-pro',
    ]

    const prompt = `
Sei un agente AI avanzato per la gestione della posta aziendale del team "aiutiamoci" e "Mar2" (domini aiutiamoci.cloud e mar2.cloud).
Il tuo compito è analizzare con precisione l'email ricevuta, categorizzarla, valutare la priorità, scrivere un riassunto sintetico ed elaborare una bozza di risposta professionale, cordiale e puntuale in lingua italiana.

Dati dell'email:
- ID: ${emailData.emailId || 'N/A'}
- Mittente: ${emailData.fromAddress || 'Sconosciuto'}
- Destinatario: ${emailData.toAddress || 'Team'}
- Oggetto: ${emailData.subject || '(Nessun oggetto)'}
- Contenuto:
"""
${emailData.body || '(Nessun testo)'}
"""

Regole di output JSON:
1. "category": uno tra "urgente", "supporto", "commerciale", "informativo", "spam".
2. "priority": numero intero da 1 (massima urgenza/bloccante) a 5 (bassa priorità/informativo).
3. "summary": riassunto chiaro e conciso in 1-2 frasi in italiano.
4. "suggestedReply": bozza di risposta pronta all'uso a nome del Team (firmata "Il Team aiutiamoci.cloud" o "Il Team di Supporto"). Se spam o notifica automatica, stringa vuota "".
5. "autoReplyCandidate": boolean (true solo per conferme/ricezioni standard semplici o FAQ ovvie; false se richiede valutazione umana).
6. "sentiment": uno tra "positivo", "neutro", "critico", "urgente".
7. "confidence": intero da 0 a 100.

Rispondi ESCLUSIVAMENTE con un JSON valido (senza markdown o altro testo):
{
  "category": "urgente",
  "priority": 1,
  "summary": "...",
  "suggestedReply": "...",
  "autoReplyCandidate": false,
  "sentiment": "neutro",
  "confidence": 95
}
`

    let responseText = ''
    let lastError: any = null

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        })
        const result = await model.generateContent(prompt)
        responseText = result.response.text()
        if (responseText) break
      } catch (err: any) {
        lastError = err
        // Try fallback without responseMimeType if not supported
        try {
          const fallbackModel = genAI.getGenerativeModel({ model: modelName })
          const result = await fallbackModel.generateContent(prompt)
          responseText = result.response.text()
          if (responseText) break
        } catch (subErr) {
          lastError = subErr
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error('Nessun modello Gemini disponibile per generare la risposta')
    }

    // Pulizia da blocchi markdown ```json se presenti
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsedData: EmailAIAnalysis = JSON.parse(cleanJson)

    // Inserimento automatico nel Secondo Cervello per ricerca e consultazione
    autoIndexToSecondBrain({
      title: `[Email] ${emailData.subject || 'Senza Oggetto'} (${emailData.fromAddress || 'Mittente'})`,
      category: 'copywriting',
      description: `Analisi AI Email: Categoria ${parsedData.category.toUpperCase()} • Priorità ${parsedData.priority}/5`,
      content: `### ✉️ Email Ricevuta
**Da:** ${emailData.fromAddress}
**A:** ${emailData.toAddress || 'Team'}
**Oggetto:** ${emailData.subject}

**Testo originale:**
${emailData.body}

---
### 🎯 Sintesi AI
${parsedData.summary}

### 💡 Bozza di Risposta Consigliata
${parsedData.suggestedReply}`,
      tags: ['email', 'posta', parsedData.category, `priorita-${parsedData.priority}`],
    }).catch((e) => console.warn('Errore auto-index email:', e))

    return {
      success: true,
      analysis: parsedData,
    }
  } catch (error: any) {
    console.error('Errore in analyzeEmailWithAI:', error)
    return {
      success: false,
      error: error.message || 'Errore durante l\'analisi AI dell\'email con Gemini',
    }
  }
}

export async function getImapAccountsConfig(): Promise<{ success: boolean; accounts?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Non autenticato' }
    }

    // Cerchiamo la configurazione nel DB per categoria univoca di sistema
    const { data } = await supabase
      .from('knowledge_items')
      .select('content')
      .eq('category', 'system_imap_config')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data && data.content) {
      try {
        const parsed = JSON.parse(data.content)
        if (Array.isArray(parsed)) {
          return { success: true, accounts: parsed }
        }
      } catch {}
    }

    return { success: true, accounts: [] }
  } catch (err: any) {
    console.error('Errore getImapAccountsConfig:', err)
    return { success: false, error: err.message }
  }
}

export async function saveImapAccountsConfig(accounts: any[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Non autenticato' }
    }

    // Cerchiamo se esiste già un record
    const { data: existing } = await supabase
      .from('knowledge_items')
      .select('id')
      .eq('category', 'system_imap_config')
      .limit(1)
      .maybeSingle()

    const payload = {
      title: 'Configurazione Caselle IMAP Aruba (Sistema)',
      category: 'system_imap_config',
      tags: ['system', 'imap', 'aruba'],
      description: 'Credenziali caselle di posta sincronizzate per n8n e cron background',
      content: JSON.stringify(accounts),
    }

    let error: any = null
    if (existing?.id) {
      const res = await supabase.from('knowledge_items').update(payload).eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('knowledge_items').insert(payload)
      error = res.error
    }

    if (error) {
      console.warn('Avviso salvataggio imap config su DB:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Errore saveImapAccountsConfig:', err)
    return { success: false, error: err.message }
  }
}


