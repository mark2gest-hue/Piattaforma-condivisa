'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface ChatMetadataItem {
  type: '__chat_meta__'
  parent_id?: string | null
  reactions?: Record<string, string[]> // emoji -> array of user_ids
}

export async function toggleMessageReactionAction(messageId: string, emoji: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const admin = createAdminClient()
    const { data: message, error: fetchError } = await (admin.from('messages') as any)
      .select('id, attachments')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return { success: false, error: 'Messaggio non trovato' }
    }

    const rawAttachments: any[] = Array.isArray(message.attachments) ? [...message.attachments] : []
    const metaIndex = rawAttachments.findIndex((item) => item && item.type === '__chat_meta__')

    let meta: ChatMetadataItem =
      metaIndex >= 0
        ? { ...rawAttachments[metaIndex] }
        : { type: '__chat_meta__', reactions: {} }

    const reactions: Record<string, string[]> = { ...(meta.reactions || {}) }
    const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : []

    const userIndex = currentUsers.indexOf(user.id)
    if (userIndex >= 0) {
      currentUsers.splice(userIndex, 1)
    } else {
      currentUsers.push(user.id)
    }

    if (currentUsers.length > 0) {
      reactions[emoji] = currentUsers
    } else {
      delete reactions[emoji]
    }

    meta.reactions = reactions

    if (metaIndex >= 0) {
      rawAttachments[metaIndex] = meta
    } else {
      rawAttachments.push(meta)
    }

    const { error: updateError } = await (admin.from('messages') as any)
      .update({ attachments: rawAttachments })
      .eq('id', messageId)

    if (updateError) {
      console.error('[toggleMessageReactionAction] Update failed:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, reactions }
  } catch (err: any) {
    console.error('[toggleMessageReactionAction] Error:', err)
    return { success: false, error: err.message }
  }
}
