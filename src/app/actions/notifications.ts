'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'
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

export async function notifyChatMessageAction(channel: string, content: string, senderName?: string) {
  try {
    let senderUserId: string | undefined
    let userName = senderName

    try {
      const client = await createClient()
      const { data: { user } } = await client.auth.getUser()
      if (user) {
        senderUserId = user.id
      }
    } catch {
      // Ignora errore lettura sessione utente
    }

    if (!userName) {
      userName = await getCurrentUserProfileName()
    }
    const channelLabel = `#${channel}`

    const telegramMessage =
      `💬 <b>Nuovo Messaggio in Chat (${escapeHtml(channelLabel)})</b>\n\n` +
      `👤 <b>Da:</b> ${escapeHtml(userName)}\n` +
      `📝 <b>Messaggio:</b> <i>"${escapeHtml(content)}"</i>\n\n` +
      `🔗 <a href="https://aiutiamoci.cloud/chat">Apri la Chat su Aiutiamoci</a>`

    // Esecuzione concorrente: invio Web Push alle altre sessioni + invio su canale Telegram
    const [telegramResult, pushResult] = await Promise.allSettled([
      sendTelegramMessage(telegramMessage),
      (async () => {
        const recipients = await getAllPushSubscriptions(senderUserId)
        if (recipients.length === 0) return { delivered: 0 }

        const pushPayload = {
          title: `💬 #${channel} — ${userName}`,
          body: content,
          url: `/chat?channel=${encodeURIComponent(channel)}`,
          tag: `chat-${channel}`,
        }

        const outcomes = await Promise.allSettled(
          recipients.map((sub) => sendWebPushNotification(sub, pushPayload))
        )
        return { delivered: outcomes.length }
      })(),
    ])

    if (telegramResult.status === 'rejected' || (telegramResult.status === 'fulfilled' && !telegramResult.value.success)) {
      console.warn(
        '[notifyChatMessageAction] Telegram send failed:',
        (telegramResult as any).value?.error || (telegramResult as any).reason
      )
    }

    return {
      success: true,
      telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : null,
      push: pushResult.status === 'fulfilled' ? pushResult.value : null,
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

