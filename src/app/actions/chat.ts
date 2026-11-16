'use server'

import fs from 'fs'
import path from 'path'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface ChatMetadataItem {
  type: '__chat_meta__'
  parent_id?: string | null
  reactions?: Record<string, string[]> // emoji -> array of user_ids
}

export interface CustomChannelItem {
  id: string
  name: string
  desc: string
  isPrivate: boolean
  memberIds: string[]
  createdBy?: string
  createdAt?: string
}

const CHANNELS_LOCAL_FILE = path.join(process.cwd(), '.chat-channels.json')

const SYSTEM_CHANNEL_NAMES = [
  'generale',
  'progetti',
  'marketing-social',
  'corsi-academy',
  'commerciale-b2b',
  'idee-innovazione',
]

function readLocalCustomChannels(): CustomChannelItem[] {
  try {
    if (!fs.existsSync(CHANNELS_LOCAL_FILE)) return []
    const raw = fs.readFileSync(CHANNELS_LOCAL_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[chat.ts] Impossibile leggere .chat-channels.json:', err)
    return []
  }
}

function writeLocalCustomChannels(channels: CustomChannelItem[]): void {
  try {
    fs.writeFileSync(CHANNELS_LOCAL_FILE, JSON.stringify(channels, null, 2), 'utf8')
  } catch (err) {
    console.warn('[chat.ts] Impossibile scrivere .chat-channels.json:', err)
  }
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

/**
 * Recupera i canali custom/privati filtrati in base al ruolo dell'utente:
 * - Se collaborator: SOLO i canali a cui è invitato (memberIds).
 * - Se membro del team: tutti i canali pubblici e i canali privati di cui fa parte o creatore/admin.
 */
export async function getCustomChannelsAction() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato', channels: [], userRole: 'guest' }
    }

    const admin = createAdminClient()
    const { data: profile } = await (admin.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || user.user_metadata?.role || 'member'

    const channelsMap = new Map<string, CustomChannelItem>()

    // 1. Lettura dal fallback locale
    for (const ch of readLocalCustomChannels()) {
      if (ch.name) channelsMap.set(ch.name, ch)
    }

    // 2. Lettura da tabella Supabase (se migrata)
    try {
      const { data } = await (admin.from('chat_channels') as any).select('*')
      if (Array.isArray(data)) {
        for (const row of data) {
          channelsMap.set(row.name, {
            id: row.id,
            name: row.name,
            desc: row.description || '',
            isPrivate: Boolean(row.is_private),
            memberIds: Array.isArray(row.member_ids) ? row.member_ids : [],
            createdBy: row.created_by,
            createdAt: row.created_at,
          })
        }
      }
    } catch {
      // Tabella non ancora disponibile sul DB remoto
    }

    const allCustom = Array.from(channelsMap.values())

    let allowed: CustomChannelItem[] = []
    if (userRole === 'collaborator') {
      // Isolamento rigido per guest/collaborator: solo canali in cui è esplicitamente presente
      allowed = allCustom.filter((ch) => ch.memberIds && ch.memberIds.includes(user.id))
    } else {
      // Membro interno del team
      allowed = allCustom.filter((ch) => {
        if (!ch.isPrivate) return true
        return (
          (ch.memberIds && ch.memberIds.includes(user.id)) ||
          ch.createdBy === user.id ||
          userRole === 'dev' ||
          userRole === 'admin'
        )
      })
    }

    return { success: true, channels: allowed, userRole, userId: user.id }
  } catch (err: any) {
    console.error('[getCustomChannelsAction] Error:', err)
    return { success: false, error: err.message, channels: [], userRole: 'member' }
  }
}

/**
 * Crea un nuovo canale (pubblico o privato).
 */
export async function createCustomChannelAction(input: {
  name: string
  desc?: string
  isPrivate: boolean
  memberIds: string[]
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const slug = input.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!slug || slug.length < 2) {
      return { success: false, error: 'Nome canale non valido (minimo 2 caratteri alfanumerici)' }
    }

    if (SYSTEM_CHANNEL_NAMES.includes(slug)) {
      return { success: false, error: `Il nome "#${slug}" è riservato come canale di sistema` }
    }

    const members = Array.from(new Set([...(input.memberIds || []), user.id]))

    const newChannel: CustomChannelItem = {
      id: `custom_${Date.now()}_${slug}`,
      name: slug,
      desc: input.desc?.trim() || '',
      isPrivate: Boolean(input.isPrivate),
      memberIds: members,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    // 1. Salva nel fallback locale
    const current = readLocalCustomChannels()
    const existingIndex = current.findIndex((c) => c.name === slug)
    if (existingIndex >= 0) {
      return { success: false, error: `Il canale "#${slug}" esiste già` }
    }
    current.push(newChannel)
    writeLocalCustomChannels(current)

    // 2. Salva su Supabase (try/catch silenzioso)
    try {
      const admin = createAdminClient()
      const { data } = await (admin.from('chat_channels') as any)
        .insert({
          name: slug,
          description: newChannel.desc,
          is_private: newChannel.isPrivate,
          member_ids: members,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (data?.id) {
        newChannel.id = data.id
      }
    } catch (err) {
      console.warn('[createCustomChannelAction] Fallback su store locale:', err)
    }

    return { success: true, channel: newChannel }
  } catch (err: any) {
    console.error('[createCustomChannelAction] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Elimina un canale custom esistente.
 */
export async function deleteCustomChannelAction(name: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const admin = createAdminClient()
    const { data: profile } = await (admin.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || user.user_metadata?.role || 'member'

    // Rimozione da local store
    const current = readLocalCustomChannels()
    const target = current.find((c) => c.name === name)

    if (target && target.createdBy !== user.id && userRole !== 'dev' && userRole !== 'admin') {
      return { success: false, error: 'Non hai i permessi per eliminare questo canale' }
    }

    const filtered = current.filter((c) => c.name !== name)
    writeLocalCustomChannels(filtered)

    // Rimozione da Supabase
    try {
      await (admin.from('chat_channels') as any).delete().eq('name', name)
    } catch {
      // Ignora se la tabella non è sincronizzata
    }

    return { success: true }
  } catch (err: any) {
    console.error('[deleteCustomChannelAction] Error:', err)
    return { success: false, error: err.message }
  }
}
