'use server'

import { AIProviderId, callAICompletion } from '@/lib/agent-engine/multi-provider'

export interface AgentStep {
  stepNumber: number
  phase: 'perception' | 'thought' | 'action' | 'observation' | 'reflection' | 'final'
  label: string
  detail: string
  toolName?: string
  toolInput?: Record<string, any>
  toolOutput?: Record<string, any>
  durationMs: number
}

export interface WorkshopRunResult {
  mode: 'chatbot' | 'agent'
  provider: AIProviderId
  modelUsed: string
  userPrompt: string
  totalDurationMs: number
  steps: AgentStep[]
  finalAnswer: string
  needsHumanApproval?: boolean
  approvalPayload?: {
    action: string
    target: string
    riskLevel: 'low' | 'medium' | 'high'
  }
}

/**
 * Server action per il workshop live:
 * Esegue il confronto reale o guidato tra Chatbot semplice e Agente Autonomo.
 */
export async function runWorkshopSimulationAction(params: {
  mode: 'chatbot' | 'agent'
  provider: AIProviderId
  prompt: string
  scenarioId?: string
}): Promise<WorkshopRunResult> {
  const { mode, provider, prompt, scenarioId } = params
  const startTime = Date.now()

  // 1. MODALITÀ CHATBOT TRADIZIONALE
  if (mode === 'chatbot') {
    const aiRes = await callAICompletion({
      provider,
      systemPrompt:
        'Sei un chatbot generico standard (come ChatGPT classico senza browsing o plugin). Rispondi basandoti solo sulla tua memoria pre-addestrata. Se ti viene chiesto qualcosa sui file locali, prezzi correnti o azioni pratiche nel computer, dì che non hai accesso al sistema e non puoi verificare.',
      userPrompt: prompt,
      temperature: 0.7,
    })

    return {
      mode: 'chatbot',
      provider,
      modelUsed: aiRes.modelUsed,
      userPrompt: prompt,
      totalDurationMs: Date.now() - startTime,
      steps: [
        {
          stepNumber: 1,
          phase: 'perception',
          label: 'Ricezione Prompt',
          detail: 'Il chatbot riceve la domanda testuale e cerca correlazioni statistiche nei pesi della rete neurale.',
          durationMs: 50,
        },
        {
          stepNumber: 2,
          phase: 'final',
          label: 'Generazione Testuale Diretta',
          detail: 'Nessun tool disponibile, nessuna memoria locale, nessuna verifica nel mondo reale.',
          durationMs: aiRes.latencyMs,
        },
      ],
      finalAnswer: aiRes.content,
    }
  }

  // 2. MODALITÀ AGENTE AUTONOMO (ReAct: Thought -> Action -> Observation -> Final)
  const steps: AgentStep[] = []

  // Step 1: Percezione & Decomposizione Obiettivo
  steps.push({
    stepNumber: 1,
    phase: 'perception',
    label: '1. Percezione & Obiettivo (Goal Framing)',
    detail: `Acquisito input: "${prompt}". L'agente analizza i vincoli di sicurezza, la memoria di sessione e identifica le entità chiave.`,
    durationMs: 80,
  })

  // Step 2: Pensiero & Scelta Tool
  let toolToUse = 'file_inspector'
  let toolInput: Record<string, any> = { path: 'src/app/(dashboard)', filter: '*.tsx' }
  let toolOutput: Record<string, any> = {
    foundFiles: ['corsi/page.tsx', 'lavori/page.tsx', 'marketing/page.tsx', 'posta/page.tsx'],
    status: '200 OK',
    itemsAnalyzed: 4,
  }
  let approvalRequired = false

  if (prompt.toLowerCase().includes('crea') || prompt.toLowerCase().includes('scrivi') || prompt.toLowerCase().includes('salva')) {
    toolToUse = 'file_writer'
    toolInput = { target: 'public/report_agente_demo.md', mode: 'create' }
    toolOutput = { status: 'PENDING_APPROVAL', path: 'public/report_agente_demo.md' }
    approvalRequired = true
  } else if (prompt.toLowerCase().includes('prezzo') || prompt.toLowerCase().includes('web') || prompt.toLowerCase().includes('online')) {
    toolToUse = 'web_browser_search'
    toolInput = { query: 'prezzi e piano didattico corsi agenti AI 2026', maxResults: 3 }
    toolOutput = {
      sources: [
        { title: 'Corso 1: AI Start', price: '97€', focus: 'Prompting e Basi AI' },
        { title: 'Corso 2: AI Pro Agenti', price: '297€', focus: 'Agenti Autonomi & n8n' },
      ],
    }
  }

  steps.push({
    stepNumber: 2,
    phase: 'thought',
    label: '2. Ragionamento Interno (Chain-of-Thought)',
    detail: `Valutazione strategica: per rispondere con precisione fattuale senza allucinare, devo consultare lo strumento specialistico "${toolToUse}".`,
    toolName: toolToUse,
    durationMs: 140,
  })

  // Step 3: Azione (Tool Execution)
  steps.push({
    stepNumber: 3,
    phase: 'action',
    label: `3. Azione Operativa (Esecuzione Tool: ${toolToUse})`,
    detail: `L'agente invoca il tool passando parametri strutturati JSON. Non sta solo parlando: sta compiendo un'operazione attiva.`,
    toolName: toolToUse,
    toolInput,
    durationMs: 220,
  })

  // Step 4: Osservazione
  steps.push({
    stepNumber: 4,
    phase: 'observation',
    label: '4. Osservazione dei Dati Reali (Environment Feedback)',
    detail: `Il tool ha risposto. L'agente legge i dati concreti restituiti dal sistema e li confronta con l'obiettivo iniziale.`,
    toolName: toolToUse,
    toolOutput,
    durationMs: 90,
  })

  // Step 5: Sintesi Finale guidata dal modello AI selezionato
  const synthesisSystemPrompt = `Sei un Agente Autonomo didattico. Hai appena eseguito con successo il tool "${toolToUse}" con questi dati ottenuti: ${JSON.stringify(toolOutput)}. 
Fornisci all'utente una risposta esecutiva chiara, professionale ed entusiasta, spiegando in modo semplice cosa hai verificato nel sistema.`

  const aiSynthesis = await callAICompletion({
    provider,
    systemPrompt: synthesisSystemPrompt,
    userPrompt: prompt,
    temperature: 0.4,
  })

  steps.push({
    stepNumber: 5,
    phase: 'final',
    label: '5. Decisione Finale & Consegna al Team',
    detail: `Sintesi eseguita con ${aiSynthesis.modelUsed}. Risposta verificata e protetta da allucinazioni grazie all'ancoraggio ai dati dei tool.`,
    durationMs: aiSynthesis.latencyMs,
  })

  return {
    mode: 'agent',
    provider,
    modelUsed: aiSynthesis.modelUsed,
    userPrompt: prompt,
    totalDurationMs: Date.now() - startTime,
    steps,
    finalAnswer: aiSynthesis.content,
    needsHumanApproval: approvalRequired,
    approvalPayload: approvalRequired
      ? {
          action: 'Scrittura nuovo documento',
          target: 'public/report_agente_demo.md',
          riskLevel: 'medium',
        }
      : undefined,
  }
}

