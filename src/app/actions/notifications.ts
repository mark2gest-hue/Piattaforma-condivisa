'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'
import { sendSharedEmail } from '@/app/(dashboard)/posta/actions'
import { resolveStudentIdentityByCode } from '@/app/actions/support'
import { getCollaboratorIdsAction, getCustomChannelByNameAction } from '@/app/actions/chat'
import {
  getOrCreateVapidKeys,
  saveUserPushSubscription,
  getAllPushSubscriptions,
  sendWebPushNotification,
} from '@/lib/web-push'

export async function getCurrentUserProfileName(): Promise<string> {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return 'Membro del team'

    const adminClient = createAdminClient()
    const { data: profile } = await (adminClient
      .from('profiles') as any)
      .select('full_name')
      .eq('id', user.id)
      .single()

    return (profile as any)?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Membro del team'
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

export async function notifyFileUploadAction(fileName: string, isFolder: boolean = false, uploaderName?: string) {
  try {
    const userName = uploaderName || (await getCurrentUserProfileName())
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

async function resolveStudentEmailByChatId(studentChatId: string): Promise<{ name: string; email: string } | null> {
  if (!studentChatId.startsWith('student-')) return null
  const rawId = studentChatId.slice('student-'.length)
  if (!rawId) return null

  const admin = createAdminClient()

  try {
    const { data: codeRow } = await (admin.from('student_codes') as any)
      .select('student_name, student_email')
      .eq('id', rawId)
      .maybeSingle()

    if (codeRow?.student_email) {
      return {
        name: (codeRow.student_name || 'Studente').trim(),
        email: codeRow.student_email.trim().toLowerCase(),
      }
    }
  } catch {
    // Ignora se non trovato o formato UUID diverso
  }

  try {
    const { data: regRow } = await (admin.from('course_registrations') as any)
      .select('name, email')
      .eq('id', rawId)
      .maybeSingle()

    if (regRow?.email) {
      return {
        name: (regRow.name || 'Studente').trim(),
        email: regRow.email.trim().toLowerCase(),
      }
    }
  } catch {
    // Ignora
  }

  return null
}

async function getAllActiveStudentEmails(): Promise<Array<{ name: string; email: string }>> {
  const admin = createAdminClient()
  const emailMap = new Map<string, string>()

  const { data: teamProfiles } = await (admin.from('profiles') as any).select('email')
  const teamEmails = new Set(
    (Array.isArray(teamProfiles) ? teamProfiles : [])
      .map((p) => p.email?.trim().toLowerCase())
      .filter(Boolean)
  )

  const { data: codesData } = await (admin.from('student_codes') as any)
    .select('student_name, student_email, is_active')
    .eq('is_active', true)

  if (Array.isArray(codesData)) {
    for (const row of codesData) {
      const email = (row.student_email || '').trim().toLowerCase()
      if (email && email.includes('@') && !email.endsWith('.local') && !teamEmails.has(email) && !emailMap.has(email)) {
        emailMap.set(email, (row.student_name || 'Studente').trim())
      }
    }
  }

  const { data: regData } = await (admin.from('course_registrations') as any)
    .select('name, email, approved, status')

  if (Array.isArray(regData)) {
    for (const row of regData) {
      if (row.approved === true || row.status === 'approved') {
        const email = (row.email || '').trim().toLowerCase()
        if (email && email.includes('@') && !email.endsWith('.local') && !teamEmails.has(email) && !emailMap.has(email)) {
          emailMap.set(email, (row.name || 'Studente').trim())
        }
      }
    }
  }

  return Array.from(emailMap.entries()).map(([email, name]) => ({ email, name }))
}

export async function notifyChatMessageAction(
  channel: string,
  content: string,
  senderName?: string,
  options?: {
    isThreadReply?: boolean
    mentionedNames?: string[]
    recipientUserIds?: string[]
    isDirectMessage?: boolean
    isPrivateChannel?: boolean
    notifyStudentsByEmail?: boolean
  }
) {
  try {
    let senderUserId: string | undefined
    let isInternalStaffSender = false
    let userName = senderName

    try {
      const client = await createClient()
      const { data: { user } } = await client.auth.getUser()
      if (user) {
        senderUserId = user.id
        const admin = createAdminClient()
        const { data: prof } = await (admin.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        const role =
          user.user_metadata?.role === 'collaborator'
            ? 'collaborator'
            : prof?.role || user.user_metadata?.role || 'member'
        isInternalStaffSender = role !== 'collaborator'
      }
    } catch {
      // Ignora errore lettura sessione utente
    }

    if (!userName) {
      userName = await getCurrentUserProfileName()
    }

    // Titolo Web Push personalizzato per menzioni, DM, canali privati o risposte a thread
    let pushTitle = `💬 #${channel} — ${userName}`
    if (options?.isDirectMessage) {
      pushTitle = `💬 Messaggio diretto da ${userName}`
    } else if (options?.isPrivateChannel) {
      pushTitle = `🔒 #${channel} — ${userName}`
    } else if (options?.mentionedNames && options.mentionedNames.length > 0) {
      pushTitle = `🔔 ${userName} ti ha menzionato in #${channel}`
    } else if (options?.isThreadReply) {
      pushTitle = `💬 Risposta al thread in #${channel} — ${userName}`
    }

    const isCommunityChannel = channel === 'community-studenti'
    const hasMentionTutti =
      (options?.mentionedNames || []).some((m) => m.toLowerCase() === 'tutti') ||
      /@tutti\b/i.test(content)
    const customCh = await getCustomChannelByNameAction(channel)

    // Esecuzione concorrente: Web Push nativa VAPID + Email automatica intelligente (Zero Telegram)
    const [pushResult, emailResult] = await Promise.allSettled([
      (async () => {
        let recipients = await getAllPushSubscriptions(senderUserId)
        const collabList = await getCollaboratorIdsAction()
        const collabIds = new Set(collabList)

        if (options?.recipientUserIds && options.recipientUserIds.length > 0) {
          recipients = recipients.filter(
            (sub) => sub.user_id && options.recipientUserIds!.includes(sub.user_id)
          )
        } else if (isCommunityChannel) {
          // Zero-Leak: su #community-studenti escludiamo tutti i collaboratori esterni
          recipients = recipients.filter(
            (sub) => !sub.user_id || !collabIds.has(sub.user_id)
          )
        } else {
          // Zero-Leak: escludi student-* e ammetti collaborator solo se membro esplicito del canale custom
          recipients = recipients.filter((sub) => {
            if (sub.user_id && sub.user_id.startsWith('student-')) return false
            if (sub.user_id && collabIds.has(sub.user_id)) {
              return Boolean(
                customCh &&
                  Array.isArray(customCh.memberIds) &&
                  customCh.memberIds.includes(sub.user_id)
              )
            }
            return true
          })
        }

        if (recipients.length === 0) return { delivered: 0 }

        const outcomes = await Promise.allSettled(
          recipients.map((sub) => {
            const isStudentSub = Boolean(sub.user_id && sub.user_id.startsWith('student-'))
            const targetUrl = isStudentSub
              ? options?.isDirectMessage
                ? '/corsi?chat=dm'
                : isCommunityChannel
                ? '/corsi?community=1'
                : `/corsi?channel=${encodeURIComponent(channel)}`
              : `/chat?channel=${encodeURIComponent(channel)}`

            return sendWebPushNotification(sub, {
              title: pushTitle,
              body: content.slice(0, 180),
              url: targetUrl,
              tag: `chat-${channel}`,
            })
          })
        )
        return { delivered: outcomes.length }
      })(),
      (async () => {
        if (!isInternalStaffSender) return { sent: 0 }

        // Caso A: #community-studenti con @tutti o toggle Email esplicito attivo
        if (isCommunityChannel && (options?.notifyStudentsByEmail || hasMentionTutti)) {
          const students = await getAllActiveStudentEmails()
          if (students.length === 0) return { sent: 0 }

          const preview = content.length > 600 ? `${content.slice(0, 600)}...` : content
          const outcomes = await Promise.allSettled(
            students.map((st) =>
              sendSharedEmail({
                to: st.email,
                subject: `📢 Avviso importante in #community-studenti — ${userName}`,
                body: `Ciao ${st.name},\n\n${userName} ha pubblicato un avviso importante nel canale #community-studenti su AIutiamoci Academy:\n\n"${preview}"\n\n👉 Leggi e rispondi direttamente nell'Area Corsisti:\nhttps://aiutiamoci.cloud/corsi?community=1\n\nA presto,\nTeam AIutiamoci`,
              })
            )
          )
          return { sent: outcomes.length }
        }

        // Caso A2: Canale privato con studenti selezionati e @tutti o toggle Email attivo
        if (
          !isCommunityChannel &&
          !options?.isDirectMessage &&
          (options?.notifyStudentsByEmail || hasMentionTutti)
        ) {
          const studentIds = Array.from(
            new Set([
              ...((options?.recipientUserIds || []).filter((id) => id.startsWith('student-'))),
              ...((customCh?.memberIds || []).filter((id) => id.startsWith('student-'))),
            ])
          )
          if (studentIds.length === 0) return { sent: 0 }

          const resolved = await Promise.all(studentIds.map((id) => resolveStudentEmailByChatId(id)))
          const uniqueByEmail = new Map<string, { name: string; email: string }>()
          for (const st of resolved) {
            if (st && st.email.includes('@') && !st.email.endsWith('.local') && !uniqueByEmail.has(st.email)) {
              uniqueByEmail.set(st.email, st)
            }
          }
          if (uniqueByEmail.size === 0) return { sent: 0 }

          const preview = content.length > 600 ? `${content.slice(0, 600)}...` : content
          const channelUrl = `https://aiutiamoci.cloud/corsi?channel=${encodeURIComponent(channel)}`
          const outcomes = await Promise.allSettled(
            Array.from(uniqueByEmail.values()).map((st) =>
              sendSharedEmail({
                to: st.email,
                subject: `📢 Nuovo messaggio in #${channel} — ${userName}`,
                body: `Ciao ${st.name},\n\n${userName} ha pubblicato un avviso importante nel canale riservato #${channel} su AIutiamoci Academy:\n\n"${preview}"\n\n👉 Leggi e rispondi direttamente nell'Area Corsisti:\n${channelUrl}\n\nA presto,\nTeam AIutiamoci`,
              })
            )
          )
          return { sent: outcomes.length }
        }

        // Caso B: DM 1-a-1 verso uno studente (student-<id>)
        if (options?.isDirectMessage && channel.startsWith('dm:')) {
          const studentTargetId =
            (options.recipientUserIds || []).find((id) => id.startsWith('student-')) ||
            channel
              .replace('dm:', '')
              .split('_')
              .find((id) => id.startsWith('student-'))

          if (!studentTargetId) return { sent: 0 }

          const studentInfo = await resolveStudentEmailByChatId(studentTargetId)
          if (!studentInfo || !studentInfo.email.includes('@') || studentInfo.email.endsWith('.local')) {
            return { sent: 0 }
          }

          const preview = content.length > 600 ? `${content.slice(0, 600)}...` : content
          await sendSharedEmail({
            to: studentInfo.email,
            subject: `💬 Nuovo messaggio privato da ${userName} su AIutiamoci Academy`,
            body: `Ciao ${studentInfo.name},\n\nhai ricevuto un nuovo messaggio privato 1-a-1 da ${userName}:\n\n"${preview}"\n\n👉 Rispondi direttamente dalla tua Area Corsisti:\nhttps://aiutiamoci.cloud/corsi?chat=dm\n\nA presto,\nTeam AIutiamoci`,
          })
          return { sent: 1 }
        }

        return { sent: 0 }
      })(),
    ])

    return {
      success: true,
      telegram: { success: true, skipped: true },
      push: pushResult.status === 'fulfilled' ? pushResult.value : null,
      email: emailResult.status === 'fulfilled' ? emailResult.value : null,
    }
  } catch (err: any) {
    console.error('Errore notifyChatMessageAction:', err)
    return { success: false, error: err.message }
  }
}

export async function getVapidPublicKeyAction() {
  try {
    const { publicKey } = getOrCreateVapidKeys()
    return { success: true, publicKey }
  } catch (error: any) {
    console.error('Errore getVapidPublicKeyAction:', error)
    return { success: false, error: error.message }
  }
}

export async function savePushSubscriptionAction(sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return { success: false, error: 'Parametri sottoscrizione mancanti o non validi' }
    }

    await saveUserPushSubscription({
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: sub.userAgent,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Errore savePushSubscriptionAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Livello 1 Notifiche Studenti: salva sottoscrizione Web Push per uno studente attivo ('student-<id>').
 */
export async function saveStudentPushSubscriptionAction(input: {
  studentCode: string
  sub: {
    endpoint: string
    keys: { p256dh: string; auth: string }
    userAgent?: string
  }
}) {
  try {
    if (!input.sub?.endpoint || !input.sub?.keys?.p256dh || !input.sub?.keys?.auth) {
      return { success: false, error: 'Parametri sottoscrizione mancanti o non validi' }
    }

    const identity = await resolveStudentIdentityByCode(input.studentCode)
    if (!identity) {
      return { success: false, error: 'Codice studente non valido o non attivo' }
    }

    await saveUserPushSubscription({
      user_id: identity.studentId,
      endpoint: input.sub.endpoint,
      p256dh: input.sub.keys.p256dh,
      auth: input.sub.keys.auth,
      user_agent: input.sub.userAgent,
    })

    return { success: true, studentId: identity.studentId }
  } catch (error: any) {
    console.error('Errore saveStudentPushSubscriptionAction:', error)
    return { success: false, error: error.message }
  }
}

export async function sendTestPushNotificationAction() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non autorizzato' }
    }

    const allSubs = await getAllPushSubscriptions()
    const userSubs = allSubs.filter((s) => s.user_id === user.id)

    if (userSubs.length === 0) {
      return {
        success: false,
        error: 'Nessuna sottoscrizione push attiva per questo dispositivo.',
      }
    }

    const results = await Promise.allSettled(
      userSubs.map((sub) =>
        sendWebPushNotification(sub, {
          title: '🔔 Notifiche Push Attive!',
          body: 'Le notifiche dirette di AIutiamoci Chat funzionano su questo dispositivo.',
          url: '/chat',
          tag: 'test-push',
        })
      )
    )

    return { success: true, count: results.length }
  } catch (error: any) {
    console.error('Errore sendTestPushNotificationAction:', error)
    return { success: false, error: error.message }
  }
}

