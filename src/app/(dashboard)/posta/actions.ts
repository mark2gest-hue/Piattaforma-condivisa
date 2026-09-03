'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { autoIndexToSecondBrain } from '@/app/actions/knowledge'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSharedEmail(formData: {
  to: string
  subject: string
  body: string
  from?: string
  threadId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const chosenFrom = formData.from || process.env.RESEND_FROM_EMAIL || 'Ti AIuto <info@aiutiamoci.cloud>'

    console.log(`[Resend] Invio email da: ${chosenFrom} a: ${formData.to} | Oggetto: ${formData.subject}`)

    // Invio effettivo tramite Resend SDK
    const resendResponse = await resend.emails.send({
      from: chosenFrom,
      to: formData.to,
      subject: formData.subject,
      text: formData.body,
    })

    if (resendResponse.error) {
      console.error('[Resend Error]:', resendResponse.error)
      return { success: false, error: resendResponse.error.message }
    }

    console.log(`[Resend Success] Email inviata ID: ${resendResponse.data?.id}`)

    // Salva l'email inviata nel database Supabase
    await (supabase as any).from('emails').insert({
      direction: 'outbound',
      from_address: chosenFrom,
      to_address: [formData.to],
      subject: formData.subject,
      body_text: formData.body,
      status: 'sent',
      thread_id: formData.threadId || null,
      resend_id: resendResponse.data?.id,
      created_by: user?.id || null,
    })

    return { success: true, resendId: resendResponse.data?.id }
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

export async function deleteSharedEmail(emailId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Errore deleteSharedEmail:', err)
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
Sei un agente AI avanzato per la gestione della posta aziendale del team "Ti AIuto" e "Mar2" (domini aiutiamoci.cloud e mar2.cloud).
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
4. "suggestedReply": bozza di risposta pronta all'uso a nome del Team (firmata "Il Team Ti AIuto" o "Il Team di Supporto"). Se spam o notifica automatica, stringa vuota "".
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


