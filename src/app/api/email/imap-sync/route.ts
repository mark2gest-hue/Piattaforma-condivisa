import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const accounts = body?.accounts

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Nessun account IMAP specificato per la sincronizzazione.' },
        { status: 400 }
      )
    }

    // Caricamento dinamico server-side di imapflow e mailparser
    const { ImapFlow } = await import('imapflow')
    const { simpleParser } = await import('mailparser')

    const supabase = createAdminClient()
    let totalNewEmails = 0
    const syncResults: { email: string; count: number; error?: string }[] = []

    for (const acc of accounts) {
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

                const { data: existing } = await supabase
                  .from('emails')
                  .select('id')
                  .eq('message_id', msgId)
                  .maybeSingle()

                if (!existing) {
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
