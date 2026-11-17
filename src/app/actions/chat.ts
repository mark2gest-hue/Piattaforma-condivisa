'use server'

import fs from 'fs'
import path from 'path'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateNvidiaCompletion } from '@/lib/nvidia'
import { resolveStudentIdentityByCode } from '@/app/actions/support'
import { getAllPushSubscriptions, sendWebPushNotification } from '@/lib/web-push'

export interface ChatMetadataItem {
  type: '__chat_meta__'
  parent_id?: string | null
  reactions?: Record<string, string[]> // emoji -> array of user_ids
  sender_name?: string | null
  sender_email?: string | null
  sender_student_id?: string | null
}

export interface EnrolledStudentChatMember {
  id: string // prefisso con trattino: student-${row.id} (MAI underscore per DM routing)
  full_name: string
  email: string
  code?: string
  role: 'student'
  is_active: boolean
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
const COLLABORATORS_LOCAL_FILE = path.join(process.cwd(), '.chat-collaborators.json')

const SYSTEM_CHANNEL_NAMES = ['community-studenti']

function readLocalCollaboratorIds(): string[] {
  try {
    if (!fs.existsSync(COLLABORATORS_LOCAL_FILE)) return []
    const raw = fs.readFileSync(COLLABORATORS_LOCAL_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[chat.ts] Impossibile leggere .chat-collaborators.json:', err)
    return []
  }
}

function addLocalCollaboratorId(userId: string): void {
  try {
    const list = readLocalCollaboratorIds()
    if (!list.includes(userId)) {
      list.push(userId)
      fs.writeFileSync(COLLABORATORS_LOCAL_FILE, JSON.stringify(list, null, 2), 'utf8')
    }
  } catch (err) {
    console.warn('[chat.ts] Impossibile scrivere .chat-collaborators.json:', err)
  }
}

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

    const localCollaborators = readLocalCollaboratorIds()
    const isCollaborator =
      user.user_metadata?.role === 'collaborator' ||
      localCollaborators.includes(user.id) ||
      profile?.role === 'collaborator'

    const effectiveRole = isCollaborator
      ? 'collaborator'
      : profile?.role || user.user_metadata?.role || 'member'

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

    const allCustom = Array.from(channelsMap.values()).filter((ch) => ch.name !== 'generale')

    let allowed: CustomChannelItem[] = []
    if (effectiveRole === 'collaborator') {
      // Isolamento rigido per guest/collaborator: solo canali in cui è esplicitamente presente
      allowed = allCustom.filter((ch) => ch.memberIds && ch.memberIds.includes(user.id))
    } else {
      // Membro interno del team
      allowed = allCustom.filter((ch) => {
        if (!ch.isPrivate) return true
        return (
          (ch.memberIds && ch.memberIds.includes(user.id)) ||
          ch.createdBy === user.id ||
          effectiveRole === 'dev' ||
          effectiveRole === 'admin'
        )
      })
    }

    // 3. Recupero studenti iscritti attivi (riservato al team, oscurato per collaborator)
    let enrolledStudents: EnrolledStudentChatMember[] = []
    if (effectiveRole !== 'collaborator') {
      try {
        const studentMap = new Map<string, EnrolledStudentChatMember>()

        // Escludi le email dei profili team esistenti
        const { data: teamProfiles } = await (admin.from('profiles') as any).select('email')
        const teamEmails = new Set(
          (Array.isArray(teamProfiles) ? teamProfiles : [])
            .map((p) => p.email?.trim().toLowerCase())
            .filter(Boolean)
        )

        // Query 1: student_codes attivi
        const { data: codesData } = await (admin.from('student_codes') as any)
          .select('id, code, student_name, student_email, is_active')
          .eq('is_active', true)

        if (Array.isArray(codesData)) {
          for (const row of codesData) {
            const email = (row.student_email || '').trim().toLowerCase()
            if (email && !teamEmails.has(email) && !studentMap.has(email)) {
              studentMap.set(email, {
                id: `student-${row.id}`,
                full_name: (row.student_name || 'Studente').trim(),
                email,
                code: row.code || undefined,
                role: 'student',
                is_active: Boolean(row.is_active),
              })
            }
          }
        }

        // Query 2: course_registrations approvate
        const { data: regData } = await (admin.from('course_registrations') as any)
          .select('id, name, email, access_code, approved, status')

        if (Array.isArray(regData)) {
          for (const row of regData) {
            if (row.approved === true || row.status === 'approved') {
              const email = (row.email || '').trim().toLowerCase()
              if (email && !teamEmails.has(email) && !studentMap.has(email)) {
                studentMap.set(email, {
                  id: `student-${row.id}`,
                  full_name: (row.name || 'Studente').trim(),
                  email,
                  code: row.access_code || undefined,
                  role: 'student',
                  is_active: true,
                })
              }
            }
          }
        }

        enrolledStudents = Array.from(studentMap.values()).sort((a, b) =>
          a.full_name.localeCompare(b.full_name, 'it', { sensitivity: 'base' })
        )
      } catch (err) {
        console.warn('[getCustomChannelsAction] Errore recupero studenti iscritti:', err)
      }
    }

    return {
      success: true,
      channels: allowed,
      userRole: effectiveRole,
      userId: user.id,
      collaboratorIds: localCollaborators,
      enrolledStudents,
    }
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

/**
 * Invita e crea un nuovo collaboratore esterno 1-click.
 * L'account viene marcato con role: 'collaborator' e must_change_password: true.
 * Viene inserito in .chat-collaborators.json e aggiunto ai memberIds del canale selezionato.
 */
export async function inviteCollaboratorAction(input: {
  email: string
  fullName: string
  tempPassword?: string
  channelName?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const admin = createAdminClient()
    const { data: callerProfile } = await (admin.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    const localCollaborators = readLocalCollaboratorIds()
    const isCollabCaller =
      user.user_metadata?.role === 'collaborator' ||
      localCollaborators.includes(user.id) ||
      callerProfile?.role === 'collaborator'

    if (isCollabCaller) {
      return {
        success: false,
        error: 'I collaboratori esterni non hanno il permesso di invitare altri utenti',
      }
    }

    const email = input.email.trim().toLowerCase()
    const fullName = input.fullName.trim()
    const pwd = input.tempPassword?.trim() || 'Collab!2026!'

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Indirizzo email non valido' }
    }
    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Nome completo obbligatorio (almeno 2 caratteri)' }
    }
    if (pwd.length < 8) {
      return { success: false, error: 'La password temporanea deve contenere almeno 8 caratteri' }
    }

    // Guardia Anti-Sovrascrittura: impedisce di alterare account di membri interni del team
    const { data: existingProfile } = await (admin.from('profiles') as any)
      .select('id, role')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      const isAlreadyCollab =
        existingProfile.role === 'collaborator' ||
        localCollaborators.includes(existingProfile.id)
      if (!isAlreadyCollab) {
        return {
          success: false,
          error: 'Questa email appartiene già a un membro interno del team',
        }
      }
    }

    let targetUserId: string | null = null

    // 1. Creazione utente su Supabase Auth
    const createRes = await admin.auth.admin.createUser({
      email,
      password: pwd,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'collaborator',
        must_change_password: true,
      },
    })

