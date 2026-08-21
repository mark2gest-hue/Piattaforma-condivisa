'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { KnowledgeItem, DEFAULT_KNOWLEDGE_ITEMS } from '@/lib/knowledge-data'

export type { KnowledgeItem }

// 1. Leggi tutti i Knowledge Items
export async function getKnowledgeItemsAction(category?: string, search?: string) {
  try {
    let items = [...DEFAULT_KNOWLEDGE_ITEMS]

    // Prova a recuperare da Supabase DB se disponibile
    try {
      const supabase = createAdminClient()
      let query = (supabase as any).from('knowledge_items').select('*').order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (search && search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return { success: true, items: data }
      }
    } catch {
      // DB in fase di boot/schema, usa il catalogo nativo
    }

    // Filtra sul catalogo nativo
    if (category && category !== 'all') {
      items = items.filter((i) => i.category === category)
    }
    if (search && search.trim()) {
      const s = search.toLowerCase().trim()
      items = items.filter(
        (i) => i.title.toLowerCase().includes(s) || i.content.toLowerCase().includes(s) || i.tags.some((t) => t.toLowerCase().includes(s))
      )
    }

    return { success: true, items }
  } catch {
    let fallback = [...DEFAULT_KNOWLEDGE_ITEMS]
    if (category && category !== 'all') {
      fallback = fallback.filter((i) => i.category === category)
    }
    return { success: true, items: fallback }
  }
}

// 2. Crea un nuovo Prompt / Nota
export async function createKnowledgeItemAction(payload: {
  title: string
  category: KnowledgeItem['category']
  content: string
  description?: string
  tags?: string[]
  lesson_id?: number | null
}) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await (supabase as any)
      .from('knowledge_items')
      .insert({
        title: payload.title.trim(),
        category: payload.category || 'prompting',
        content: payload.content.trim(),
        description: payload.description?.trim() || null,
        tags: payload.tags || [],
        lesson_id: payload.lesson_id || null,
        is_featured: false,
      })
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, item: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 3. Elimina un Knowledge Item
export async function deleteKnowledgeItemAction(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await (supabase as any).from('knowledge_items').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 4. Esporta l'intero Vault per Obsidian (Struttura File Markdown Interconnessi)
export async function generateObsidianVaultBundleAction() {
  try {
    const itemsRes = await getKnowledgeItemsAction('all')
    const items = itemsRes.items || DEFAULT_KNOWLEDGE_ITEMS

    // File structure ready to be exported / downloaded as zip
    const vaultFiles: Array<{ path: string; content: string }> = []

    // 1. Dashboard Principale Obsidian
    vaultFiles.push({
      path: '00_Dashboard_Cervello.md',
      content: `# 🧠 Secondo Cervello & Knowledge Base — Aiutiamoci Cloud

Benvenuto nel tuo **Vault Obsidian Interconnesso**.
Tutti i file sono in formato Markdown puro con collegamenti bidirezionali (\`[[wikilinks]]\`).

---

## 📚 Cartelle del Vault:
- [[01_Prompt_Library]]: Formule RCCF, Copywriting, Excel e Prompt Visivi.
- [[02_Corsi_AI_Start]]: Tutte le 20 lezioni video con punti chiave ed esercizi.
- [[03_Skills_&_Agenti]]: Template di istruzioni di sistema per bot e automazioni.

---

## 🔗 Mappa dei Corsi:
${Array.from({ length: 20 }, (_, i) => `- [[Lezione_${String(i + 1).padStart(2, '0')}]]`).join('\n')}

---
*Generato automaticamente da [aiutiamoci.cloud](https://aiutiamoci.cloud)*
`,
    })

    // 2. Prompt Library Files
    items.forEach((item: KnowledgeItem) => {
      const sanitizedTitle = item.title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').slice(0, 50)
      const folderMap: Record<string, string> = {
        prompting: '01_Prompt_Library/Prompting',
        copywriting: '01_Prompt_Library/Copywriting',
        excel_data: '01_Prompt_Library/Excel_e_Dati',
        visual_media: '01_Prompt_Library/Immagini_e_Slide',
        agents_workflows: '03_Skills_&_Agenti',
        course_notes: '02_Corsi_AI_Start',
      }
      const folder = folderMap[item.category] || '01_Prompt_Library'

      vaultFiles.push({
        path: `${folder}/${sanitizedTitle}.md`,
        content: `---
title: "${item.title}"
category: "${item.category}"
tags: [${(item.tags || []).map((t: string) => `"${t}"`).join(', ')}]
${item.lesson_id ? `lesson: [[Lezione_${String(item.lesson_id).padStart(2, '0')}]]` : ''}
created: "${new Date().toISOString()}"
---

# ${item.title}

${item.description ? `> **Descrizione**: ${item.description}\n` : ''}

${item.content}

---
*Torna alla [[00_Dashboard_Cervello]]*
`,
      })
    })

    return { success: true, files: vaultFiles }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
