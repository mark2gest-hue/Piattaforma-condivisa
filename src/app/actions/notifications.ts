'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'

export async function getCurrentUserProfileName(): Promise<string> {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return 'Membro del team'

    const adminClient = createAdminClient()
    const { data: profile } = await (adminClient as any)
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    return profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Membro del team'
  } catch {
    return 'Membro del team'
  }
}

export async function sendTelegramNotificationAction(message: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    return await sendTelegramMessage(message)
  } catch (error: any) {
    console.error('Errore sendTelegramNotificationAction:', error)
    return { success: false, error: error.message }
  }
}

export async function notifyCalendarEventCreatedAction(event: {
  title: string
  date: string
  time?: string
  category?: string
}) {
  try {
    const userName = await getCurrentUserProfileName()
    const timeInfo = event.time ? ` alle ore ${event.time}` : ''
    const categoryInfo = event.category ? ` [${event.category.toUpperCase()}]` : ''

    const message =
      `📅 <b>Nuovo Evento in Calendario</b>${escapeHtml(categoryInfo)}\n\n` +
      `📌 <b>Titolo:</b> ${escapeHtml(event.title)}\n` +
      `🗓️ <b>Data:</b> ${escapeHtml(event.date)}${escapeHtml(timeInfo)}\n` +
      `👤 <b>Inserito da:</b> ${escapeHtml(userName)}`

    return await sendTelegramMessage(message)
  } catch (err: any) {
    console.error('Errore notifyCalendarEventCreatedAction:', err)
    return { success: false, error: err.message }
  }
}

export async function notifyFileUploadAction(fileName: string, isFolder: boolean = false) {
  try {
    const userName = await getCurrentUserProfileName()
    const icon = isFolder ? '📁' : '📄'
    const actionLabel = isFolder ? 'Nuova Cartella Creata' : 'Nuovo File Caricato'

    const message =
      `${icon} <b>${actionLabel}</b>\n\n` +
      `📂 <b>Nome:</b> ${escapeHtml(fileName)}\n` +
      `👤 <b>Caricato da:</b> ${escapeHtml(userName)}`

    const res = await sendTelegramMessage(message)
    if (!res.success) {
      console.error('[notifyFileUploadAction] Telegram send failed:', res.error)
    }
    return res
  } catch (err: any) {
    console.error('Errore notifyFileUploadAction:', err)
    return { success: false, error: err.message }
  }
}
