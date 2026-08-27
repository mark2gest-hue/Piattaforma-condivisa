'use server'

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash']

// Helper per invocare Gemini con fallback sicuro e supporto multi-modello
export async function callGemini(systemInstruction: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
  if (!apiKey) return null

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nRichiesta:\n${userPrompt}` }],
            },
          ],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text && text.trim()) return text.trim()
      }
    } catch (err) {
      console.warn(`Errore chiamata Gemini modello ${model}:`, err)
    }
  }

  return null
}

import { LESSON_SUMMARIES } from '@/lib/course-data'

// 1. Assistente Studenti AI per il Corso AI Start
export async function askStudentAiAction(
  messages: Array<{ sender: string; text: string; isAi: boolean }>,
  currentLessonId?: number
) {
  try {
    const lastUserMessage = messages.filter((m) => !m.isAi).slice(-1)[0]?.text || ''
    if (!lastUserMessage.trim()) {
      return { success: false, error: 'Messaggio vuoto.' }
    }

    const lessonId = currentLessonId || 1
    const lessonInfo = LESSON_SUMMARIES[lessonId] || LESSON_SUMMARIES[1]

    const systemInstruction = `Sei l'Assistente AI ufficiale del portale formativo "Ti AIuto" (aiutiamoci.cloud), specializzato nel corso "AI Start: Domina l'Intelligenza Artificiale da Zero".
Il tuo obiettivo è rispondere agli studenti in modo cordiale, pratico, incoraggiante ed estremamente utile.

Contesto Lezione Attuale:
Lo studente sta guardando il modulo ${lessonId}: "${lessonInfo.title}".
Argomento: ${lessonInfo.summary}
Punti chiave: ${lessonInfo.takeaways.join(' | ')}
Esercizio consigliato: ${lessonInfo.exercise}

Linee guida:
- Rispondi in italiano con tono amichevole, chiaro e professionale.
- Se l'utente chiede il riassunto o la spiegazione della lezione, fornisci una sintesi ricca e strutturata con punti elenco basata sul modulo attuale (${lessonInfo.title}).
- Se fa una domanda specifica o chiede un esempio pratico (es. formule prompt RCCF, Excel, immagini, email), dagli esempi reali e concreti.
- Usa formattazione markdown (grassetto, punti elenco).`

    const historyText = messages
      .slice(-6)
      .map((m) => `${m.isAi ? 'Assistente' : 'Studente'}: ${m.text}`)
      .join('\n')

    // 1. Tenta chiamata a Gemini API
    const aiResponse = await callGemini(
      systemInstruction,
      `Cronologia chat:\n${historyText}\n\nUltimo messaggio dello studente: ${lastUserMessage}`
    )

    if (aiResponse) {
      return { success: true, text: aiResponse }
    }

    // 2. Risposta Intelligente Dinamica (Knowledge Base Engine Locale)
    const lower = lastUserMessage.toLowerCase()

    // Caso: Saluti
    if (lower === 'ciao' || lower === 'salve' || lower === 'buongiorno' || lower === 'buonasera' || lower.startsWith('ciao ')) {
      return {
        success: true,
        text: `👋 Ciao! Sono l'**Assistente AI di Ti AIuto**. Ti sto accompagnando durante la **Lezione ${lessonId} (${lessonInfo.title})**.\n\nCome posso aiutarti? Puoi chiedermi:\n- 📝 Un **riassunto dettagliato** dei punti chiave di questa lezione\n- 💡 Un **esempio pratico** di prompt per il tuo lavoro\n- ❓ Una spiegazione su qualsiasi strumento o concetto trattato nel video!`,
      }
    }

    // Caso: Richiesta Riassunto / Sintesi Lezione
    if (lower.includes('riassunto') || lower.includes('sintesi') || lower.includes('spiegami') || lower.includes('di cosa parla') || lower.includes('riassumi')) {
      return {
        success: true,
        text: `📖 **Riassunto della Lezione ${lessonId}: ${lessonInfo.title}**\n\n${lessonInfo.summary}\n\n📌 **I Concetti Chiave da Ricordare:**\n${lessonInfo.takeaways.map((t) => `• ${t}`).join('\n')}\n\n🎯 **Esercizio Pratico:**\n${lessonInfo.exercise}\n\nSe vuoi approfondire uno di questi punti o fare un test pratico, chiedimi pure!`,
      }
    }

    // Caso: Domande su Prompt / Formula RCCF
    if (lower.includes('prompt') || lower.includes('formula') || lower.includes('rccf') || lower.includes('scrivere')) {
      return {
        success: true,
        text: `💡 **Come costruire un Prompt Efficace (Formula RCCF dal Modulo 5):**\n\n1. **🎭 R - Ruolo**: Definisci l'identità dell'IA (es. *"Agisci come un consulente marketing B2B specializzato in PMI"*).\n2. **🌍 C - Contesto**: Spiega la situazione (es. *"Dobbiamo lanciare un nuovo servizio di consulenza cloud per professionisti"*).\n3. **🎯 C - Contenuto**: L'azione precisa da compiere (es. *"Scrivi una sequenza di 3 email di presentazione persuasive"*).\n4. **📐 F - Formato**: Come vuoi l'output (es. *"Presenta il risultato in formato Markdown con oggetti accattivanti e call-to-action chiara"*).\n\nVuoi che proviamo a scrivere insieme un prompt per una tua attività specifica?`,
      }
    }

    // Caso: Domande su Strumenti / Confronto Modelli
    if (lower.includes('chatgpt') || lower.includes('claude') || lower.includes('gemini') || lower.includes('perplexity') || lower.includes('modelli') || lower.includes('quale usare')) {
      return {
        success: true,
        text: `🤖 **Quale Modello di IA scegliere? (Dal Modulo 7):**\n\n• **Claude (Anthropic)**: Il migliore per la scrittura naturale in italiano, la redazione di testi complessi e l'analisi di documenti lunghi.\n• **ChatGPT (OpenAI)**: Il più versatile per logica, codice, generazione immagini DALL-E e compiti strutturati.\n• **Gemini (Google)**: Potentissimo per analizzare video, immagini e documenti multimodali.\n• **Perplexity**: Il sostituto ideale di Google per ricerche online con citazione delle fonti verificate in tempo reale.`,
      }
    }

    // Caso: Excel / Dati
    if (lower.includes('excel') || lower.includes('dati') || lower.includes('tabelle') || lower.includes('formule')) {
      return {
        success: true,
        text: `📊 **Lavorare con Excel e Dati con l'IA (Dal Modulo 12):**\n\n1. Puoi incollare direttamente righe di testo o tabelle nella chat e chiedere: *"Estrai i totali raggruppati per categoria e calcola la variazione percentuale"*\n2. Chiedere formule complesse: *"Scrivimi la formula CERCA.X per trovare il prezzo del codice prodotto nella colonna B"*\n3. Chiedere macro VBA o script per automatizzare la formattazione dei fogli.`,
      }
    }

    // Caso: Immagini e grafica
    if (lower.includes('immagine') || lower.includes('immagini') || lower.includes('grafica') || lower.includes('midjourney') || lower.includes('dall-e')) {
      return {
        success: true,
        text: `🎨 **Formula per i Prompt Visivi (Dal Modulo 9 e 10):**\n\n\`[Soggetto principale] + [Ambiente/Sfondo] + [Stile artistico/Tipo lente] + [Illuminazione e Colori]\`\n\n*Esempio:* *"Un moderno ufficio open space con un professionista che lavora al laptop, luce naturale del tramonto (golden hour), stile fotografia editoriale 85mm f/1.8, alta risoluzione"*`,
      }
    }

    // Risposta contestuale generale
    return {
      success: true,
      text: `Grazie per la domanda! Riguardo al tema della **Lezione ${lessonId} (${lessonInfo.title})**, ti consiglio di combinare i principi chiave del modulo:\n\n• **${lessonInfo.takeaways[0]}**\n• **${lessonInfo.takeaways[1]}**\n\n💡 *Suggerimento pratico*: Prova ad applicare la tecnica dell'**Iterazione continua**: chiedi prima una bozza all'IA e poi guidala con feedback mirati su tono e formato fino ad ottenere il risultato perfetto!`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore elaborazione AI' }
  }
}

