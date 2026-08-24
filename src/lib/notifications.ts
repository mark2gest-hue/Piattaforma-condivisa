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