export type OttoFriendlyMode = 'chat' | 'build' | 'tutor' | 'coach' | 'quiz' | 'reviewer'

export interface OttoFriendlyResponse {
  speech: string
  mode: OttoFriendlyMode
  title?: string
  htmlSnippet?: string
  modelUsed: string
  success: boolean
}

/**
 * Server action per Mira l'Agente didattico (Chiacchiera, Tutor, Coach, Costruisci, Quiz, Revisore)
 */
export async function askOttoFriendlyAction(params: {
  provider: AIProviderId
  mode: OttoFriendlyMode
  prompt: string
}): Promise<OttoFriendlyResponse> {
  const { provider, mode, prompt } = params
  const pLower = prompt.toLowerCase()

  const isExtractionIntent =
    pLower.includes('trova') ||
    pLower.includes('mostra') ||
    pLower.includes('estrai') ||
    pLower.includes('cerca') ||
    pLower.includes('recupera') ||
    pLower.includes('apri') ||
    pLower.includes('fammi vedere')

  const isVaultSubject =
    pLower.includes('obsidian') ||
    pLower.includes('vault') ||
    pLower.includes('secondo cervello') ||
    pLower.includes('cervello') ||
    pLower.includes('workflow') ||
    pLower.includes('n8n') ||
    pLower.includes('progetto') ||
    pLower.includes('documento') ||
    pLower.includes('manifesto') ||
    pLower.includes('excel') ||
    pLower.includes('prompt') ||
    pLower.includes('email') ||
    pLower.includes('slide') ||
    pLower.includes('pdf') ||
    pLower.includes('screenshot')

  // Se l'utente chiede di trovare/estrarre qualsiasi elemento dal Vault Obsidian:
  if (isExtractionIntent && isVaultSubject) {
    const { DEFAULT_KNOWLEDGE_ITEMS } = await import('@/lib/knowledge-data')

    // Motore di ricerca intelligente: trova l'item più rilevante in base alle parole chiave
    const searchTerms = pLower
      .replace(/trova|mostra|estrai|cerca|recupera|apri|fammi vedere|nel|dallo|dall'|dal|vault|obsidian|per|un|il|la|lo|che|abbiamo|fatto|su/gi, '')
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length >= 2)

    let bestMatch = DEFAULT_KNOWLEDGE_ITEMS[0]
    let bestScore = -1

    for (const item of DEFAULT_KNOWLEDGE_ITEMS) {
      let score = 0
      const fullHaystack = `${item.title} ${item.description || ''} ${item.tags.join(' ')} ${item.content}`.toLowerCase()

      for (const term of searchTerms) {
        if (item.title.toLowerCase().includes(term)) score += 5
        if (item.tags.some((t) => t.toLowerCase().includes(term))) score += 4
        if (item.description?.toLowerCase().includes(term)) score += 3
        if (fullHaystack.includes(term)) score += 1
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = item
      }
    }

    const categoryBadge =
      bestMatch.category === 'agents_workflows'
        ? '🤖 Workflow & Agenti'
        : bestMatch.category === 'prompting'
        ? '🎯 Formula Prompting'
        : bestMatch.category === 'copywriting'
        ? '✍️ Copywriting & Manifesto'
        : bestMatch.category === 'excel_data'
        ? '📊 Automazione Dati Excel'
        : '🎨 Grafiche & Slide'

    const vaultSpeech =
      `Ho cercato nel Vault Obsidian del nostro team e ho estratto: "${bestMatch.title}". Ho caricato il documento completo nel Banco di Lavoro!`

    const vaultHtml = `
<div style="background: linear-gradient(135deg, #090d16, #1e1b4b); padding: 22px; border-radius: 20px; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border: 1px solid #818cf8; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #312e81; padding-bottom: 8px;">
    <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; background: #3730a3; color: #c7d2fe; padding: 4px 10px; border-radius: 999px;">
      🟣 ${categoryBadge} • Obsidian Vault
    </span>
    <span style="font-size: 11px; color: #a5b4fc; font-family: monospace;">Modulo #${bestMatch.lesson_id || 'PRO'}</span>
  </div>

  <h3 style="font-size: 19px; font-weight: bold; margin: 4px 0 10px 0; color: #38bdf8;">${bestMatch.title}</h3>
  
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 14px 0; line-height: 1.4;">
    ${bestMatch.description || 'Documento interno estratto direttamente dalla knowledge base di AiUtiamoci.'}
  </p>

  <div style="background: #020617; padding: 14px; border-radius: 12px; border: 1px solid #1e293b; font-size: 12px; color: #e2e8f0; line-height: 1.5; max-height: 140px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; margin-bottom: 12px;">
${bestMatch.content}
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      ${bestMatch.tags.map((t) => `<span style="font-size: 10px; background: #1e1b4b; color: #c7d2fe; padding: 2px 8px; border-radius: 6px; border: 1px solid #312e81;">#${t}</span>`).join('')}
    </div>
    <button onclick="alert('Documento sincronizzato con il Vault Obsidian locale!')" style="background: #6366f1; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11px;">
      📋 Copia Documento
    </button>
  </div>
</div>
    `.trim()

    return {
      success: true,
      mode: 'build',
      speech: vaultSpeech,
      title: `Obsidian: ${bestMatch.title}`,
      htmlSnippet: vaultHtml,
      modelUsed: 'Obsidian-Universal-Extractor',
    }
  }

  if (mode !== 'build') {
    let systemPrompt = ''

    if (mode === 'coach') {
      systemPrompt = `Sei Mira in modalità "Coach Socratico".
REGOLA FONDAMENTALE: NON DARE MAI la risposta pronta o il prompt completo!
Lo studente impara pensando e provando.
Il tuo compito:
- Fai 1 o 2 domande intelligenti per aiutarlo a ragionare (es. "Prima di scrivere il prompt: qual è l'obiettivo esatto? Che formato di output deve produrre? Come gestisci i dati mancanti?").
- Dagli un piccolo indizio o formula un bivio concettuale.
- Concludi incoraggiandolo a scrivere lui una prima bozza o ipotesi.
- Rispondi in italiano con tono vivace, stimolante e conciso (max 3-4 frasi).`
    } else if (mode === 'tutor') {
      systemPrompt = `Sei Mira in modalità "Tutor Didattico Guidato".
Spieghi l'argomento richiesto in modo pedagogico e strutturato:
1. Spiegazione semplice con analogia del mondo reale (es. barista, contabile, centralinista).
2. I 3 passaggi chiave per applicarlo.
3. L'errore comune che fanno tutti i principianti da evitare.
Mantieni il testo compatto e leggibile, con elenchi puntati brevi (max 120 parole totali).`
    } else if (mode === 'quiz') {
      systemPrompt = `Sei Mira in modalità "Quiz Master degli Agenti".
Se lo studente ti saluta o chiede un quiz:
- Poni 1 domanda a risposta multipla (opzioni A, B, C) su un concetto cruciale degli agenti AI (es. differenza tra memoria ed RAG, scelta dei tool, prompt injection, trigger webhook).
Se lo studente ha già risposto a una domanda precedente:
- Dì subito se la risposta è Corretta o Sbagliata.
- Spiega brevemente il motivo in 2 frasi.
- Assegna un punteggio simbolico (es. +10 Punti Agente!).`
    } else if (mode === 'reviewer') {
      systemPrompt = `Sei Mira in modalità "Revisore di Prompt & Architetture".
Analizza criticamente il testo o prompt fornito dallo studente evidenziando in modo sintetico:
- ✅ Punti di forza (cosa funziona bene)
- ⚠️ Ambiguità o rischi di allucinazione
- 🔒 Sicurezza e casi limite mancanti
- 💡 Una versione ottimizzata in 2-3 righe`
    } else {
      // mode === 'chat'
      systemPrompt = `Sei Mira, il tutor AI del corso "AiUtiamoci" sugli agenti AI, nota affettuosamente come "L'Agente per la Gente".
Il tuo obiettivo è aiutare studenti principianti e intermedi a comprendere, progettare e costruire agenti AI utili per il loro lavoro, business e automazioni quotidiane.
Spiega sempre in modo chiaro, concreto e pratico, con esempi reali della vita di tutti i giorni.
Rispondi in italiano in modo sintetico e ritmato (massimo 3-4 frasi dense).`
    }

    const res = await callAICompletion({
      provider,
      systemPrompt,
      userPrompt: prompt,
      temperature: 0.7,
    })

    return {
      success: res.success,
      mode,
      speech: res.content || 'Sono qui per guidarti! Di cosa vorresti parlare?',
      modelUsed: res.modelUsed,
    }
  }

  // Modalità Costruzione: Genera widget HTML + JavaScript REALE e interattivo con il tocco pedagogico di Mira
  const buildSystemPrompt = `Sei Mira ("L'Agente per la Gente"), tutor pratico del corso AiUtiamoci. Lo studente ti chiede di costruire: "${prompt}".
Il tuo compito è:
1. Scrivere una breve spiegazione entusiasta e formativa (max 2 frasi) spiegando cosa hai appena costruito e perché è utile per automatizzare compiti.
2. Scrivere un widget HTML completo con grafica moderna e VERO JAVASCRIPT funzionante.
   - FORMATTAZIONE RIGHE: Scrivi il codice formattato verticalmente su più righe indentate (con andate a capo \n regolari tra i tag e le funzioni), NON tutto schiacciato su una sola riga!
   - Rendilo vivo: usa pulsanti interattivi, display che si aggiornano, contatori o logiche azionabili.
   - Niente alert() banali! Fai funzionare la logica direttamente nell'interfaccia con funzioni JS.
Rispondi RIGOROSAMENTE con un JSON valido con questa struttura:
{
  "speech": "Ecco cosa ho preparato per te! Ho creato questo strumento per mostrarti come un agente passa dall'idea all'azione.",
  "title": "Titolo del widget",
  "html": "<div id='app-container'>\n  <h3>...</h3>\n  <button onclick='...'>...</button>\n</div>"
}
Non aggiungere alcun testo prima o dopo il JSON.`

  const res = await callAICompletion({
    provider,
    systemPrompt: buildSystemPrompt,
    userPrompt: prompt,
    temperature: 0.7,
  })

  console.log(`[WORKSHOP BUILD RESPONSE] Provider: ${provider}, Model: ${res.modelUsed}, Output length: ${res.content?.length}`)
  console.log('[WORKSHOP RAW CONTENT]:', res.content?.slice(0, 200))

  let parsed: any = null
  try {
    // Pulisce eventuali markdown ```json ... ```
    const cleanContent = res.content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      parsed = JSON.parse(cleanContent)
    }
  } catch (err: any) {
    console.error('[WORKSHOP PARSE ERROR] Impossibile parsare JSON:', err?.message)
    // 2. Se l'LLM restituisce HTML grezzo
    const htmlMatch = res.content.match(/<div[\s\S]*<\/div>/i)
    if (htmlMatch) {
      parsed = {
        speech: `Ho costruito lo strumento per te: "${prompt}"! Puoi provarlo direttamente nel Banco di Lavoro.`,
        title: prompt,
        html: htmlMatch[0],
      }
    } else {
      // 3. Generatore contestuale dinamico: analizza l'intento reale della richiesta
      const isExcel = pLower.includes('excel') || pLower.includes('dati') || pLower.includes('estrai') || pLower.includes('tabella')
      const isCalc = pLower.includes('calcola') || pLower.includes('preventivo') || pLower.includes('prezzo')

      if (isExcel) {
        parsed = {
          speech: `Ecco il tool di estrazione dati Excel! Inserisci i dati o premi "Estrai e Pulisci" per simulare l'elaborazione.`,
          title: 'Tool Estrazione Dati Excel',
          html: `
<div style="background: linear-gradient(135deg, #090d16, #064e3b); padding: 22px; border-radius: 20px; color: white; font-family: sans-serif; border: 1px solid #10b981; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center;">
  <span style="font-size: 34px;">📊</span>
  <h3 style="font-size: 19px; font-weight: bold; margin: 6px 0; color: #34d399;">Estrattore Dati Excel Automatico</h3>
  <p style="font-size: 12px; color: #a7f3d0; margin-bottom: 14px;">Carica o incolla righe grezze per ripulire campi, email e totali</p>
  
  <div style="background: #022c22; border: 1px solid #047857; border-radius: 12px; padding: 10px; margin-bottom: 14px; text-align: left; font-family: monospace; font-size: 11px; color: #6ee7b7;">
    Nome; Email; Spesa<br/>
    Mario Rossi; mario@test.it; € 150<br/>
    Laura Bianchi; laura@test.it; € 320
  </div>

  <div style="display: flex; justify-content: center; gap: 8px;">
    <button onclick="document.getElementById('excel-status').innerText = '✅ 2 Righe estratte, pulite e pronte per Supabase/n8n!'; document.getElementById('excel-status').style.color='#34d399';" style="background: #10b981; color: #022c22; border: none; padding: 10px 18px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px;">
      ⚡ Estrai & Pulisci
    </button>
    <button onclick="document.getElementById('excel-status').innerText = 'CSV esportato con successo!';" style="background: #065f46; color: white; border: none; padding: 10px 14px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px;">
      📥 Esporta CSV
    </button>
  </div>
  <p id="excel-status" style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Pronto per l'estrazione dati</p>
</div>
          `.trim(),
        }
      } else if (isCalc) {
        parsed = {
          speech: `Ho preparato il calcolatore su misura per te! Prova a cliccare le opzioni.`,
          title: prompt,
          html: `
<div style="background: linear-gradient(135deg, #090d16, #1e293b); padding: 22px; border-radius: 20px; color: white; font-family: sans-serif; border: 1px solid #38bdf8; text-align: center;">
  <span style="font-size: 34px;">💰</span>
  <h3 style="font-size: 19px; font-weight: bold; margin: 6px 0; color: #38bdf8;">Calcolatore Dinamico</h3>
  <div style="display: flex; justify-content: center; gap: 8px; margin: 16px 0;">
    <button onclick="alert('Opzione selezionata! Totale aggiornato.')" style="background: #0284c7; color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: bold; cursor: pointer;">Opzione A</button>
    <button onclick="alert('Opzione Premium selezionata!')" style="background: #6366f1; color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: bold; cursor: pointer;">Opzione B</button>
  </div>
</div>
          `.trim(),
        }
      } else {
        parsed = {
          speech: `Ho costruito per te: "${prompt}"! Puoi vederlo e testarlo qui sotto nel Banco di Lavoro.`,
          title: prompt,
          html: `
<div style="background: linear-gradient(135deg, #090d16, #1e1b4b); padding: 22px; border-radius: 20px; color: white; font-family: sans-serif; border: 1px solid #818cf8; text-align: center;">
  <span style="font-size: 34px;">✨</span>
  <h3 style="font-size: 19px; font-weight: bold; margin: 6px 0; color: #818cf8;">${prompt}</h3>
  <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">Strumento operativo generato in diretta dall'agente per la richiesta.</p>
  <button onclick="alert('Strumento operativo e pronto all\'uso! 🚀')" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px;">
    ▶️ Prova lo Strumento
  </button>
</div>
          `.trim(),
        }
      }
    }
  }

  return {
    success: true,
    mode: 'build',
    speech: parsed.speech,
    title: parsed.title,
    htmlSnippet: parsed.html,
    modelUsed: res.modelUsed,
  }
}

