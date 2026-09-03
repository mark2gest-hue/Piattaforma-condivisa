'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { generateNvidiaCompletion } from '@/lib/nvidia'
import { createTaskAction } from '@/app/actions/tasks'

export interface FileAnalysisResult {
  summary: string
  keyPoints: string[]
  suggestedTaskTitle: string
  suggestedTaskDesc: string
  fileType: string
  tokensUsed?: number
}

export async function analyzeFileWithAIAction(fileId: string): Promise<{
  success: boolean
  analysis?: FileAnalysisResult
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Accesso non autorizzato.' }
    }

    const supabaseAdmin = createAdminClient()

    // 1. Recupera metadati file
    const { data: fileRecord, error: fileError } = await (supabaseAdmin as any)
      .from('files')
      .select('*, uploader:profiles(full_name)')
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return { success: false, error: 'File non trovato nel database.' }
    }

    // 2. Scarica il file dallo storage
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from('team-files')
      .download(fileRecord.storage_path)

    if (downloadError || !fileBlob) {
      return { success: false, error: 'Impossibile accedere allo storage del file.' }
    }

    // 3. Estrai testo per l'analisi
    let extractedText = ''
    const mimeType = fileRecord.mime_type || ''
    const fileName = fileRecord.name || 'documento'

    if (
      mimeType.includes('text') ||
      mimeType.includes('json') ||
      mimeType.includes('csv') ||
      mimeType.includes('markdown') ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.ts') ||
      fileName.endsWith('.js')
    ) {
      const buffer = await fileBlob.arrayBuffer()
      extractedText = Buffer.from(buffer).toString('utf-8').slice(0, 15000)
    } else {
      // Per PDF e file binari proviamo a estrarre frammenti testuali decodificabili o metadati
      const buffer = await fileBlob.arrayBuffer()
      const rawString = Buffer.from(buffer).toString('latin1')
      // Rimuovi caratteri non stampabili per estrarre il testo incorporato
      const cleanChars = rawString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      const textMatches = cleanChars.match(/[A-Za-z0-9À-ÿ\s.,;:?!'"()\-–—/@#%&*+=[\]{}<>]{4,}/g)
      extractedText = textMatches ? textMatches.join(' ').slice(0, 15000) : ''
    }

    if (!extractedText.trim()) {
      extractedText = `Nome file: ${fileRecord.name}. Dimensione: ${fileRecord.size_bytes} bytes. Tipo: ${mimeType}.`
    }

    // 4. Invocazione Nemotron NIM
    const systemPrompt = `Sei un assistente AI aziendale d'élite specializzato nell'analisi documentale, sintesi strategica ed estrazione di piani d'azione operativi per il team.`
    
    const userPrompt = `Analizza questo file aziendale:
Nome File: ${fileRecord.name}
Tipo: ${mimeType}
Caricato da: ${fileRecord.uploader?.full_name || 'Team'}

Contenuto estratto:
"""
${extractedText}
"""

Fornisci un'analisi strutturata in formato JSON con le seguenti chiavi:
1. "summary": Sintesi esecutiva chiara e precisa (2-4 frasi in italiano).
2. "keyPoints": Array di stringhe con 3-5 punti chiave, scadenze o dati essenziali.
3. "suggestedTaskTitle": Titolo breve e azionabile per un eventuale compito da aprire nel team (es. "Revisionare contratto fornitore X").
4. "suggestedTaskDesc": Descrizione dettagliata e note operative per il compito consigliato.

Rispondi SOLO con il JSON valido senza racchiuderlo in markdown aggiuntivo.`

    const aiResponse = await generateNvidiaCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 1500,
    })

    if (!aiResponse.success || !aiResponse.content) {
      return { success: false, error: aiResponse.error || 'Nessuna risposta generata dal modello AI.' }
    }

    let cleanJsonStr = aiResponse.content.trim()
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    let finalAnalysis: FileAnalysisResult

    try {
      const parsed = JSON.parse(cleanJsonStr)
      finalAnalysis = {
        summary: parsed.summary || 'Sintesi completata.',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        suggestedTaskTitle: parsed.suggestedTaskTitle || `Lavorazione su: ${fileRecord.name}`,
        suggestedTaskDesc: parsed.suggestedTaskDesc || `Compito operativo originato dall'analisi del file ${fileRecord.name}.`,
        fileType: mimeType,
        tokensUsed: aiResponse.tokensUsed,
      }
    } catch {
      finalAnalysis = {
        summary: aiResponse.content.slice(0, 300),
        keyPoints: ['Analisi testuale completata'],
        suggestedTaskTitle: `Task da ${fileRecord.name}`,
        suggestedTaskDesc: aiResponse.content,
        fileType: mimeType,
        tokensUsed: aiResponse.tokensUsed,
      }
    }

    // 5. Inserimento automatico nel Secondo Cervello (knowledge_items) per ricerca istantanea
    try {
      const knowledgeContent = `### 📌 Sintesi Documentale
${finalAnalysis.summary}

### 📋 Punti Chiave & Dati Estratti
${finalAnalysis.keyPoints.map((p) => `- ${p}`).join('\n')}

### 💡 Proposta di Lavoro per il Team
**${finalAnalysis.suggestedTaskTitle}**
${finalAnalysis.suggestedTaskDesc}

---
*Origine: File ${fileRecord.name} (Caricato da ${fileRecord.uploader?.full_name || 'Team'})*`

      const ext = fileName.split('.').pop() || 'doc'
      await (supabaseAdmin as any).from('knowledge_items').insert({
        title: `[File] ${fileRecord.name}`,
        category: 'course_notes',
        description: `Sintesi documentale AI estratta da ${fileRecord.name}`,
        content: knowledgeContent,
        tags: ['file', 'documento', 'sintesi-ai', ext.toLowerCase()],
        is_featured: false,
      })
    } catch (kErr) {
      console.warn('Errore non bloccante salvataggio nel Secondo Cervello:', kErr)
    }

    return {
      success: true,
      analysis: finalAnalysis,
    }
  } catch (err: any) {
    console.error('Errore analyzeFileWithAIAction:', err)
    return { success: false, error: err.message || 'Errore durante l\'analisi AI del file' }
  }
}

export async function convertFileAnalysisToTaskAction(formData: {
  title: string
  description: string
  fileId: string
  fileName: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Accesso non autorizzato.' }
    }

    const taskDescription = `${formData.description}\n\n📎 File collegato: ${formData.fileName}`

    return await createTaskAction({
      title: formData.title,
      description: taskDescription,
      status: 'todo',
      priority: 'high',
    })
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
