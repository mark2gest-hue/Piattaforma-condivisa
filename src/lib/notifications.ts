'use client'

/**
 * Genera un suono di notifica pulito ed armonioso tramite Web Audio API
 * senza bisogno di scaricare file audio esterni.
 */
export function playNotificationSound(type: 'chat' | 'email' | 'call' = 'chat') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'call') {
      // Suono squillo videocall (due toni alternati)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now) // A4
      osc.frequency.setValueAtTime(880, now + 0.15) // A5
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    } else if (type === 'email') {
      // Suono posta (trillo soft)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12) // E5
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.3)
    } else {
      // Suono chat (chime moderno D5 -> A5)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08) // A5
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  } catch (e) {
    console.error('Audio Notification Error:', e)
  }
}

/**
 * Richiede i permessi per le notifiche desktop del browser
 */
export async function requestNotificationPermission() {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
  } catch (e) {
    // Permessi notifiche non supportati o bloccati dal browser senza gesto utente
  }
}

/**
 * Invia una notifica desktop visiva e riproduce il suono
 */
export function sendDesktopNotification(
  title: string,
  options?: NotificationOptions,
  type: 'chat' | 'email' | 'call' = 'chat'
) {
  // Riproduce sempre il suono
  playNotificationSound(type)

  // Se le notifiche sono abilitate ed il browser/tab è in background o inattivo
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    })
  }
}

/**
 * Converte una stringa base64url in un Uint8Array per applicationServerKey VAPID.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Converte un ArrayBuffer in stringa base64url.
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Verifica lo stato attuale del supporto e della sottoscrizione Web Push.
 */
export async function getWebPushStatus(): Promise<'unsupported' | 'denied' | 'subscribed' | 'prompt'> {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (reg) {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        return 'subscribed'
      }
    }
  } catch (e) {
    console.warn('[notifications] Errore verifica push status:', e)
  }

  return 'prompt'
}

/**
 * Registra il Service Worker /sw.js, richiede i permessi di notifica
 * e sottoscrive il browser al server VAPID.
 */
export async function registerWebPushSubscription(vapidPublicKey: string): Promise<{
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent: string
}> {
  if (typeof window === 'undefined') {
    throw new Error('Ambiente browser non disponibile')
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Web Push non supportato su questo browser')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Permesso notifiche non concesso')
  }

  // Registrazione Service Worker
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  await navigator.serviceWorker.ready

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

  let subscription = await reg.pushManager.getSubscription()
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as any,
    })
  }

  const p256dhKey = subscription.getKey('p256dh')
  const authKey = subscription.getKey('auth')

  const p256dh = arrayBufferToBase64Url(p256dhKey)
  const auth = arrayBufferToBase64Url(authKey)

  return {
    endpoint: subscription.endpoint,
    keys: { p256dh, auth },
    userAgent: navigator.userAgent,
  }
}
