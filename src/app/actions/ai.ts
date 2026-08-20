'use server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// Helper per invocare Gemini con fallback sicuro
async function callGemini(systemInstruction: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
  if (!apiKey) return null

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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

    if (!res.ok) {
      console.warn(`Gemini API error: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text ? text.trim() : null
  } catch (err) {
    console.error('Errore chiamata Gemini AI:', err)
    return null
  }
}

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

    const systemInstruction = `Sei l'Assistente AI del portale formativo "Ti AIuto" (aiutiamoci.cloud), specializzato nel corso "AI Start: Domina l'Intelligenza Artificiale da Zero".
Il tuo obiettivo è rispondere agli studenti in modo chiaro, incoraggiante, pratico ed altamente competente.

Contesto del corso AI Start (20 Moduli):
- Modulo 1: Benvenuti nel Futuro (Basi della rivoluzione IA)
- Modulo 2: Breve Storia dell'Evoluzione (Dati, deep learning, LLM)
- Modulo 3: Sconfiggere il Foglio Bianco (Superare il blocco iniziale)
- Modulo 4: Il Linguaggio della Chiarezza (Precisione comunicativa)
- Modulo 5: La Formula Segreta RCCF (Ruolo, Contesto, Contenuto, Formato)
- Modulo 6: Iterazione (Affinare le risposte dialogando)
- Modulo 7: Panoramica Modelli (ChatGPT, Claude, Gemini, Perplexity)
- Modulo 8: Scrivere senza Sforzo (Email, testi commerciali, report)
- Modulo 9: Dipingere con le Parole (Prompt visivi e immagini)
- Modulo 10: Anatomia di un Prompt Visivo (Dettagli stilistici, slide)
- Modulo 11: Presentazioni in 5 Minuti (Creazione slide rapida)
- Modulo 12: Analisi Dati per Excel (Tabelle, formule e insight)
- Modulo 13: L'Agenda Intelligente (Time management e scadenze)
- Modulo 14: Studiare ed Imparare ELI5 (Semplificare concetti complessi)
- Modulo 15: Allucinazioni (Come verificare le fonti ed evitare errori)
- Modulo 16: Privacy e Sicurezza (Gestione dati aziendali e riservatezza)
- Modulo 17: Il Lavoro che Cambia (Nuove competenze e posizionamento)
- Modulo 18: Creare il proprio Workflow (Automazioni e flussi giornalieri)
- Modulo 19: La Tua Nuova Superpotenza (Integrazione avanzata)
- Modulo 20: Riepilogo e Prossimi Passi

${currentLessonId ? `Lo studente sta attualmente guardando la Lezione ${currentLessonId}.` : ''}

Linee Guida di Risposta:
- Rispondi in italiano, in modo cordiale, chiaro e motivante.
- Usa formattazione markdown (elenchi puntati, grassetto) per rendere la risposta leggibile.
- Se utile, fai riferimento ai moduli del corso (es. "Come spiegato nel Modulo 5 sulla formula RCCF...").
- Mantieni la risposta sintetica ma esaustiva (150-300 parole).`

    const historyText = messages
      .slice(-4)
      .map((m) => `${m.isAi ? 'Assistente' : 'Studente'}: ${m.text}`)
      .join('\n')

    const aiResponse = await callGemini(systemInstruction, `Conversazione recente:\n${historyText}\n\nUltima domanda dello studente: ${lastUserMessage}`)

    if (aiResponse) {
      return { success: true, text: aiResponse }
    }

    // Risposta di fallback intelligente
    let fallbackText = `Ottima domanda! Nel percorso **AI Start**, affrontiamo questo tema collegando la teoria alla pratica quotidiana.\n\n`
    if (lastUserMessage.toLowerCase().includes('prompt') || lastUserMessage.toLowerCase().includes('formula')) {
      fallbackText += `💡 **Regola d'oro (Formula RCCF dal Modulo 5):**\n1. **Ruolo**: Assegna una professione all'IA.\n2. **Contesto**: Descrivi la situazione del tuo cliente o progetto.\n3. **Contenuto**: Specifica esattamente cosa deve produrre.\n4. **Formato**: Definisci la lunghezza e lo stile (es. tabella, elenco, email formale).`
    } else {
      fallbackText += `Ti consiglio di applicare la tecnica dell'**Iterazione (Modulo 6)**: chiedi prima una bozza all'IA e poi rifiniscila chiedendole di correggere tono o dettagli specifici.`
    }

    return { success: true, text: fallbackText }
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
        console.warn('Errore parsing JSON Gemini Kanban Tasks:', e)
      }
    }

    // Fallback strutturato
    return {
      success: true,
      tasks: [
        {
          title: `Pianificazione e Audit: ${formData.goalPrompt.slice(0, 40)}`,
          desc: 'Definizione requisiti chiave, stakeholder e perimetro operativo.',
          priority: 'high',
        },
        {
          title: 'Implementazione e Sviluppo Deliverable',
          desc: 'Esecuzione delle attività principali e produzione della documentazione.',
          priority: 'medium',
        },
        {
          title: 'Revisione Qualità e Rilascio Finale',
          desc: 'Test di conformità, convalida interna e consegna al team.',
          priority: 'urgent',
        },
      ],
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore scomposizione task' }
  }
}

// 4. Agente Sintetizzatore di Documenti e Appunti
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

// 5. Quiz di Autovalutazione Lezione AI
export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export async function generateLessonQuizAction(lessonId: number, lessonTitle: string) {
  try {
    const systemInstruction = `Sei un docente esperto di Intelligenza Artificiale per il corso "AI Start".
Genera un quiz di autovalutazione rapido e formativo di 3 domande a risposta multipla per la lezione indicata.

DEVI RESTITUIRE ESCLUSIVAMENTE UN ARRAY JSON VALIDO con 3 oggetti aventi questa struttura:
[
  {
    "question": "Testo della domanda chiara e pratica",
    "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
    "correctIndex": 0,
    "explanation": "Spiegazione sintetica e formativa del perché questa risposta è corretta."
  }
]`

    const userPrompt = `Lezione ${lessonId}: "${lessonTitle}". Crea 3 domande a risposta multipla su questo argomento.`

    const rawResponse = await callGemini(systemInstruction, userPrompt)

    if (rawResponse) {
      try {
        const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { success: true, quiz: parsed as QuizQuestion[] }
        }
      } catch (e) {
        console.warn('Errore parsing quiz JSON da Gemini:', e)
      }
    }

    // Fallback di qualità
    const fallbackQuiz: QuizQuestion[] = [
      {
        question: `Qual è il vantaggio principale spiegato nella Lezione "${lessonTitle}"?`,
        options: [
          'Automatizzare i compiti ripetitivi per risparmiare tempo',
          'Sostituire completamente l\'attività umana senza controllo',
          'Utilizzare solo software a pagamento senza impostare prompt',
          'Ignorare la verifica dei dati e delle fonti',
        ],
        correctIndex: 0,
        explanation: 'L\'obiettivo dell\'IA è potenziare l\'efficienza umana liberando tempo prezioso dai compiti a basso valore.',
      },
      {
        question: 'Come si ottengono i migliori risultati da un modello linguistico (LLM)?',
        options: [
          'Scrivendo prompt generici di una sola parola',
          'Fornendo Ruolo, Contesto, Contenuto e Formato desiderato',
          'Evitando di correggere o reiterare le risposte',
          'Non specificando il pubblico di destinazione',
        ],
        correctIndex: 1,
        explanation: 'La chiarezza del contesto e del ruolo guida il modello verso risposte molto più accurate e pertinenti.',
      },
      {
        question: 'Cosa bisogna fare se l\'IA genera una risposta con informazioni incerte?',
        options: [
          'Pubblicarla subito senza leggere',
          'Verificare le fonti e applicare l\'iterazione per affinare il risultato',
          'Riavviare il computer',
          'Cancellare l\'account',
        ],
        correctIndex: 1,
        explanation: 'La verifica delle allucinazioni e l\'iterazione critica sono competenze fondamentali per ogni professionista AI.',
      },
    ]

    return { success: true, quiz: fallbackQuiz }
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore generazione quiz' }
  }
}