    if (createRes.data?.user) {
      targetUserId = createRes.data.user.id
    } else if (createRes.error) {
      // Se l'utente esiste già, verifichiamo che non sia un membro interno prima di aggiornare
      try {
        const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 1000 })
        const existing = usersList?.users?.find((u) => u.email?.toLowerCase() === email)
        if (existing) {
          const isCollabUser =
            existing.user_metadata?.role === 'collaborator' ||
            localCollaborators.includes(existing.id)
          if (!isCollabUser && existingProfile && existingProfile.role !== 'collaborator') {
            return {
              success: false,
              error: 'Questa email appartiene già a un membro interno del team',
            }
          }

          targetUserId = existing.id
          await admin.auth.admin.updateUserById(existing.id, {
            password: pwd,
            user_metadata: {
              ...(existing.user_metadata || {}),
              full_name: fullName || existing.user_metadata?.full_name,
              role: 'collaborator',
              must_change_password: true,
            },
          })
        } else {
          return { success: false, error: createRes.error.message }
        }
      } catch (listErr: any) {
        return { success: false, error: createRes.error.message || listErr.message }
      }
    }

    if (!targetUserId) {
      return { success: false, error: 'Impossibile determinare l\'identificativo utente' }
    }

    // 2. Registrazione in .chat-collaborators.json (store locale resiliente)
    addLocalCollaboratorId(targetUserId)

    // 3. Upsert su tabella profiles con fallback resiliente se l'enum DB non include 'collaborator'
    try {
      const { error: upsertErr } = await (admin.from('profiles') as any).upsert({
        id: targetUserId,
        email,
        full_name: fullName,
        role: 'collaborator',
        is_active: true,
      })
      if (upsertErr) {
        throw upsertErr
      }
    } catch (upsertError) {
      console.warn(
        '[inviteCollaboratorAction] Fallback upsert profiles con role member:',
        upsertError
      )
      try {
        await (admin.from('profiles') as any).upsert({
          id: targetUserId,
          email,
          full_name: fullName,
          role: 'member',
          is_active: true,
        })
      } catch (fallbackError) {
        console.error(
          '[inviteCollaboratorAction] Fallback upsert profiles fallito:',
          fallbackError
        )
      }
    }

    // 4. Se specificato un canale, aggiungi subito il collaboratore ai memberIds
    if (input.channelName) {
      const currentChannels = readLocalCustomChannels()
      const targetChannel = currentChannels.find((c) => c.name === input.channelName)
      if (targetChannel) {
        if (!targetChannel.memberIds.includes(targetUserId)) {
          targetChannel.memberIds.push(targetUserId)
          writeLocalCustomChannels(currentChannels)
        }
      }

      try {
        const { data: dbCh } = await (admin.from('chat_channels') as any)
          .select('member_ids')
          .eq('name', input.channelName)
          .single()
        if (dbCh) {
          const existingIds: string[] = Array.isArray(dbCh.member_ids) ? dbCh.member_ids : []
          if (!existingIds.includes(targetUserId)) {
            await (admin.from('chat_channels') as any)
              .update({ member_ids: [...existingIds, targetUserId] })
              .eq('name', input.channelName)
          }
        }
      } catch {
        // Tabella chat_channels opzionale se non migrata sul DB remoto
      }
    }

    const inviteMessage = `Ciao ${fullName}! Sei stato invitato su AIutiamoci (Piattaforma Lavoro Condivisa).
🔗 Accesso: https://aiutiamoci.cloud/login
📧 Email: ${email}
🔑 Password temporanea: ${pwd}

Al primo accesso ti verrà richiesto di impostare la tua nuova password personale. Una volta entrato avrai accesso diretto alla chat e al canale dedicato.`

    return {
      success: true,
      user: {
        id: targetUserId,
        email,
        fullName,
        tempPassword: pwd,
      },
      inviteMessage,
    }
  } catch (err: any) {
    console.error('[inviteCollaboratorAction] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Aggiorna i membri di un canale custom esistente.
 */
export async function updateChannelMembersAction(input: {
  channelName: string
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

    const admin = createAdminClient()
    const { data: profile } = await (admin.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    const localCollaborators = readLocalCollaboratorIds()
    const isCollab =
      user.user_metadata?.role === 'collaborator' ||
      localCollaborators.includes(user.id) ||
      profile?.role === 'collaborator'

    if (isCollab) {
      return {
        success: false,
        error: 'I collaboratori esterni non possono modificare i membri del canale',
      }
    }

    const currentChannels = readLocalCustomChannels()
    const target = currentChannels.find((c) => c.name === input.channelName)
    if (!target) {
      return { success: false, error: 'Canale non trovato' }
    }

    if (
      target.createdBy &&
      target.createdBy !== user.id &&
      profile?.role !== 'dev' &&
      profile?.role !== 'admin'
    ) {
      return {
        success: false,
        error: 'Solo il creatore o un amministratore possono modificare i membri di questo canale',
      }
    }

    const members = Array.from(new Set([...(input.memberIds || []), target.createdBy || user.id]))
    target.memberIds = members
    writeLocalCustomChannels(currentChannels)

    try {
      await (admin.from('chat_channels') as any)
        .update({ member_ids: members })
        .eq('name', input.channelName)
    } catch (err) {
      console.warn('[updateChannelMembersAction] Fallback su store locale:', err)
    }

    return { success: true, channel: target }
  } catch (err: any) {
    console.error('[updateChannelMembersAction] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Permette all'utente loggato di aggiornare la propria password personale
 * e rimuove il flag must_change_password dai metadati.
 */
export async function changeOwnPasswordAction(input: {
  currentPassword?: string
  newPassword: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const newPwd = input.newPassword ? input.newPassword.trim() : ''
    if (newPwd.length < 8) {
      return {
        success: false,
        error: 'La nuova password deve contenere almeno 8 caratteri',
      }
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: newPwd,
      user_metadata: {
        ...(user.user_metadata || {}),
        must_change_password: false,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[changeOwnPasswordAction] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Esegue uno slash command (/task, /lead, /ai) direttamente all'interno della chat.
 */
export async function executeSlashCommandAction(input: {
  channel: string
  commandText: string
}) {
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
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    const localCollaborators = readLocalCollaboratorIds()
    const isCollaborator =
      user.user_metadata?.role === 'collaborator' ||
      localCollaborators.includes(user.id) ||
      profile?.role === 'collaborator'

    const effectiveRole = isCollaborator
      ? 'collaborator'
      : profile?.role || user.user_metadata?.role || 'member'

    const raw = input.commandText.trim()
    const cmd = raw.split(/\s+/)[0].toLowerCase()
    const arg = raw.slice(cmd.length).trim()

    // 1. Comando /task: crea attività nel Kanban (/lavori)
    if (cmd === '/task') {
      if (!arg) {
        return {
          success: false,
          error: "Specificare il titolo dell'attività. Es: /task Creare landing page per PMI | Descrizione",
        }
      }

      const parts = arg.split('|').map((s) => s.trim())
      const title = parts[0]
      const description = parts.length > 1 ? parts.slice(1).join(' | ') : null

      const { data: taskData, error: taskError } = await (admin.from('tasks') as any)
        .insert({
          title,
          description,
          status: 'todo',
          priority: 'medium',
          created_by: user.id,
        })
        .select('id')
        .single()

      if (taskError) {
        return { success: false, error: `Errore creazione task: ${taskError.message}` }
      }

      await (admin.from('messages') as any).insert({
        channel: input.channel,
        sender_id: user.id,
        is_system: false,
        content: `✅ [Comando /task] Attività creata nel Kanban (/lavori): "${title}"`,
      })

      return { success: true, type: 'task', taskId: taskData?.id }
    }

    // 2. Comando /lead: inserisce nuovo lead in Pipeline CRM (/clienti)
    if (cmd === '/lead') {
      if (effectiveRole === 'collaborator') {
        return {
          success: false,
          error: 'Il comando /lead è riservato ai membri interni del team',
        }
      }

      if (!arg) {
        return {
          success: false,
          error: 'Specificare il nome o azienda del lead. Es: /lead Azienda Alfa 2500',
        }
      }

      // Estrazione importo opzionale (€2500 o 2500 alla fine della stringa)
      let dealValue = 1500
      let leadString = arg

      const valueMatch = arg.match(/(?:€\s*|\b)([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:€)?$/i)
      if (valueMatch) {
        const val = parseFloat(valueMatch[1].replace(',', '.'))
        if (!isNaN(val) && val > 0) {
          dealValue = val
          leadString = arg.slice(0, valueMatch.index).trim()
        }
      }

      if (!leadString) {
        leadString = arg
      }

      // Estrazione eventuale indirizzo email
      let email = `lead.${Date.now()}@da-qualificare.local`
      const emailMatch = leadString.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
      if (emailMatch) {
        email = emailMatch[1]
        leadString = leadString.replace(emailMatch[0], '').trim()
      }

      const nameParts = leadString.split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] || 'Lead'
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Da Qualificare'
      const companyName = leadString

      const { data: clientData, error: clientError } = await (admin.from('clients') as any)
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          company: companyName,
          category: 'business',
          status: 'prospect',
          created_by: user.id,
          notes: `[STAGE:nuovo_lead|VAL:${dealValue}] Creato da comando /lead in chat`,
        })
        .select('id')
        .single()

      if (clientError) {
        return { success: false, error: `Errore creazione lead: ${clientError.message}` }
      }

      await (admin.from('messages') as any).insert({
        channel: input.channel,
        sender_id: user.id,
        is_system: false,
        content: `💰 [Comando /lead] Nuovo Lead inserito in Pipeline CRM (/clienti): "${companyName}" (€ ${dealValue})`,
      })

      return { success: true, type: 'lead', clientId: clientData?.id }
    }

    // 3. Comando /ai: consultazione Copilot AI con NVIDIA NIM
    if (cmd === '/ai') {
      if (!arg) {
        return {
          success: false,
          error: "Specificare una richiesta per l'AI Copilot. Es: /ai Riassumi lo stato del progetto",
        }
      }

      // Inserisci prima il messaggio utente visibile
      await (admin.from('messages') as any).insert({
        channel: input.channel,
        sender_id: user.id,
        is_system: false,
        content: raw,
      })

      const aiRes = await generateNvidiaCompletion({
        userPrompt: arg,
        systemPrompt:
          'Sei il Copilot AI operativo del team AIutiamoci. Rispondi in italiano in modo diretto, pratico e conciso.',
      })

      if (aiRes.success && aiRes.content) {
        await (admin.from('messages') as any).insert({
          channel: input.channel,
          sender_id: user.id,
          is_system: true,
          content: `🤖 **AI Copilot**:\n${aiRes.content}`,
        })
        return { success: true, type: 'ai' }
      } else {
        const errorMsg = aiRes.error || 'Errore elaborazione risposta AI'
        await (admin.from('messages') as any).insert({
          channel: input.channel,
          sender_id: user.id,
          is_system: true,
          content: `🤖 **AI Copilot**: ⚠️ ${errorMsg}`,
        })
        return { success: false, error: errorMsg }
      }
    }

    return {
      success: false,
      error: 'Comando non riconosciuto. Usa /task, /lead o /ai',
    }
  } catch (err: any) {
    console.error('[executeSlashCommandAction] Error:', err)
    return { success: false, error: err.message }
  }
}

export interface StudentCommunityTeacher {
  id: string
  full_name: string
  role: string
  avatar_url?: string | null
}

/**
 * Recupera i messaggi di #community-studenti, gli eventuali DM 1-a-1 dello studente
 * con i docenti del team e l'elenco docenti disponibili.
 */
export async function getStudentCommunityChatAction(studentCode: string) {
  try {
    const admin = createAdminClient()
    let studentId = ''
    let studentName = ''
    let studentEmail = ''

    if (studentCode === 'TEAM-PREVIEW') {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Non autorizzato', communityMessages: [], dmMessages: [], teamTeachers: [] }
      }
      const { data: prof } = await (admin.from('profiles') as any)
        .select('full_name, email, role')
        .eq('id', user.id)
        .maybeSingle()
      if (user.user_metadata?.role === 'collaborator' || prof?.role === 'collaborator') {
        return { success: false, error: 'Accesso negato', communityMessages: [], dmMessages: [], teamTeachers: [] }
      }
      studentId = user.id
      studentName = prof?.full_name || user.user_metadata?.full_name || 'Team'
      studentEmail = prof?.email || user.email || ''
    } else {
      const identity = await resolveStudentIdentityByCode(studentCode)
      if (!identity) {
        return {
          success: false,
          error: 'Codice studente non valido o non attivo',
          communityMessages: [],
          dmMessages: [],
          teamTeachers: [],
        }
      }
      studentId = identity.studentId
      studentName = identity.name
      studentEmail = identity.email
    }

    // 1. Messaggi del canale pubblico #community-studenti (ultimi 100 in ordine cronologico)
    const { data: commData } = await (admin.from('messages') as any)
      .select('id, channel, content, attachments, sender_id, is_system, created_at, sender:profiles(id, full_name, role, avatar_url)')
      .eq('channel', 'community-studenti')
      .order('created_at', { ascending: false })
      .limit(100)

    const communityMessages = Array.isArray(commData) ? [...commData].reverse() : []

    // 2. Messaggi Diretti (DM 1-a-1) dove partecipa questo studente (o questo utente preview)
    const { data: dmData } = await (admin.from('messages') as any)
      .select('id, channel, content, attachments, sender_id, is_system, created_at, sender:profiles(id, full_name, role, avatar_url)')
      .like('channel', 'dm:%')
      .ilike('channel', `%${studentId}%`)
      .order('created_at', { ascending: true })
      .limit(200)

    const dmMessages = Array.isArray(dmData) ? dmData : []

    // 3. Elenco docenti/team interni (esclusi agenti, account test e collaboratori esterni)
    const { data: profiles } = await (admin.from('profiles') as any)
      .select('id, full_name, email, role, avatar_url, is_agent')
      .order('created_at', { ascending: true })

    const teamTeachers: StudentCommunityTeacher[] = (Array.isArray(profiles) ? profiles : [])
      .filter((p) => {
        if (p.is_agent || p.role === 'collaborator') return false
        const n = (p.full_name || '').toLowerCase()
        const e = (p.email || '').toLowerCase()
        return !n.includes('nemotron') && !n.includes('pentest') && !e.includes('nemotron') && !e.includes('pentest')
      })
      .map((p) => {
        const lower = (p.full_name || '').toLowerCase()
        const mail = (p.email || '').toLowerCase()
        const cleanName =
          lower.includes('gerelmo') || mail.includes('gerelmo')
            ? 'Marco'
            : lower.includes('lorenzolodi') || mail.includes('lorenzo')
            ? 'Lorenzo'
            : lower.includes('malaisi') || lower.includes('maraisi') || mail.includes('malaisi') || mail.includes('maraisi')
            ? 'Stefano'
            : p.full_name || 'Docente AIutiamoci'

        return {
          id: p.id,
          full_name: cleanName,
          role: p.role || 'member',
          avatar_url: p.avatar_url || null,
        }
      })

    return {
      success: true,
      student: {
        id: studentId,
        name: studentName,
        email: studentEmail,
        code: studentCode,
      },
      communityMessages,
      dmMessages,
      teamTeachers,
    }
  } catch (err: any) {
    console.error('[getStudentCommunityChatAction] Error:', err)
    return {
      success: false,
      error: err?.message || 'Errore caricamento community',
      communityMessages: [],
      dmMessages: [],
      teamTeachers: [],
    }
  }
}

/**
 * Invia un messaggio da parte dello studente su #community-studenti oppure in DM 1-a-1 verso un docente.
 */
export async function sendStudentCommunityMessageAction(input: {
  studentCode: string
  content: string
  targetChannel?: string
  parentId?: string
}) {
  try {
    const content = (input.content || '').trim()
    if (!content) {
      return { success: false, error: 'Scrivi un messaggio prima di inviare.' }
    }

    const admin = createAdminClient()
    const targetChannel = (input.targetChannel || 'community-studenti').trim()

    let studentId = ''
    let studentName = ''
    let studentEmail = ''
    let isTeamPreview = false

    if (input.studentCode === 'TEAM-PREVIEW') {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Non autorizzato' }
      }
      const { data: prof } = await (admin.from('profiles') as any)
        .select('full_name, email, role')
        .eq('id', user.id)
        .maybeSingle()
      if (user.user_metadata?.role === 'collaborator' || prof?.role === 'collaborator') {
        return { success: false, error: 'Accesso negato' }
      }
      isTeamPreview = true
      studentId = user.id
      studentName = prof?.full_name || user.user_metadata?.full_name || 'Team'
      studentEmail = prof?.email || user.email || ''
    } else {
      const identity = await resolveStudentIdentityByCode(input.studentCode)
      if (!identity) {
        return { success: false, error: 'Codice studente non valido o non attivo' }
      }
      studentId = identity.studentId
      studentName = identity.name
      studentEmail = identity.email
    }

    // Verifica rigida canale consentito (solo #community-studenti o DM personale con docente)
    let dmTeacherId: string | null = null
    if (targetChannel !== 'community-studenti') {
      if (!targetChannel.startsWith('dm:')) {
        return { success: false, error: 'Canale non consentito per gli studenti' }
      }
      const participants = targetChannel.replace('dm:', '').split('_')
      if (!participants.includes(studentId) || participants.length !== 2) {
        return { success: false, error: 'Conversazione diretta non autorizzata' }
      }
      dmTeacherId = participants.find((id) => id !== studentId) || null
      if (!dmTeacherId) {
        return { success: false, error: 'Destinatario DM non valido' }
      }
    }

    // Risoluzione profilo di sistema per vincolo FK sender_id -> profiles(id)
    let senderProfileId = isTeamPreview ? studentId : ''
    if (!senderProfileId) {
      const { data: systemProfile, error: profErr } = await (admin.from('profiles') as any)
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (profErr || !systemProfile?.id) {
        return { success: false, error: 'Profilo di sistema non disponibile' }
      }
      senderProfileId = systemProfile.id
    }

    const attachments: ChatMetadataItem[] = []
    if (!isTeamPreview) {
      attachments.push({
        type: '__chat_meta__',
        parent_id: input.parentId || null,
        sender_name: `${studentName} (Studente)`,
        sender_email: studentEmail,
        sender_student_id: studentId,
      })
    } else if (input.parentId) {
      attachments.push({
        type: '__chat_meta__',
        parent_id: input.parentId,
      })
    }

    const { data: inserted, error: insertErr } = await (admin.from('messages') as any)
      .insert({
        channel: targetChannel,
        sender_id: senderProfileId,
        is_system: false,
        content,
        attachments,
      })
      .select('id, channel, content, attachments, sender_id, is_system, created_at')
      .single()

    if (insertErr) {
      return { success: false, error: insertErr.message }
    }

    // Notifiche Web Push mirate (Zero Telegram)
    try {
      const subs = await getAllPushSubscriptions(studentId)
      if (targetChannel === 'community-studenti') {
        const pushTargets = subs.filter((s) => s.user_id && s.user_id !== studentId)
        await Promise.allSettled(
          pushTargets.map((sub) => {
            const isStudentSub = sub.user_id?.startsWith('student-')
            return sendWebPushNotification(sub, {
              title: `💬 #community-studenti — ${studentName}`,
              body: content.slice(0, 160),
              url: isStudentSub ? '/corsi?community=1' : '/chat?channel=community-studenti',
              tag: 'chat-community-studenti',
            })
          })
        )
      } else if (dmTeacherId) {
        const teacherTargets = subs.filter((s) => s.user_id === dmTeacherId)
        await Promise.allSettled(
          teacherTargets.map((sub) =>
            sendWebPushNotification(sub, {
              title: `💬 Messaggio privato da ${studentName} (Studente)`,
              body: content.slice(0, 160),
              url: `/chat?channel=${encodeURIComponent(targetChannel)}`,
              tag: `chat-${targetChannel}`,
            })
          )
        )
      }
    } catch (pushErr) {
      console.warn('[sendStudentCommunityMessageAction] Push non riuscita:', pushErr)
    }

    return { success: true, message: inserted }
  } catch (err: any) {
    console.error('[sendStudentCommunityMessageAction] Error:', err)
    return { success: false, error: err?.message || 'Errore invio messaggio' }
  }
}
