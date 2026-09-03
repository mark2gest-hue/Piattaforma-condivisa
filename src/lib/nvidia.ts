/**
 * Client server-side per NVIDIA NIM (OpenAI-Compatible endpoint).
 * Utilizza le variabili d'ambiente:
 * - NVIDIA_API_KEY (obbligatoria)
 * - NVIDIA_BASE_URL (opzionale, default: https://integrate.api.nvidia.com/v1)
 */

export interface NvidiaChatOptions {
  model?: string
  systemPrompt?: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

export interface NvidiaChatResult {
  success: boolean
  content?: string
  tokensUsed?: number
  modelUsed?: string
  error?: string
}

export async function generateNvidiaCompletion({
  model = 'nvidia/nemotron-3-ultra-550b-a55b',
  systemPrompt = 'Sei un assistente operativo AI preciso e professionale.',
  userPrompt,
  temperature = 0.7,
  maxTokens = 4096,
}: NvidiaChatOptions): Promise<NvidiaChatResult> {
  const apiKey = process.env.NVIDIA_API_KEY
  const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'

  if (!apiKey) {
    console.warn('[NVIDIA NIM] NVIDIA_API_KEY non configurata in .env.local')
    return {
      success: false,
      error: 'Chiave NVIDIA_API_KEY mancante in .env.local. Aggiungila per abilitare l\'esecuzione degli agenti.',
    }
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      // Timeout di 60s per modelli con ragionamento complesso
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[NVIDIA NIM API Error]:', response.status, errorText)
      return {
        success: false,
        error: `Errore NVIDIA API (${response.status}): ${errorText || response.statusText}`,
      }
    }

    const data = await response.json()
    const choice = data?.choices?.[0]
    const content = choice?.message?.content || ''
    const tokensUsed = data?.usage?.total_tokens || 0

    return {
      success: true,
      content,
      tokensUsed,
      modelUsed: data?.model || model,
    }
  } catch (err: any) {
    console.error('[NVIDIA NIM Client Error]:', err)
    if (err?.name === 'TimeoutError') {
      return {
        success: false,
        error: 'Timeout durante la richiesta al modello NVIDIA (limite 60s superato). Riprova.',
      }
    }
    return {
      success: false,
      error: err?.message || 'Errore di rete durante la connessione con NVIDIA NIM.',
    }
  }
}
