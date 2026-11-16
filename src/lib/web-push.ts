import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/server'

export interface StoredPushSubscription {
  id?: string
  user_id?: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent?: string
  created_at?: string
  updated_at?: string
}

export interface WebPushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

const LOCAL_STORE_FILE = path.join(process.cwd(), '.push-subscriptions.json')
const VAPID_KEYS_FILE = path.join(process.cwd(), '.vapid-keys.json')

/**
 * Ottiene o genera la coppia di chiavi VAPID (P-256 / prime256v1).
 * Usa le variabili d'ambiente se configurate, altrimenti genera e persiste una coppia locale.
 */
export function getOrCreateVapidKeys(): { publicKey: string; privateKeyPem: string } {
  const envPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const envPrivate = process.env.VAPID_PRIVATE_KEY_PEM

  if (envPublic && envPrivate) {
    return {
      publicKey: envPublic.trim(),
      privateKeyPem: envPrivate.replace(/\\n/g, '\n').trim(),
    }
  }

  // Verifica file locale .vapid-keys.json
  try {
    if (fs.existsSync(VAPID_KEYS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VAPID_KEYS_FILE, 'utf8'))
      if (data?.publicKey && data?.privateKeyPem) {
        return {
          publicKey: data.publicKey,
          privateKeyPem: data.privateKeyPem,
        }
      }
    }
  } catch (err) {
    console.warn('[web-push] Impossibile leggere .vapid-keys.json:', err)
  }

  // Generazione nuova coppia di chiavi EC prime256v1
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  })

  const jwk = publicKey.export({ format: 'jwk' }) as { x?: string; y?: string }
  if (!jwk.x || !jwk.y) {
    throw new Error('Esportazione JWK della chiave pubblica fallita')
  }

  // Punto EC non compresso a 65 byte (0x04 + x + y) codificato in base64url
  const pubKeyBase64Url = Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(jwk.x, 'base64url'),
    Buffer.from(jwk.y, 'base64url'),
  ]).toString('base64url')

  const privateKeyPem = privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  }) as string

  try {
    fs.writeFileSync(
      VAPID_KEYS_FILE,
      JSON.stringify({ publicKey: pubKeyBase64Url, privateKeyPem }, null, 2),
      'utf8'
    )
  } catch (err) {
    console.warn('[web-push] Impossibile persistere .vapid-keys.json:', err)
  }

  return { publicKey: pubKeyBase64Url, privateKeyPem }
}

/**
 * Crittografa il payload Web Push secondo lo standard RFC 8291 (aes128gcm).
 */
export function encryptWebPushPayload(
  p256dhBase64Url: string,
  authBase64Url: string,
  payloadStr: string
): Buffer {
  const uaPublic = Buffer.from(p256dhBase64Url, 'base64url')
  const authSecret = Buffer.from(authBase64Url, 'base64url')

  const ecdh = crypto.createECDH('prime256v1')
  ecdh.generateKeys()
  const asPublic = ecdh.getPublicKey()
  const sharedSecret = ecdh.computeSecret(uaPublic)

  const salt = crypto.randomBytes(16)
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0', 'utf8'), uaPublic, asPublic])

  const ikm = Buffer.from(crypto.hkdfSync('sha256', sharedSecret, authSecret, keyInfo, 32))
  const cek = Buffer.from(
    crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0', 'utf8'), 16)
  )
  const nonce = Buffer.from(
    crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0', 'utf8'), 12)
  )

  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce)
  // RFC 8291: padding con delimitatore 0x02 per l'ultimo record
  const padded = Buffer.concat([Buffer.from(payloadStr, 'utf8'), Buffer.from([2])])
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()])

  // Record size (rs): 4096 in formato big-endian uint32
  const rsBuf = Buffer.alloc(4)
  rsBuf.writeUInt32BE(4096, 0)

  // Lunghezza della chiave pubblica effimera del server (65 byte)
  const idLenBuf = Buffer.from([asPublic.length])

  return Buffer.concat([salt, rsBuf, idLenBuf, asPublic, encrypted])
}

/**
 * Legge le sottoscrizioni memorizzate nel file locale di fallback.
 */
function readLocalSubscriptions(): StoredPushSubscription[] {
  try {
    if (!fs.existsSync(LOCAL_STORE_FILE)) return []
    const content = fs.readFileSync(LOCAL_STORE_FILE, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[web-push] Errore lettura local store:', err)
    return []
  }
}

/**
 * Scrive le sottoscrizioni nel file locale di fallback.
 */
function writeLocalSubscriptions(subs: StoredPushSubscription[]): void {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(subs, null, 2), 'utf8')
  } catch (err) {
    console.warn('[web-push] Errore scrittura local store:', err)
  }
}

