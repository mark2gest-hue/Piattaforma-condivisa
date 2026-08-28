'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY non configurata nel file .env.local' }
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

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

Rispondi ESCLUSIVAMENTE con il JSON:
{
  "category": "urgente" | "supporto" | "commerciale" | "informativo" | "spam",
  "priority": 1,
  "summary": "...",
  "suggestedReply": "...",
  "autoReplyCandidate": false,
  "sentiment": "neutro",
  "confidence": 95
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsedData: EmailAIAnalysis = JSON.parse(responseText)

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

