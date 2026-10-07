/**
 * Utility per l'invio di notifiche al gruppo Telegram dei soci.
 * Utilizza le variabili d'ambiente:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 */

export function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID non configurati in .env.local')
    return { success: false, error: 'Credenziali Telegram non configurate' }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error('[Telegram API Error]:', data)
      return { success: false, error: data.description }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[Telegram Error]:', err)
    return { success: false, error: err?.message || 'Errore di rete durante invio notifica Telegram' }
  }
}
export async function sendTelegramPhoto(photoUrl: string, caption: string = ''): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return { success: false, error: 'Credenziali Telegram non configurate' }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendPhoto`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      return { success: false, error: data.description }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Errore invio foto su Telegram' }
  }
}

export async function sendTelegramVideo(videoUrl: string, caption: string = ''): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return { success: false, error: 'Credenziali Telegram non configurate' }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendVideo`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      return { success: false, error: data.description }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Errore invio video su Telegram' }
  }
}
