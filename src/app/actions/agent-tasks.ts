'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { generateNvidiaCompletion } from '@/lib/nvidia'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'
import { getCurrentUserProfileName } from './notifications'

export async function executeAgentTaskAction(taskId: string) {
  try {
    const supabase = createAdminClient()

    // 1. Recupera il task con assignee e progetto
    const { data: task, error: taskError } = await (supabase as any)
      .from('tasks')
      .select('*, project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return { success: false, error: 'Task non trovato' }
    }

    const agent = task.assignee
    if (!agent || !agent.is_agent) {
      return {
        success: false,
        error: 'Il task deve essere assegnato a un profilo Agente AI per essere eseguito automaticamente.',
      }
    }

    const modelToUse = agent.agent_model || 'nvidia/nemotron-3-ultra-550b-a55b'
    const systemPrompt =
      agent.agent_system_prompt ||
      'Sei un assistente operativo AI specializzato nel supportare il team. Rispondi con soluzioni concrete, bozze o codice pronti all\'uso.'

    // 2. Costruisci il prompt operativo
    const projectInfo = task.project?.title
      ? `\nProgetto di riferimento: "${task.project.title}" (${task.project.description || 'Nessuna descrizione'})`
      : ''
    const taskDetails = task.description ? `\nDettagli/Istruzioni: ${task.description}` : ''

    const userPrompt = `Devi svolgere il seguente task operativo:${projectInfo}\nTitolo Task: ${task.title}${taskDetails}\nPriorità: ${task.priority}\n\nFornisci il risultato completo (bozza, analisi, piano operativo o codice) pronto per essere revisionato e approvato dal team.`

    // 3. Crea il record di run nello stato 'running'
    const { data: run, error: runError } = await (supabase as any)
      .from('task_agent_runs')
      .insert({
        task_id: taskId,
        agent_id: agent.id,
        prompt_sent: userPrompt,
        status: 'running',
      })
      .select('*')
      .single()

    if (runError) {
      console.error('Errore creazione task_agent_runs:', runError)
    }

    const runId = run?.id

    // 4. Esegui la chiamata LLM verso NVIDIA NIM
    const aiResult = await generateNvidiaCompletion({
      model: modelToUse,
      systemPrompt,
      userPrompt,
      temperature: 0.6,
    })

    if (!aiResult.success) {
      if (runId) {
        await (supabase as any)
          .from('task_agent_runs')
          .update({
            status: 'failed',
            output_response: aiResult.error || 'Errore sconosciuto durante la generazione',
            completed_at: new Date().toISOString(),
          })
          .eq('id', runId)
      }
      return { success: false, error: aiResult.error }
    }

    // 5. Aggiorna la run con l'output e lo stato di successo
    if (runId) {
      await (supabase as any)
        .from('task_agent_runs')
        .update({
          status: 'success',
          output_response: aiResult.content,
          tokens_used: aiResult.tokensUsed || 0,
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId)
    }

    // 6. Sposta automaticamente il task in 'review' (Human-in-the-Loop)
    await (supabase as any)
      .from('tasks')
      .update({ status: 'review' })
      .eq('id', taskId)

    // 7. Notifica Telegram di completamento esecuzione agente
    const userName = await getCurrentUserProfileName()
    const projName = task.project?.title ? ` [${escapeHtml(task.project.title)}]` : ''

    sendTelegramMessage(
      `🤖 <b>Agente AI ha elaborato un task</b>${projName}\n\n` +
      `📌 <b>Task:</b> ${escapeHtml(task.title)}\n` +
      `👤 <b>Agente:</b> ${escapeHtml(agent.full_name || 'Nemotron Agent')}\n` +
      `📊 <b>Stato:</b> 👀 In Revisione (Human-in-the-Loop)\n` +
      `⚡ <i>In attesa di approvazione da parte del team.</i>`
    ).catch((e) => console.error('Errore notifica Telegram agente:', e))

    return {
      success: true,
      output: aiResult.content,
      tokensUsed: aiResult.tokensUsed,
      runId,
    }
  } catch (error: any) {
    console.error('Errore executeAgentTaskAction:', error)
    return { success: false, error: error.message }
  }
}

export async function approveAgentTaskRunAction(taskId: string, runId?: string) {
  try {
    const supabase = createAdminClient()

    // 1. Se fornito runId, marca la run come approvata
    if (runId) {
      await (supabase as any)
        .from('task_agent_runs')
        .update({ status: 'approved' })
        .eq('id', runId)
    }

    // 2. Imposta il task come completato ('done')
    const { data: updatedTask, error } = await (supabase as any)
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', taskId)
      .select('*, project:projects(*)')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // 3. Salva l'output approvato nel Secondo Cervello (knowledge_items) per future ricerche
    if (runId) {
      try {
        const { data: runData } = await (supabase as any)
          .from('task_agent_runs')
          .select('output_response')
          .eq('id', runId)
          .single()

        if (runData?.output_response) {
          await (supabase as any).from('knowledge_items').insert({
            title: `[Task AI] ${updatedTask.title}`,
            category: 'agents_workflows',
            description: `Output approvato di Nemotron per: ${updatedTask.title}`,
            content: runData.output_response,
            tags: ['task-ai', 'nemotron', 'approvato', 'output-agente'],
            is_featured: false,
          })
        }
      } catch (kErr) {
        console.warn('Errore salvataggio output agente nel Secondo Cervello:', kErr)
      }
    }

    const userName = await getCurrentUserProfileName()
    const projName = updatedTask.project?.title ? ` [${escapeHtml(updatedTask.project.title)}]` : ''

    sendTelegramMessage(
      `✅ <b>Task Approvato & Concluso</b>${projName}\n\n` +
      `📌 <b>Task:</b> ${escapeHtml(updatedTask.title)}\n` +
      `👤 <b>Approvato da:</b> ${escapeHtml(userName)}`
    ).catch((e) => console.error('Errore notifica Telegram approvazione:', e))

    return { success: true, task: updatedTask }
  } catch (error: any) {
    console.error('Errore approveAgentTaskRunAction:', error)
    return { success: false, error: error.message }
  }
}

export async function rejectAgentTaskRunAction(taskId: string, runId: string | undefined, feedback: string) {
  try {
    const supabase = createAdminClient()

    if (runId) {
      await (supabase as any)
        .from('task_agent_runs')
        .update({
          status: 'rejected',
          user_feedback: feedback || null,
        })
        .eq('id', runId)
    }

    // Rimanda il task in lavorazione ('in_progress')
    const { data: updatedTask, error } = await (supabase as any)
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', taskId)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, task: updatedTask }
  } catch (error: any) {
    console.error('Errore rejectAgentTaskRunAction:', error)
    return { success: false, error: error.message }
  }
}

export async function getTaskAgentRunsAction(taskId: string) {
  try {
    const supabase = createAdminClient()

    const { data: runs, error } = await (supabase as any)
      .from('task_agent_runs')
      .select('*, agent:profiles!task_agent_runs_agent_id_fkey(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, runs: [] }
    }

    return { success: true, runs: runs || [] }
  } catch (error: any) {
    console.error('Errore getTaskAgentRunsAction:', error)
    return { success: false, error: error.message, runs: [] }
  }
}
