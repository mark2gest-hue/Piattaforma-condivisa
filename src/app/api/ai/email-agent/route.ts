import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface EmailAnalysisResult {
  category: 'urgente' | 'supporto' | 'commerciale' | 'informativo' | 'spam'
  priority: 1 | 2 | 3 | 4 | 5
  summary: string
  suggestedReply: string
  autoReplyCandidate: boolean
  sentiment: 'positivo' | 'neutro' | 'critico' | 'urgente'
  confidence: number
}

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY non configurata sul server. Esegui un Redeploy su Vercel se l\'hai appena aggiunta.' },
        { status: 500 }
      )
    }

    const { emailId, subject, body, fromAddress, toAddress } = await req.json()

    if (!subject && !body) {
      return NextResponse.json(
        { error: 'Oggetto o corpo email mancanti per l\'analisi' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
Sei un agente AI avanzato per la gestione della posta aziendale del team "Ti AIuto" e "Mar2" (domini aiutiamoci.cloud e mar2.cloud).
Il tuo compito è analizzare con precisione l'email ricevuta, categorizzarla, valutare la priorità, scrivere un riassunto sintetico ed elaborare una bozza di risposta professionale, empatica e puntuale in lingua italiana.

Dati dell'email:
- ID: ${emailId || 'N/A'}
- Mittente: ${fromAddress || 'Sconosciuto'}
- Destinatario Casella: ${toAddress || 'Non specificato'}
- Oggetto: ${subject || '(Nessun oggetto)'}
- Testo del messaggio:
"""
${body || '(Nessun testo)'}
"""

Regole di analisi:
1. **category**: Scegli ESATTAMENTE una tra: "urgente", "supporto", "commerciale", "informativo", "spam".
   - "urgente": problemi bloccanti, richieste con scadenze immediate, reclami gravi.
   - "supporto": richieste di aiuto tecnico, chiarimenti operativi, problemi d'uso della piattaforma.
   - "commerciale": richieste preventivi, pricing, partnership, opportunità di vendita.
   - "informativo": comunicazioni generali, notifiche, newsletter, conferme di ricezione standard.
   - "spam": email indesiderate, phishing, pubblicità non pertinente.
2. **priority**: Un numero intero da 1 (massima urgenza/criticità) a 5 (bassa priorità / puramente informativo).
3. **summary**: Un riassunto chiaro e conciso in 1-2 frasi (in italiano) di cosa chiede/comunica il mittente.
4. **suggestedReply**: Una bozza di risposta pronta all'uso, cordiale e professionale a nome del Team (firmata "Il Team di Supporto" o "Team Ti AIuto"), che risponde direttamente ai punti sollevati. Se l'email è spam o una notifica automatica che non richiede risposta, scrivi "".
5. **autoReplyCandidate**: Booleano (true solo se l'email è una semplice richiesta informativa o di conferma standard che non richiede intervento decisionale umano; false se è urgente, complessa, commerciale o di supporto delicato).
6. **sentiment**: Uno tra: "positivo", "neutro", "critico", "urgente".
7. **confidence**: Livello di confidenza da 0 a 100.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido strutturato come segue:
{
  "category": "urgente" | "supporto" | "commerciale" | "informativo" | "spam",
  "priority": 1 | 2 | 3 | 4 | 5,
  "summary": "...",
  "suggestedReply": "...",
  "autoReplyCandidate": true | false,
  "sentiment": "positivo" | "neutro" | "critico" | "urgente",
  "confidence": 95
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    let parsedData: EmailAnalysisResult
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseErr) {
      console.error('Errore parsing JSON da Gemini:', responseText, parseErr)
      return NextResponse.json(
        { error: 'Risposta non valida dal modello AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: parsedData,
    })
  } catch (error: any) {
    console.error('Errore route /api/ai/email-agent:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'analisi AI dell\'email' },
      { status: 500 }
    )
  }
}
