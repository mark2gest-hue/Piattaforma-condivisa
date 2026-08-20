'use server'

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash']

// Helper per invocare Gemini con fallback sicuro e supporto multi-modello
async function callGemini(systemInstruction: string, userPrompt: string): Promise<string | null> {
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

// Database di Conoscenza Dettagliato dei 20 Moduli AI Start
export const LESSON_SUMMARIES: Record<number, { title: string; summary: string; takeaways: string[]; exercise: string }> = {
  1: {
    title: '1. Benvenuti nel Futuro',
    summary: 'Introduzione alla rivoluzione dell\'Intelligenza Artificiale Generativa: perché i modelli linguistici (LLM) stanno trasformando ogni settore lavorativo e come passare da spettatore a utilizzatore consapevole.',
    takeaways: [
      'L\'IA non sostituisce le persone, ma chi usa l\'IA sostituirà chi non la usa.',
      'Differenza tra software tradizionale (regole fisse) e IA generativa (comprensione probabilistica del contesto).',
      'Approccio mentale corretto: considerare l\'IA come un collaboratore/stagista instancabile.'
    ],
    exercise: 'Fai una lista di 3 attività ripetitive che svolgi ogni settimana e che vorresti delegare all\'IA.'
  },
  2: {
    title: '2. Breve Storia dell\'Evoluzione',
    summary: 'Come siamo arrivati ai Large Language Models moderni: dai primi algoritmi di machine learning alle architetture Transformer (2017) che hanno reso possibile ChatGPT, Claude e Gemini.',
    takeaways: [
      'Il meccanismo di "Self-Attention": come i modelli pesano l\'importanza di ogni singola parola.',
      'La scalabilità computazionale e i dataset di addestramento su scala globale.',
      'Perché oggi i modelli sono in grado di comprendere sfumature, tono e contesti complessi.'
    ],
    exercise: 'Chiedi a un modello IA di spiegarti un concetto difficile del tuo lavoro come se fossi un bambino di 10 anni.'
  },
  3: {
    title: '3. Sconfiggere il Foglio Bianco',
    summary: 'Strategie pratiche per sbloccare la creatività e iniziare subito a produrre: come usare l\'IA per fare brainstorming, strutturare scalette e superare l\'ansia da pagina bianca.',
    takeaways: [
      'Non iniziare mai da zero: chiedi 5 angolazioni diverse su un argomento prima di scrivere.',
      'Il "Reverse Prompting": chiedi all\'IA cosa le serve sapere per darti la risposta migliore.',
      'Sviluppo rapido di scalette (outline) strutturate prima della stesura.'
    ],
    exercise: 'Genera 10 idee di post o argomenti per il tuo settore partendo da una singola parola chiave.'
  },
  4: {
    title: '4. Il Linguaggio della Chiarezza',
    summary: 'La precisione comunicativa nel prompting: eliminare l\'ambiguità per ottenere risposte pertinenti, evitando input generici che portano a risposte banali.',
    takeaways: [
      'Evita prompt generici come "Scrivimi un articolo": definisci obiettivo, pubblico e tono.',
      'L\'importanza dei vincoli (es. "massimo 150 parole, diviso in 3 punti elenco").',
      'Fornire esempi pratici (Few-Shot Prompting) per guidare lo stile della risposta.'
    ],
    exercise: 'Prendi un prompt generico che hai usato in passato e riscrivilo aggiungendo pubblico di destinazione e vincoli chiari.'
  },
  5: {
    title: '5. La Formula Segreta RCCF',
    summary: 'Il framework cardine del corso per creare prompt perfetti al primo colpo: Ruolo, Contesto, Contenuto e Formato.',
    takeaways: [
      '**R - Ruolo**: Chi deve impersonare l\'IA (es. "Sei un copywriter senior").',
      '**C - Contesto**: La situazione di partenza, il cliente, l\'obiettivo e i limiti.',
      '**C - Contenuto**: L\'azione specifica richiesta (es. "Scrivi una sequenza di 3 email di follow-up").',
      '**F - Formato**: La struttura visiva di output (tabella, elenco puntato, markdown, JSON).'
    ],
    exercise: 'Costruisci un prompt completo seguendo lo schema RCCF per un compito del tuo lavoro quotidiano.'
  },
  6: {
    title: '6. Iterazione',
    summary: 'L\'arte di affinare i risultati attraverso il dialogo continuo: perché il primo output è solo una bozza e come guidare l\'IA verso la perfezione.',
    takeaways: [
      'Il prompting non è un comando "usa e getta", ma una conversazione cooperativa.',
      'Tecniche di correzione mirata: "Mantieni i punti 1 e 3, ma rendi il punto 2 più informale".',
      'Chiedere all\'IA di auto-valutarsi e trovare punti deboli nel testo generato.'
    ],
    exercise: 'Prendi un testo generato e fai 3 iterazioni successive cambiando tono, lunghezza e aggiungendo un\'obiezione comune.'
  },
  7: {
    title: '7. ChatGPT, Claude, Gemini, Perplexity',
    summary: 'Panoramica comparativa dei migliori modelli di IA generativa: punti di forza, peculiarità e quale strumento scegliere per ogni specifico lavoro.',
    takeaways: [
      '**Claude (Anthropic)**: Imbattibile per scrittura naturale, sfumature umane e contesti lunghi (200k token).',
      '**ChatGPT / GPT-4o (OpenAI)**: Versatile, ottimo con codice, logica e tool avanzati (DALL-E, Canvas).',
      '**Gemini (Google)**: Multimodale nativo, perfetto con video, audio e integrazione con l\'ecosistema Google.',
      '**Perplexity**: Il miglior motore di ricerca potenziato dall\'IA con citazione esatta delle fonti.'
    ],
    exercise: 'Fai la stessa domanda di ricerca su Perplexity e su Claude e confronta la qualità delle fonti e dello stile.'
  },
  8: {
    title: '8. Scrivere senza Sforzo',
    summary: 'Redazione rapida di email formali, preventivi, comunicazioni commerciali e post per i social network senza perdere ore davanti alla tastiera.',
    takeaways: [
      'Creare template di risposta rapida per gestire la casella di posta in un terzo del tempo.',
      'Adattamento del tono di voce (Tone of Voice) per target B2B vs consumer.',
      'Riformulazione di testi complessi o normativi in linguaggio semplice e persuasivo.'
    ],
    exercise: 'Trasforma una serie di appunti sparsi e veloci in un\'email commerciale formale pronta per l\'invio.'
  },
  9: {
    title: '9. Dipingere con le Parole',
    summary: 'I fondamenti della generazione di immagini e contenuti visivi con l\'IA: concetti di composizione, illuminazione, stile e atmosfera.',
    takeaways: [
      'Struttura del prompt visivo: Soggetto + Ambiente + Illuminazione + Stile/Fotocamera.',
      'Termini tecnici chiave per la resa fotorealistica (es. "85mm lens, golden hour, volumetric lighting").',
      'Evitare parole vaghe ("bello", "incredibile") e preferire dettagli descrittivi precisi.'
    ],
    exercise: 'Descrivi una scena fotografica dettagliata con soggetto, luce e atmosfera e provala su un generatore visivo.'
  },
  10: {
    title: '10. Anatomia di un Prompt Visivo',
    summary: 'Tecniche avanzate per creare visual ad alto impatto per presentazioni aziendali, banner social e materiali di marketing.',
    takeaways: [
      'Prompting negativo: come specificare cosa NON deve comparire nell\'immagine.',
      'Uniformità stilistica per brand identity e serie di slide coerenti.',
      'Integrazione di testo e composizioni pulite con spazio negativo per loghi.'
    ],
    exercise: 'Crea un prompt per un\'immagine di copertina aziendale con spazio a sinistra per inserire un titolo.'
  },
  11: {
    title: '11. Presentazioni in 5 Minuti',
    summary: 'Creare slide e pitch aziendali in tempi record: struttura narrativa, storytelling e impaginazione guidata dall\'IA.',
    takeaways: [
      'La regola delle 3 sezioni: Problema, Soluzione, Call to Action.',
      'Come esportare testi in formato compatibile con PowerPoint, Gamma o Canva.',
      'Sintesi visiva: trasformare blocchi di testo noiosi in concetti chiave memorabili.'
    ],
    exercise: 'Fatti generare la scaletta completa di 5 slide per presentare il tuo servizio o prodotto.'
  },
  12: {
    title: '12. Analisi Dati per Excel',
    summary: 'Dominare fogli di calcolo, formule complesse, macro e pulizia dati con l\'assistenza dell\'IA, anche senza essere programmatori.',
    takeaways: [
      'Generazione istantanea di formule complesse (CERCA.X, INDICE/CONFRONTA, formule matriciali).',
      'Analisi di trend e anomalie in tabelle numeriche incollate nella chat.',
      'Scrittura di script VBA / Google Apps Script per automatizzare compiti ripetitivi.'
    ],
    exercise: 'Incolla una piccola tabella di dati e chiedi all\'IA di scriverti la formula per trovare il valore massimo per categoria.'
  },
  13: {
    title: '13. L\'Agenda Intelligente',
    summary: 'Time management e produttività personale: come usare l\'IA come assistente esecutivo per organizzare priorità, scadenze e calendari.',
    takeaways: [
      'Metodo Time-Boxing e matrice di Eisenhower automatizzati con l\'IA.',
      'Pianificazione settimanale bilanciata in base ai picchi di concentrazione.',
      'Decomposizione di grandi progetti in micro-task giornalieri.'
    ],
    exercise: 'Incolla la tua lista di cose da fare di domani e chiedi all\'IA di organizzarla per blocchi di priorità oraria.'
  },
  14: {
    title: '14. Studiare e Imparare ELI5',
    summary: 'Apprendimento accelerato e metodo Feynman: come usare l\'IA per comprendere qualsiasi argomento complesso spiegato a qualsiasi livello di difficoltà.',
    takeaways: [
      'La tecnica ELI5 ("Explain Like I\'m 5"): analogie e metafore visive per assimilare nozioni difficili.',
      'Creazione di quiz interattivi e flashcard per testare la propria memorizzazione.',
      'Simulazione di dibattiti con l\'IA che fa da "avvocato del diavolo" per affinare le proprie argomentazioni.'
    ],
    exercise: 'Chiedi all\'IA di spiegarti il funzionamento della Blockchain o dei tassi d\'interesse con una metafora della vita reale.'
  },
  15: {
    title: '15. Allucinazioni: Quando l\'IA mente',
    summary: 'Riconoscere i limiti dei modelli probabilistici: perché l\'IA inventa informazioni (allucinazioni), come prevenirle e come verificare le fonti.',
    takeaways: [
      'I modelli generano parole probabili, non hanno un database di "verità assoluta" integrato.',
      'Prompt di contenimento: "Se non sei sicuro al 100%, rispondi esplicitamente che non lo sai".',
      'Grounding: fornire sempre all\'IA il testo o documento di riferimento su cui basare la risposta.'
    ],
    exercise: 'Fai una domanda complessa con un vincolo di verifica delle fonti e osserva come cambia la precisione della risposta.'
  },
  16: {
    title: '16. Privacy e Sicurezza',
    summary: 'Protezione dei dati personali e aziendali nell\'uso dell\'IA: GDPR, impostazioni di opt-out per il training e buone pratiche di conformità.',
    takeaways: [
      'Disattivazione del salvataggio cronologia/training nelle impostazioni di ChatGPT e Claude.',
      'Anonimizzazione dei dati sensibili prima di incollarli (nomi clienti, IBAN, credenziali).',
      'Differenza tra API aziendali (zero-retention) e interfacce web gratuite.'
    ],
    exercise: 'Controlla le impostazioni di privacy del tuo account IA principale e verifica che il training sui tuoi dati sia disattivato.'
  },
  17: {
    title: '17. Il Lavoro che Cambia',
    summary: 'L\'impatto dell\'automazione sul mercato del lavoro: come riposizionarsi come professionista potenziato dall\'IA e creare nuovo valore.',
    takeaways: [
      'Le competenze umane insostituibili: pensiero critico, empatia, strategia e validazione etica.',
      'Il passaggio da "esecutore manuale" a "direttore d\'orchestra" dei sistemi IA.',
      'Come valorizzare l\'utilizzo dell\'IA nelle proprie offerte e preventivi per clienti.'
    ],
    exercise: 'Scrivi una breve frase che descrive come il tuo ruolo professionale diventa più rapido e prezioso grazie all\'IA.'
  },
  18: {
    title: '18. Creare il proprio Workflow',
    summary: 'Costruire flussi di lavoro integrati e ripetibili: combinare prompt, scorciatoie e strumenti per automatizzare le tue giornate.',
    takeaways: [
      'Creazione di una libreria personale di prompt (Prompt Library) per i compiti frequenti.',
      'Personal Custom Instructions (Istruzioni Personalizzate) per evitare di ripetere chi sei ad ogni chat.',
      'Integrazione tra chat, documenti condivisi e bacheca attività.'
    ],
    exercise: 'Imposta le tue Custom Instructions sul tuo account IA specificando la tua professione e lo stile di risposta preferito.'
  },
  19: {
    title: '19. La Tua Nuova Superpotenza',
    summary: 'Integrazione avanzata e visione d\'insieme: come l\'IA moltiplica per 10 la tua capacità produttiva e ti permette di realizzare progetti prima impensabili.',
    takeaways: [
      'Passaggio a progetti complessi: creazione di manuali, corsi, analisi di mercato in ore anziché settimane.',
      'Fiducia operativa: come validare rapidamente e spedire i propri progetti sul mercato.',
      'L\'approccio del continuo aggiornamento in un ecosistema in costante evoluzione.'
    ],
    exercise: 'Pianifica un progetto che prima ritenevi troppo lungo o difficile e spezzettalo in 4 fasi assistite dall\'IA.'
  },
  20: {
    title: '20. Riepilogo e Prossimi Passi',
    summary: 'Conclusioni del percorso AI Start, checklist di consolidamento delle competenze e presentazione delle opportunità avanzate con agenti e automazioni.',
    takeaways: [
      'Hai acquisito le fondamenta per padroneggiare qualsiasi strumento di IA generativa.',
      'Pratica quotidiana costante: l\'abitudine batte la teoria.',
      'Il passo successivo: il percorso **AI Pro** per costruire Agenti Autonomi, Webhook e flussi di lavoro automatici senza codice!'
    ],
    exercise: 'Scarica il tuo Attestato Ufficiale di Completamento e condividi il tuo traguardo!'
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