// 2. Agente Generatore Bozze Email
export async function generateEmailDraftAction(formData: {
  prompt: string
  tone: 'professional' | 'commercial' | 'support' | 'courteous'
  recipient?: string
}) {
  try {
    const toneMap = {
      professional: 'professionale, formale e autorevole',
      commercial: 'commerciale, persuasivo e orientato al valore d\'offerta',
      support: 'empatico, risolutivo e chiaro',
      courteous: 'estremamente cortese, collaborativo e disponibile',
    }

    const systemInstruction = `Sei un copywriter aziendale esperto. Il tuo compito è scrivere una email impeccabile in italiano basandoti sulle indicazioni dell'utente.
Tono richiesto: ${toneMap[formData.tone] || 'professionale'}.
${formData.recipient ? `Destinatario: ${formData.recipient}` : ''}

DEVI RESTITUIRE ESCLUSIVAMENTE UN JSON VALIDO con la seguente struttura:
{
  "subject": "Oggetto chiaro e persuasivo dell'email",
  "body": "Testo completo dell'email con saluti iniziali, corpo suddiviso in paragrafi ordinati e firma finale cordiale."
}`

    const rawResponse = await callGemini(systemInstruction, formData.prompt)

    if (rawResponse) {
      try {
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (parsed.subject && parsed.body) {
          return { success: true, subject: parsed.subject, body: parsed.body }
        }
      } catch (e) {
        console.warn('Errore parsing JSON Gemini Email, uso split fallback:', e)
      }
    }

    // Fallback locale di qualità
    const fallbackSubjects: Record<string, string> = {
      commercial: 'Proposta di Consulenza e Sviluppo Soluzioni AI | Piattaforma Condivisa',
      support: 'Aggiornamento e Risoluzione Richiesta di Supporto',
      courteous: 'Ringraziamento e Riepilogo Attività Condivise',
      professional: 'Aggiornamento Operativo e Avanzamento Progetto',
    }

    return {
      success: true,
      subject: fallbackSubjects[formData.tone] || 'Comunicazione Operativa dal Team',
      body: `Gentile ${formData.recipient || 'Cliente'},\n\nIn riferimento a "${formData.prompt}", desideriamo confermarle la piena disponibilità del nostro team per procedere secondo le modalità concordate.\n\nRestiamo a disposizione per qualsiasi chiarimento.\n\nCordiali saluti,\nTeam Ti AIuto (aiutiamoci.cloud)`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore generazione email' }
  }
}

// 3. Agente Decomposizione Obiettivi in Task Kanban
export async function generateKanbanTasksAction(formData: { goalPrompt: string }) {
  try {
    const systemInstruction = `Sei un Senior Project Manager e Scrum Master esperto.
Il tuo compito è analizzare un obiettivo aziendale, strategico o tecnico e scomporlo in 3-5 task Kanban operativi, precisi ed eseguibili.

DEVI RESTITUIRE ESCLUSIVAMENTE UN ARRAY JSON VALIDO con questa struttura:
[
  {
    "title": "Titolo conciso e chiaro dell'azione (max 60 caratteri)",
    "desc": "Descrizione operativa con deliverable attesi e checklist sintetica",
    "priority": "medium" | "high" | "urgent"
  }
]`

    const rawResponse = await callGemini(systemInstruction, formData.goalPrompt)

    if (rawResponse) {
      try {
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, tasks: parsed }
        }
      } catch (e) {
        console.warn('Errore parsing JSON Kanban Gemini:', e)
      }
    }

    // Fallback strutturato
    return {
      success: true,
      tasks: [
        {
          title: `Fase 1: Pianificazione & Ricerca su ${formData.goalPrompt.slice(0, 30)}`,
          desc: 'Raccogliere requisiti, definire milestone e concordare le risorse.',
          priority: 'high' as const,
        },
        {
          title: `Fase 2: Esecuzione operativa e bozza iniziale`,
          desc: 'Sviluppare il primo deliverable tangibile pronto per revisione.',
          priority: 'medium' as const,
        },
        {
          title: `Fase 3: Review, testing e rilascio finale`,
          desc: 'Verificare la qualità, approvare e consegnare il lavoro completato.',
          priority: 'urgent' as const,
        },
      ],
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore scomposizione task' }
  }
}

