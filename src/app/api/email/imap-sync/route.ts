import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return handleImapSync(request)
}

export async function POST(request: NextRequest) {
  return handleImapSync(request)
}

async function handleImapSync(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const url = new URL(request.url)
    const tokenQuery = url.searchParams.get('token')

    // Se è specificato un CRON_SECRET, valida se invocato come cron/n8n esterno senza cookie
    if (cronSecret && (tokenQuery || authHeader)) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`
      const isTokenValid = tokenQuery === cronSecret
      if (!isBearerValid && !isTokenValid) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
      }
    }

    let accounts: any[] = []

    // Prova a leggere accounts dal body se presente (POST manuale dal frontend)
    if (request.method === 'POST') {
      try {
        const body = await request.json()
        if (body?.accounts && Array.isArray(body.accounts) && body.accounts.length > 0) {
          accounts = body.accounts
        }
      } catch {
        // Nessun body JSON fornito, userà le impostazioni salvate su DB
      }
    }

    const supabase = createAdminClient()

    // Se non ci sono accounts nel body, recuperali dal database (knowledge_items con category='system_imap_config')
    if (!accounts || accounts.length === 0) {
      const { data: dbItem } = await supabase
        .from('knowledge_items')
        .select('content')
        .eq('category', 'system_imap_config')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (dbItem && dbItem.content) {
        try {
          const parsed = JSON.parse(dbItem.content)
          if (Array.isArray(parsed)) {
            accounts = parsed
          }
        } catch {}
      }
    }

    const configuredAccounts = accounts.filter(
      (a: any) => a && a.email && typeof a.password === 'string' && a.password.trim().length > 0
    )

    if (configuredAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nessun account IMAP con password configurata trovato su DB o nel body.',
          syncedCount: 0,
        },
        { status: 400 }
      )
    }

    // Caricamento dinamico server-side di imapflow e mailparser
    const { ImapFlow } = await import('imapflow')
    const { simpleParser } = await import('mailparser')

    let totalNewEmails = 0
    const syncResults: { email: string; count: number; error?: string }[] = []

    for (const acc of configuredAccounts) {
      if (!acc.email || !acc.password) {
        continue
      }

      const client = new ImapFlow({
        host: 'imaps.aruba.it',
        port: 993,
        secure: true,
        auth: {
          user: acc.email.trim(),
          pass: acc.password.trim(),
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        logger: false,
      })

      let accountCount = 0

      try {
        await client.connect()

        const lock = await client.getMailboxLock('INBOX')

        try {
          const status = client.mailbox
          const totalMessages = (status && typeof status === 'object' && 'exists' in status) ? Number((status as any).exists) : 0

          if (totalMessages > 0) {
            const fromSeq = Math.max(1, totalMessages - 29)
            const range = `${fromSeq}:*`

            for await (const message of client.fetch(range, { source: true, uid: true, envelope: true })) {
              if (!message.source) continue

              try {
                const parsed = await simpleParser(message.source)
                const msgId = parsed.messageId || `aruba_${acc.email}_${message.uid}`

                // 1. Controlla se è già presente in emails (anche se in stato 'trash')
                const { data: existing } = await supabase
                  .from('emails')
                  .select('id')
                  .eq('message_id', msgId)
                  .maybeSingle()

                // 2. Controlla se è stata eliminata definitivamente in passato (blacklist anti-reimport)
                const { data: isDeletedForever } = await supabase
                  .from('deleted_email_identifiers')
                  .select('message_id')
                  .eq('message_id', msgId)
                  .maybeSingle()

                if (!existing && !isDeletedForever) {
                  const fromStr = parsed.from?.text || parsed.from?.value?.[0]?.address || 'Sconosciuto'
                  const toList: string[] = [acc.email]
                  if (parsed.to) {
                    const toAddresses = Array.isArray(parsed.to) ? parsed.to : [parsed.to]
                    toAddresses.forEach((t) => {
                      t.value?.forEach((v) => {
                        if (v.address && !toList.includes(v.address)) {
                          toList.push(v.address)
                        }
                      })
                    })
                  }

                  const createdAt = parsed.date ? parsed.date.toISOString() : new Date().toISOString()

                  await (supabase as any).from('emails').insert({
                    direction: 'inbound',
                    from_address: fromStr,
                    to_address: toList,
                    subject: parsed.subject || '(Nessun oggetto)',
                    body_html: parsed.html || null,
                    body_text: parsed.text || '',
                    status: 'received',
                    message_id: msgId,
                    created_at: createdAt,
                  })

                  accountCount++
                  totalNewEmails++
                }
              } catch (parseErr: any) {
                console.error(`Errore parsing messaggio ${message.uid} per ${acc.email}:`, parseErr.message)
              }
            }
          }

          syncResults.push({ email: acc.email, count: accountCount })
        } finally {
          lock.release()
        }

        await client.logout()
      } catch (err: any) {
        console.error(`[IMAP Sync] Errore connessione Aruba per ${acc.email}:`, err.message)
        syncResults.push({ email: acc.email, count: 0, error: err.message || 'Errore di autenticazione IMAP' })
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: totalNewEmails,
      details: syncResults,
    })
  } catch (error: any) {
    console.error('Errore API IMAP sync:', error)
    return NextResponse.json({ error: error.message || 'Errore interno server' }, { status: 500 })
  }
}
