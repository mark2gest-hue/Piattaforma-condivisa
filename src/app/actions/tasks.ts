'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { TaskStatus, TaskPriority } from '@/types/database.types'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'
import { getCurrentUserProfileName } from './notifications'
import { autoIndexToSecondBrain } from './knowledge'

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string | null
  dueDate?: string | null
  assignedTo?: string | null
}

export async function getTasksAction() {
  try {
    const supabase = createAdminClient()
    
    // 1. Prendi i progetti
    const { data: projects, error: projError } = await (supabase as any)
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true })

    // 2. Prendi i profili team
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('*')

    // 3. Prendi i compiti
    const { data: tasks, error: tasksError } = await (supabase as any)
      .from('tasks')
      .select('*, project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Errore getTasksAction:', tasksError)
      return { success: false, error: tasksError.message, tasks: [], projects: projects || [] }
    }

    return { 
      success: true, 
      tasks: tasks || [], 
      projects: projects || [],
      profiles: profiles || []
    }
  } catch (error: any) {
    console.error('Errore getTasksAction:', error)
    return { success: false, error: error.message, tasks: [], projects: [] }
  }
}

export async function createTaskAction(input: CreateTaskInput) {
  try {
    const supabase = createAdminClient()
    const cleanTitle = input.title.trim()
    if (!cleanTitle) {
      return { success: false, error: 'Il titolo è obbligatorio' }
    }

    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert({
        title: cleanTitle,
        description: input.description?.trim() || null,
        status: input.status || 'todo',
        priority: input.priority || 'medium',
        project_id: input.projectId || null,
        due_date: input.dueDate || null,
        assigned_to: input.assignedTo || null,
      })
      .select('*, project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)')
      .single()

    if (error) {
      console.error('Errore inserimento task:', error)
      return { success: false, error: error.message }
    }

    // Invia notifica Telegram per nuovo task creato
    const userName = await getCurrentUserProfileName()
    const projectInfo = data.project?.title ? `\n📁 <b>Progetto:</b> ${escapeHtml(data.project.title)}` : ''
    const priorityLabels: Record<string, string> = {
      low: '🟢 Bassa',
      medium: '🟡 Media',
      high: '🟠 Alta',
      urgent: '🔴 Urgente',
    }
    const priorityText = priorityLabels[data.priority] || data.priority

    sendTelegramMessage(
      `📋 <b>Nuovo Task Creato</b>\n\n` +
      `📌 <b>Titolo:</b> ${escapeHtml(cleanTitle)}${projectInfo}\n` +
      `⚡ <b>Priorità:</b> ${priorityText}\n` +
      `👤 <b>Creato da:</b> ${escapeHtml(userName)}`
    ).catch((e) => console.error('Errore notifica Telegram nuovo task:', e))

    return { success: true, task: data }
  } catch (error: any) {
    console.error('Errore createTaskAction:', error)
    return { success: false, error: error.message }
  }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus, position?: number) {
  try {
    const supabase = createAdminClient()

    // Recupera lo stato attuale del task prima dell'aggiornamento
    const { data: currentTask } = await (supabase as any)
      .from('tasks')
      .select('title, status, project:projects(title)')
      .eq('id', taskId)
      .single()

    const updatePayload: any = { status }
    if (typeof position === 'number') {
      updatePayload.position = position
    }

    const { error } = await (supabase as any)
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)

    if (error) {
      console.error('Errore updateTaskStatusAction:', error)
      return { success: false, error: error.message }
    }

    // Se lo stato è cambiato, invia notifica Telegram
    if (currentTask && currentTask.status !== status) {
      const userName = await getCurrentUserProfileName()
      const statusLabels: Record<string, string> = {
        backlog: '📦 Backlog',
        todo: '⏳ Da Fare',
        in_progress: '⚡ In Corso',
        review: '👀 In Revisione',
        done: '✅ Completato',
      }
      const newStatusLabel = statusLabels[status] || status
      const oldStatusLabel = statusLabels[currentTask.status] || currentTask.status
      const projectInfo = currentTask.project?.title ? ` [${escapeHtml(currentTask.project.title)}]` : ''

      sendTelegramMessage(
        `🔄 <b>Stato Task Aggiornato</b>${projectInfo}\n\n` +
        `📌 <b>Task:</b> ${escapeHtml(currentTask.title)}\n` +
        `📊 <b>Passaggio:</b> ${oldStatusLabel} ➔ <b>${newStatusLabel}</b>\n` +
        `👤 <b>Modificato da:</b> ${escapeHtml(userName)}`
      ).catch((e) => console.error('Errore notifica Telegram cambio stato task:', e))

      if (status === 'done') {
        autoIndexToSecondBrain({
          title: `[Lavoro Completato] ${currentTask.title}`,
          category: 'course_notes',
          description: `Task completato da ${userName} nel progetto ${currentTask.project?.title || 'Generale'}`,
          content: `### ✅ Lavoro Portato a Termine
**Task:** ${currentTask.title}
**Progetto:** ${currentTask.project?.title || 'Generale'}
**Completato da:** ${userName}
**Data:** ${new Date().toLocaleDateString('it-IT')}`,
          tags: ['lavori', 'completato', 'team'],
        }).catch((e) => console.warn('Errore auto-index task done:', e))
      }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateTaskDetailsAction(
  taskId: string,
  payload: {
    title?: string
    description?: string
    priority?: TaskPriority
    status?: TaskStatus
    projectId?: string | null
    dueDate?: string | null
    assignedTo?: string | null
  }
) {
  try {
    const supabase = createAdminClient()
    const updateData: any = {}
    if (payload.title) updateData.title = payload.title.trim()
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || null
    if (payload.priority) updateData.priority = payload.priority
    if (payload.status) updateData.status = payload.status
    if (payload.projectId !== undefined) updateData.project_id = payload.projectId || null
    if (payload.dueDate !== undefined) updateData.due_date = payload.dueDate || null
    if (payload.assignedTo !== undefined) updateData.assigned_to = payload.assignedTo || null

    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select('*, project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, task: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await (supabase as any)
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createProjectAction(title: string, description?: string) {
  try {
    const supabase = createAdminClient()
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      return { success: false, error: 'Il nome del progetto è obbligatorio' }
    }

    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        title: cleanTitle,
        description: description?.trim() || null,
        status: 'active',
        category: 'internal',
      })
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Invia notifica Telegram per nuovo progetto
    const userName = await getCurrentUserProfileName()
    sendTelegramMessage(
      `🚀 <b>Nuovo Progetto Creato</b>\n\n` +
      `📁 <b>Titolo:</b> ${escapeHtml(cleanTitle)}\n` +
      `👤 <b>Creato da:</b> ${escapeHtml(userName)}`
    ).catch((e) => console.error('Errore notifica Telegram nuovo progetto:', e))

    return { success: true, project: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProjectAction(
  projectId: string,
  payload: { title?: string; description?: string; status?: string; category?: string }
) {
  try {
    const supabase = createAdminClient()
    const updateData: any = {}
    if (payload.title) updateData.title = payload.title.trim()
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || null
    if (payload.status) updateData.status = payload.status
    if (payload.category) updateData.category = payload.category

    const { data, error } = await (supabase as any)
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, project: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const supabase = createAdminClient()
    
    // Dissocia i task collegati impostando project_id = null
    await (supabase as any)
      .from('tasks')
      .update({ project_id: null })
      .eq('project_id', projectId)

    // Elimina il progetto
    const { error } = await (supabase as any)
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


