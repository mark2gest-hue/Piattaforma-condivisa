import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  return handleGenerateUpdates(req)
}

export async function GET(req: NextRequest) {
  return handleGenerateUpdates(req)
}

async function handleGenerateUpdates(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const now = new Date()
    const dateStr = now.toLocaleDateString('it-IT')
    const weekNumber = Math.ceil(now.getDate() / 7)
    const isEvenWeek = weekNumber % 2 === 0

    // Determina il tipo di contenuto della settimana (alternanza: Tutorial Prompt vs News Verificate)
    const contentTheme = isEvenWeek ? 'tutorial_prompts' : 'verified_news'

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY

    let generatedItems = []

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash-latest',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        })

        const prompt = `
Sei l'Agente Editoriale per la piattaforma formativa "aiutiamoci.cloud" (Corso AI per Imprenditori e Professionisti).
Oggi è il ${dateStr}. Devi generare gli aggiornamenti settimanali per gli studenti del Corso Base e Pro.

VINCOLI RIGIDI E TASSATIVI:
1. NESSUNA FAKE NEWS o dichiarazioni speculative: cita solo fatti oggettivi e confermati su modelli (OpenAI, Anthropic Claude, Google Gemini, DeepSeek, automazione agenti).
2. NESSUNA PUBBLICITÀ o menzione a creator esterni, influencer, canali YouTube o guru dell'AI.
3. I TUTORIAL devono essere strettamente coerenti con quanto trattato nel Corso Base: come fare prompt efficaci (Framework RCCF), prompt pronti per email commerciali, pulizia dati Excel/CSV, sintesi documenti e analisi costi.
4. INCLUDI SEMPRE una pillola su cosa si potrà fare proseguendo con il Corso Agenti AI (es. automazione senza intervento umano, customer support H24, agenti collegati al CRM).
5. I prompt devono avere un testo completo pronto da incollare (senza placeholder generici), spiegazione del perché funzionano e risultato atteso.

Tema della settimana: ${contentTheme === 'tutorial_prompts' ? 'Settimana Tutorial & Prompt Operativi' : 'Settimana Notizie AI Verificate & Trend Modelli'}.

Genera ESATTAMENTE 2 o 3 item in formato JSON con la seguente struttura:
[
  {
    "id": "upd-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-1",
    "title": "Titolo chiaro e professionale",
    "category": "${contentTheme === 'tutorial_prompts' ? 'Tutorial' : 'News'}",
    "type": "${contentTheme === 'tutorial_prompts' ? 'prompt_tutorial' : 'news'}",
    "badge": "PROMPT PRONTO",
    "duration": "5 min lettura",
    "date": "${dateStr}",
    "description": "Sintesi in 2 frasi di cosa tratta l'aggiornamento.",
    "content_markdown": "Testo approfondito con spiegazione, punti chiave e consigli pratici per l'uso in azienda.",
    "prompts": [
      {
        "title": "Nome del prompt operativo",
        "goal": "Cosa risolve questo prompt",
        "text": "Testo completo del prompt con ruolo, contesto, compiti e formato...",
        "explanation": "Spiegazione tecnica del perché questa formulazione evita allucinazioni",
        "expectedResult": "Cosa restituirà esattamente il modello IA"
      }
    ],
    "action_label": "Apri Strumento",
    "action_url": "/chat"
  },
  {
    "id": "upd-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-2",
    "title": "Pillola Agenti: ...",
    "category": "Approfondimento",
    "type": "agent_preview",
    "badge": "ANTEPRIMA AGENTI",
    "duration": "4 min lettura",
    "date": "${dateStr}",
    "description": "Come automatizzare questo processo con gli Agenti Autonomi.",
    "content_markdown": "Spiegazione di come passare dal fare il prompt manuale al delegarlo a un Agente che gira in background...",
    "prompts": [],
    "action_label": "Scopri Workshop Agenti",
    "action_url": "/workshop-agenti"
  }
]
`
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        generatedItems = JSON.parse(text)
      } catch (geminiErr) {
        console.warn('Fallback a generatore locale deterministico:', geminiErr)
      }
    }

    // Se Gemini non è disponibile o fallisce, usiamo un generatore deterministico collaudato
    if (!generatedItems || generatedItems.length === 0) {
      if (contentTheme === 'tutorial_prompts') {
        generatedItems = [
          {
            id: `upd-${Date.now()}-1`,
            title: 'Prompt Avanzato per Rielaborazione Note Vocali e Verbali Riunioni',
            category: 'Tutorial',
            type: 'prompt_tutorial',
            badge: 'PROMPT PRONTO',
            duration: '5 min lettura',
            date: dateStr,
            description: 'Come trasformare una trascrizione grezza o un appunto vocale disordinato in un verbale esecutivo con azioni assegnate.',
            content_markdown: `Le trascrizioni vocali contengono spesso ripetizioni, pause e cambi di argomento. Con questo prompt strutturato, l'IA estrae solo le decisioni prese e la tabella delle responsabilità:
- Elimina convenevoli e divagazioni.
- Mappa le scadenze e i referenti.
- Fornisce un executive summary leggibile in 30 secondi.`,
            prompts: [
              {
                title: 'Prompt Formattatore Verbale Esecutivo',
                goal: 'Estrarre decisioni e to-do list da audio trascritto o appunti disordinati',
                text: `Agisci come Executive Assistant di Direzione Generale.

Analizza la seguente trascrizione grezza di una riunione o nota vocale:
"""
[INCOLLA QUI IL TESTO TRASCRITTO O GLI APPUNTI]
"""

Genera un verbale strutturato con:
1. **Decisioni Chiave**: Elenco puntato sintetico delle sole decisioni approvate.
2. **Matrice Azioni (Action Items)**: Tabella Markdown con colonne: | Azione | Responsabile | Priorità (Alta/Media/Bassa) | Termine Previsto |
3. **Punti Aperti / Da chiarire**: Elementi rimasti in sospeso che richiedono approfondimento.

Vincoli: non inventare dettagli non presenti nel testo. Se un responsabile non è citato, scrivi "Da assegnare".`,
                explanation: 'La struttura tabellare e la regola di non inventare forzano il modello a non allucinare scadenze o persone.',
                expectedResult: 'Un documento esecutivo pulito pronto da inviare ai partecipanti via email.'
              }
            ],
            action_label: 'Prova in Chat',
            action_url: '/chat'
          },
          {
            id: `upd-${Date.now()}-2`,
            title: 'Pillola Agenti: Dai Verbali Manuali alla Gestione Automatica Task',
            category: 'Approfondimento',
            type: 'agent_preview',
            badge: 'ANTEPRIMA AGENTI',
            duration: '3 min lettura',
            date: dateStr,
            description: 'Come un agente autonomo può ascoltare la nota vocale su Telegram e creare direttamente le schede su Trello o nel gestionale.',
            content_markdown: `Nel Corso Base eseguiamo questo prompt copiando e incollando il testo. 
Nel **Corso Agenti AI** colleghiamo l'IA direttamente a un bot Telegram e alle API del gestionale:
1. Invii il vocale su Telegram mentre sei in macchina.
2. L'agente trascrive l'audio, esegue il prompt del verbale e crea automaticamente le card nella sezione Lavori con la priorità corretta.
3. Ricevi la notifica di conferma senza aver toccato la tastiera.`,
            prompts: [],
            action_label: 'Scopri Workshop Agenti',
            action_url: '/workshop-agenti'
          }
        ]
      } else {
        generatedItems = [
          {
            id: `upd-${Date.now()}-1`,
            title: 'Aggiornamento Modelli: Extended Thinking e Riduzione Allucinazioni nei Dati Finanziari',
            category: 'News',
            type: 'news',
            badge: 'NEWS VERIFICATA',
            duration: '4 min lettura',
            date: dateStr,
            description: 'I benchmark ufficiali confermano il salto di precisione con le modalità di ragionamento passo-passo sui fogli di calcolo complessi.',
            content_markdown: `Negli ultimi mesi l'architettura dei modelli di punta (o1/o3 di OpenAI, Claude 3.7 Sonnet con Extended Thinking, Gemini 2.5 Flash Thinking) ha introdotto il ragionamento a catena prima di produrre la risposta.

**Cosa cambia per le PMI:**
- **Zero errori sui calcoli percentuali**: I modelli ora generano codice Python o formule matematiche verificate prima di restituire il totale.
- **Analisi bilanci e contratti**: Possibilità di caricare documenti da 100+ pagine senza perdita di memoria tra il primo e l'ultimo articolo.
- **Meno tentativi di prompt**: Non serve più guidare manualmente ogni singolo passaggio analitico.`,
            prompts: [],
            action_label: 'Leggi Approfondimento',
            action_url: '/corsi'
          },
          {
            id: `upd-${Date.now()}-2`,
            title: 'Pillola Agenti: Quando Conviene Usare un Agente Invece della Chat',
            category: 'Approfondimento',
            type: 'agent_preview',
            badge: 'ANTEPRIMA AGENTI',
            duration: '3 min lettura',
            date: dateStr,
            description: 'Regola pratica per capire quando un task va svolto a mano con un prompt e quando va delegato a un workflow autonomo.',
            content_markdown: `**Regola dei 3 Minuti**:
- Se un'attività si ripete più di 3 volte a settimana e richiede sempre gli stessi passaggi (es. leggere un PDF, estrarre 5 campi, compilare un foglio Excel), fare il prompt manuale ogni volta è uno spreco di tempo.
- Quella è la soglia esatta in cui si attiva un **Agente Autonomo**, che monitora la cartella o la casella email e fa tutto in background.`,
            prompts: [],
            action_label: 'Esplora Agenti Autonomi',
            action_url: '/workshop-agenti'
          }
        ]
      }
    }

    // Salvataggio nel database Supabase
    let savedCount = 0
    for (const item of generatedItems) {
      const { error } = await (supabase as any)
        .from('course_weekly_updates')
        .upsert(
          {
            id: item.id,
            title: item.title,
            category: item.category,
            type: item.type,
            badge: item.badge,
            duration: item.duration,
            date: item.date,
            description: item.description,
            content_markdown: item.content_markdown,
            prompts: item.prompts || [],
            action_label: item.action_label,
            action_url: item.action_url,
          },
          { onConflict: 'id' }
        )

      if (!error) savedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Generati e salvati ${savedCount} aggiornamenti per la settimana del ${dateStr}`,
      items: generatedItems,
    })
  } catch (err: any) {
    console.error('Errore generazione aggiornamenti settimanali:', err)
    return NextResponse.json({ error: err?.message || 'Errore interno' }, { status: 500 })
  }
}