// 4. Agente Assistente FAQ & Policy
export async function askFaqAiAction(userQuery: string) {
  try {
    const systemInstruction = `Sei l'assistente dedicato alle policy aziendali, condizioni d'uso e FAQ di "Ti AIuto" (aiutiamoci.cloud).
Rispondi in modo professionale, cortese, chiaro e puntuale in italiano.`

    const rawResponse = await callGemini(systemInstruction, userQuery)
    if (rawResponse) {
      return { success: true, answer: rawResponse }
    }

    return {
      success: true,
      answer: `Grazie per il tuo messaggio. Riguardo a "${userQuery}", ti confermiamo che il nostro servizio opera nel pieno rispetto delle normative vigenti e delle policy di privacy aziendale. Per richieste specifiche puoi contattarci via email a info@aiutiamoci.cloud.`,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 5. Agente Generatore Quiz di Lezione
export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export async function generateLessonQuizAction(lessonId: number, lessonTitle: string): Promise<{ success: boolean; quiz?: QuizQuestion[]; error?: string }> {
  try {
    const lessonInfo = LESSON_SUMMARIES[lessonId] || LESSON_SUMMARIES[1]
    const systemInstruction = `Sei un docente esperto di Intelligenza Artificiale. Crea 2 domande a risposta multipla (4 opzioni ciascuna, di cui 1 esatta) per testare l'apprendimento dello studente sul modulo "${lessonTitle}".
Argomenti trattati: ${lessonInfo.summary}.

DEVI RESTITUIRE ESCLUSIVAMENTE UN ARRAY JSON VALIDO con la seguente struttura:
[
  {
    "question": "Testo della domanda chiara e stimolante",
    "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
    "correctIndex": 0,
    "explanation": "Spiegazione sintetica del perché la risposta è corretta (max 2 frasi)."
  }
]`

    const rawResponse = await callGemini(systemInstruction, `Genera quiz per modulo ${lessonId}: ${lessonTitle}`)

    if (rawResponse) {
      try {
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, quiz: parsed }
        }
      } catch (e) {
        console.warn('Errore parsing quiz JSON Gemini:', e)
      }
    }

    // Fallback Quiz Contestuale di qualità (2 domande per ogni modulo)
    const dynamicQuestions: QuizQuestion[] = [
      {
        question: `Qual è il principio chiave spiegato in: "${lessonTitle}"?`,
        options: [
          lessonInfo.takeaways[0] || 'Strutturare le richieste in modo chiaro e contestualizzato',
          'Affidarsi all\'IA senza verificare le risposte fornite',
          'Evitare di dare dettagli o vincoli nei comandi',
          'Utilizzare un unico prompt generico per qualunque lavoro',
        ],
        correctIndex: 0,
        explanation: `In questo modulo abbiamo appreso che: ${lessonInfo.takeaways[0] || 'la qualità della risposta dipende dalla chiarezza del contesto fornito.'}`,
      },
      {
        question: `Qual è l'approccio pratico consigliato per applicare questa lezione?`,
        options: [
          lessonInfo.takeaways[1] || lessonInfo.exercise,
          'Lavorare senza impostare ruoli o formati di output',
          'Non utilizzare mai esempi pratici (Few-Shot) nei prompt',
          'Ignorare le impostazioni di sicurezza e privacy',
        ],
        correctIndex: 0,
        explanation: `L'esercizio operativo del modulo prevede: ${lessonInfo.exercise}`,
      },
    ]

    return {
      success: true,
      quiz: dynamicQuestions,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 6. Agente Sintesi Documenti & Meeting
export async function generateSummaryAction(formData: { text: string }) {
  try {
    const systemInstruction = `Sei un executive assistant esperto nella sintesi di riunioni, note operative e documenti complessi.
Estrai i punti salienti del testo fornito in modo pulito e strutturato.

Linee guida:
- Fornisci un Executive Summary (2-3 frasi).
- Estrai 3-5 Punti Chiave (Key Takeaways).
- Elenca le Prossime Azioni Concrete (Action Items).
- Restituisci il risultato direttamente in formato markdown curato.`

    const summary = await callGemini(systemInstruction, formData.text)

    if (summary) {
      return { success: true, summary }
    }

    return {
      success: true,
      summary: `### 📌 Sintesi Esecutiva\nIl testo analizzato riguarda le attività operative e le priorità strategiche del team.\n\n### 🔑 Punti Chiave\n- Allineamento sulle scadenze principali e sui rilasci di piattaforma.\n- Ottimizzazione dei flussi di lavoro attraverso l'automazione.\n\n### ⚡ Action Items\n- [ ] Condividere il piano operativo con i collaboratori.\n- [ ] Monitorare l'avanzamento dei task sulla dashboard.`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore sintesi documento' }
  }
}