/**
 * Salva la sottoscrizione sia su Supabase che nel fallback locale.
 */
export async function saveUserPushSubscription(sub: {
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent?: string
}): Promise<void> {
  const now = new Date().toISOString()
  const record: StoredPushSubscription = {
    user_id: sub.user_id,
    endpoint: sub.endpoint,
    p256dh: sub.p256dh,
    auth: sub.auth,
    user_agent: sub.user_agent,
    updated_at: now,
  }

  // 1. Supabase (con try/catch silenzioso in caso di DB non migrato)
  try {
    const admin = createAdminClient()
    await (admin.from('push_subscriptions') as any).upsert(
      {
        user_id: sub.user_id,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        user_agent: sub.user_agent,
        updated_at: now,
      },
      { onConflict: 'endpoint' }
    )
  } catch (err) {
    console.warn('[web-push] Salvataggio Supabase non riuscito (fallback su file locale attivo):', err)
  }

  // 2. Local fallback store deduplicato per endpoint
  const current = readLocalSubscriptions()
  const existingIndex = current.findIndex((s) => s.endpoint === sub.endpoint)
  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], ...record }
  } else {
    current.push({ ...record, created_at: now })
  }
  writeLocalSubscriptions(current)
}

/**
 * Rimuove una sottoscrizione scaduta o non valida da Supabase e dal local store.
 */
export async function removePushSubscription(endpoint: string): Promise<void> {
  try {
    const admin = createAdminClient()
    await (admin.from('push_subscriptions') as any).delete().eq('endpoint', endpoint)
  } catch (err) {
    console.warn('[web-push] Rimozione da Supabase fallita:', err)
  }

  const current = readLocalSubscriptions().filter((s) => s.endpoint !== endpoint)
  writeLocalSubscriptions(current)
}

/**
 * Recupera tutte le sottoscrizioni (unendo Supabase e local store, deduplicando per endpoint).
 */
export async function getAllPushSubscriptions(
  excludeUserId?: string
): Promise<StoredPushSubscription[]> {
  const map = new Map<string, StoredPushSubscription>()

  // 1. Lettura dal fallback locale
  for (const s of readLocalSubscriptions()) {
    if (s.endpoint) map.set(s.endpoint, s)
  }

  // 2. Lettura da Supabase
  try {
    const admin = createAdminClient()
    const { data } = await (admin.from('push_subscriptions') as any).select('*')
    if (Array.isArray(data)) {
      for (const row of data) {
        if (row.endpoint) map.set(row.endpoint, row)
      }
    }
  } catch (err) {
    // Tabella non ancora migrata sul DB remoto, si prosegue con il local store
  }

  let list = Array.from(map.values())
  if (excludeUserId) {
    list = list.filter((s) => s.user_id !== excludeUserId)
  }
  return list
}

/**
 * Invia una notifica Web Push a una singola sottoscrizione via VAPID ES256.
 */
export async function sendWebPushNotification(
  sub: StoredPushSubscription,
  payload: WebPushPayload
): Promise<{ success: boolean; status: number; error?: string }> {
  try {
    const { publicKey, privateKeyPem } = getOrCreateVapidKeys()
    const endpointUrl = new URL(sub.endpoint)

    // Costruzione del token VAPID JWT
    const header = { typ: 'JWT', alg: 'ES256' }
    const claims = {
      aud: endpointUrl.origin,
      exp: Math.floor(Date.now() / 1000) + 43200, // 12 ore
      sub: 'mailto:info@aiutiamoci.cloud',
    }

    const unsignedToken = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(
      JSON.stringify(claims)
    ).toString('base64url')}`

    const signature = crypto
      .sign('sha256', Buffer.from(unsignedToken), {
        key: privateKeyPem,
        dsaEncoding: 'ieee-p1363',
      })
      .toString('base64url')

    const jwt = `${unsignedToken}.${signature}`

    // Crittografia del payload con aes128gcm
    const encryptedBody = encryptWebPushPayload(sub.p256dh, sub.auth, JSON.stringify(payload))

    const response = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `vapid t=${jwt}, k=${publicKey}`,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '86400',
        Urgency: 'high',
      },
      body: new Uint8Array(encryptedBody),
    })

    if (response.status === 404 || response.status === 410) {
      // Sottoscrizione scaduta o annullata dal client: rimozione automatica
      await removePushSubscription(sub.endpoint)
    }

    return {
      success: response.ok,
      status: response.status,
    }
  } catch (error: any) {
    console.error(`[web-push] Errore invio push verso ${sub.endpoint}:`, error)
    return {
      success: false,
      status: 500,
      error: error.message,
    }
  }
}
