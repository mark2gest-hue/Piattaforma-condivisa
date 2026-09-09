/**
 * Client universale e compatto per Provider AI Free / Open-weights:
 * - Groq (Llama 3.3 70B, Qwen 2.5) - ultrarapido e gratuito
 * - Google Gemini (Gemini 2.5 Flash / 1.5 Flash)
 * - NVIDIA NIM (Nemotron 70B/550B, Llama 405B)
 * - DeepSeek (OpenRouter / DeepSeek API)
 */

export type AIProviderId = 'groq' | 'gemini' | 'nvidia' | 'deepseek'

export interface AIProviderConfig {
  id: AIProviderId
  name: string
  modelDefault: string
  badge: string
  color: string
  envKey: string
  description: string
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderConfig> = {
  groq: {
    id: 'groq',
    name: 'Groq Cloud',
    modelDefault: 'llama-3.3-70b-versatile',
    badge: '⚡ Ultra Rapido',
    color: 'from-orange-500 to-amber-500',
    envKey: 'GROQ_API_KEY',
    description: 'Inferenza LPU velocissima, ottimo free-tier per dimostrazioni live istantanee.',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    modelDefault: 'gemini-2.5-flash',
    badge: '🧠 Contesto Gigante',
    color: 'from-blue-500 to-cyan-500',
    envKey: 'GEMINI_API_KEY',
    description: 'Contesto da 1M token nativo, eccellente per analizzare interi file e documenti.',
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    modelDefault: 'nvidia/nemotron-3-ultra-550b-a55b',
    badge: '🛡️ Enterprise Host',
    color: 'from-emerald-500 to-green-600',
    envKey: 'NVIDIA_API_KEY',
    description: 'Modelli open-weights accelerati da GPU NVIDIA, standard enterprise.',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek R1 / V3',
    modelDefault: 'deepseek-reasoner',
    badge: '🔮 Catena di Pensiero',
    color: 'from-purple-500 to-indigo-600',
    envKey: 'DEEPSEEK_API_KEY',
    description: 'Specializzato in ragionamento profondo (Reasoning / Chain of Thought visibile).',
  },
}

export interface CompletionRequest {
  provider: AIProviderId
  model?: string
  systemPrompt?: string
  userPrompt: string
  temperature?: number
}

export interface CompletionResponse {
  success: boolean
  content: string
  reasoning?: string
  modelUsed: string
  provider: AIProviderId
  tokensUsed?: number
  latencyMs: number
  isSimulatedFallback?: boolean
  error?: string
}

export async function callAICompletion(req: CompletionRequest): Promise<CompletionResponse> {
  const start = Date.now()
  const provider = req.provider

  // 1. GROQ
  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return buildFallbackSimulated(req, start, 'GROQ_API_KEY non presente in .env.local')
    }
    console.log('[GROQ REQUEST] Invio prompt al modello Llama 3.3 70B su Groq...', { hasKey: !!apiKey })
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: req.model || 'llama-3.3-70b-versatile',
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            { role: 'user', content: req.userPrompt },
          ],
          temperature: req.temperature ?? 0.4,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) {
        const errorBody = await res.text()
        console.error(`[GROQ ERROR] HTTP ${res.status}:`, errorBody)
        throw new Error(`Groq HTTP ${res.status}: ${errorBody}`)
      }
      const data = await res.json()
      const returnedText = data.choices?.[0]?.message?.content || ''
      console.log('[GROQ SUCCESS] Risposta ricevuta da Llama 3.3 70B!', returnedText.slice(0, 100))
      return {
        success: true,
        content: returnedText,
        modelUsed: data.model || 'llama-3.3-70b-versatile',
        provider: 'groq',
        tokensUsed: data.usage?.total_tokens,
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      console.error('[GROQ EXCEPTION]', err?.message)
      return buildFallbackSimulated(req, start, err.message)
    }
  }

  // 2. GEMINI (Chiamata REST sicura multi-modello come in src/app/actions/ai.ts)
  if (provider === 'gemini') {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return buildFallbackSimulated(req, start, 'GEMINI_API_KEY mancante in .env.local')
    }

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      req.model || 'gemini-3.6-flash',
    ]

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${req.systemPrompt || ''}\n\nRichiesta Utente:\n${req.userPrompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: req.temperature ?? 0.7,
            },
          }),
          signal: AbortSignal.timeout(30000),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text && text.trim()) {
            return {
              success: true,
              content: text.trim(),
              modelUsed: model,
              provider: 'gemini',
              latencyMs: Date.now() - start,
            }
          }
        } else {
          const errText = await res.text()
          console.error(`[Gemini Provider Error] ${model} HTTP ${res.status}:`, errText)
        }
      } catch (err: any) {
        console.error(`[Gemini Provider Exception] ${model}:`, err?.message)
      }
    }

    return buildFallbackSimulated(req, start, 'Tutti i modelli Gemini hanno risposto con errore o quota superata')
  }

  // 3. NVIDIA NIM
  if (provider === 'nvidia') {
    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      return buildFallbackSimulated(req, start, 'NVIDIA_API_KEY mancante')
    }
    try {
      const { generateNvidiaCompletion } = await import('@/lib/nvidia')
      const res = await generateNvidiaCompletion({
        model: req.model || 'nvidia/nemotron-3-ultra-550b-a55b',
        systemPrompt: req.systemPrompt,
        userPrompt: req.userPrompt,
        temperature: req.temperature ?? 0.5,
      })
      if (!res.success) throw new Error(res.error || 'NVIDIA NIM error')
      return {
        success: true,
        content: res.content || '',
        modelUsed: res.modelUsed || 'nvidia/nemotron-3-ultra-550b-a55b',
        provider: 'nvidia',
        tokensUsed: res.tokensUsed,
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      return buildFallbackSimulated(req, start, err.message)
    }
  }

  // 4. DEEPSEEK (OpenRouter o DeepSeek compatibile)
  if (provider === 'deepseek') {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return buildFallbackSimulated(req, start, 'DEEPSEEK_API_KEY / OPENROUTER_API_KEY mancante')
    }
    try {
      const isRouter = !!process.env.OPENROUTER_API_KEY
      const endpoint = isRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.deepseek.com/chat/completions'

      const modelName = isRouter
        ? 'deepseek/deepseek-r1'
        : req.model || 'deepseek-chat'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            { role: 'user', content: req.userPrompt },
          ],
          temperature: req.temperature ?? 0.6,
        }),
        signal: AbortSignal.timeout(45000),
      })
      if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${await res.text()}`)
      const data = await res.json()
      const choice = data.choices?.[0]
      return {
        success: true,
        content: choice?.message?.content || '',
        reasoning: choice?.message?.reasoning_content,
        modelUsed: data.model || 'deepseek-reasoner',
        provider: 'deepseek',
        tokensUsed: data.usage?.total_tokens,
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      return buildFallbackSimulated(req, start, err.message)
    }
  }

  return buildFallbackSimulated(req, start, 'Provider non riconosciuto')
}

/**
 * Fallback a prova di live: se la chiave non c'è o la chiamata fallisce durante il corso,
 * restituisce una risposta coerente e formativa contrassegnata come demo offline!
 */
function buildFallbackSimulated(
  req: CompletionRequest,
  start: number,
  reason: string
): CompletionResponse {
  const p = req.userPrompt.toLowerCase()
  let smartReply = ''

  if (p.includes('gemini') && (p.includes('groq') || p.includes('differenza'))) {
    smartReply =
      'La differenza principale è il loro "superpotere":\n\n' +
      '• **Gemini (Google)**: è il "cervellone dall\'archivio infinito". Ha una finestra di contesto enorme (fino a 1-2 milioni di token), perfetta per analizzare interi libri, video lunghi o documenti complessi.\n\n' +
      '• **Groq**: è il "fulmine della velocità". Usa chip fisici speciali chiamati LPU che generano parole a velocità istantanea (fino a 500 parole al secondo), ideale per far reagire un agente in tempo reale senza attese!\n\n' +
      'Nel nostro corso impareremo a usarli insieme: Groq per decisioni veloci e Gemini quando serve una memoria profonda!'
  } else if (p.includes('differenza') && (p.includes('chat') || p.includes('agente'))) {
    smartReply =
      'La differenza fondamentale è semplice:\n\n' +
      '• **Un Chatbot (come ChatGPT base)** parla e basta: risponde solo a quello che ricorda dalla sua memoria passata.\n' +
      '• **Un Agente Autonomo** invece ha "mani e occhi": riceve un obiettivo, apre file reali, naviga sul web con i Tool e costruisce codice o documenti al posto tuo!'
  } else if (p.includes('obsidian') || p.includes('cervello')) {
    smartReply =
      'Pensa a **Obsidian** come alla "memoria a lungo termine" o Secondo Cervello del nostro team:\n\n' +
      '• Invece di avere file sparsi ovunque, è un archivio personale sul tuo computer dove ogni informazione, prompt o progetto è collegata alle altre con fili logici (come i neuroni del cervello).\n' +
      '• Per noi e i nostri agenti AI è fondamentale: quando l\'agente ha un dubbio o deve recuperare un vecchio flusso n8n o un PDF, va a leggere direttamente dentro Obsidian!'
  } else {
    smartReply =
      `Ottima domanda su "${req.userPrompt}"! Gli agenti AI autonomi combinano modelli linguistici rapidi (come Groq o Gemini) con strumenti operativi (Tool) per compiere azioni pratiche nel mondo reale e non solo dare risposte testuali.`
  }

  return {
    success: true,
    content: smartReply,
    modelUsed: `${req.provider}-smart-assistant`,
    provider: req.provider,
    latencyMs: Date.now() - start,
    isSimulatedFallback: true,
  }
}
