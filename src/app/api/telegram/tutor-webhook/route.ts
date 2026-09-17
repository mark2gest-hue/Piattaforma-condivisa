import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'
import { createClient } from '@supabase/supabase-js'

// Token del Bot Tutor per gli studenti letto in modo sicuro dalle variabili d'ambiente
const TUTOR_BOT_TOKEN = process.env.TELEGRAM_TUTOR_BOT_TOKEN || ''
const TELEGRAM_API = `https://api.telegram.org/bot${TUTOR_BOT_TOKEN}`

// Inizializzazione Gemini
const geminiApiKey = process.env.GEMINI_API_KEY
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null

// Inizializzazione Supabase per recupero eventi calendario / lezioni
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

// Helper invio messaggio tramite il bot Tutor
async function sendTutorMessage(chatId: number | string, text: string, replyMarkup?: any, replyToMessageId?: number) {
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }
    if (replyMarkup) payload.reply_markup = replyMarkup
    if (replyToMessageId) payload.reply_to_message_id = replyToMessageId

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[TutorBot sendTutorMessage error]:', err)
  }
}

// Helper per rispondere al callback query
async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    })
  } catch (err) {
    console.error('[TutorBot answerCallbackQuery error]:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()

    // 1. Gestione Callback Query (Pulsanti [Marco], [Lorenzo], [Stefano])
    if (update.callback_query) {
      const cb = update.callback_query
      const data = cb.data // es: "contact:marco", "contact:lorenzo", "contact:stefano"
      const fromUser = cb.from
      const chatId = cb.message?.chat?.id
      const studentName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || 'Corsista'
      const username = fromUser.username ? `@${fromUser.username}` : 'Nessun username'

      if (data?.startsWith('contact:')) {
        const target = data.split(':')[1] // 'marco' | 'lorenzo' | 'stefano'
        const targetNames: Record<string, string> = {
          marco: 'Marco',
          lorenzo: 'Lorenzo',
          stefano: 'Stefano',
        }
        const chosenName = targetNames[target] || 'un docente'

        // Notifica istantanea nel gruppo privato dei Soci esistente!
        await sendTelegramMessage(
          `🔔 <b>Nuova richiesta di contatto da Aiutiamoci Community</b>\n\n` +
          `👤 <b>Corsista:</b> ${escapeHtml(studentName)} (${escapeHtml(username)})\n` +
          `🎯 <b>Ha richiesto di parlare con:</b> <b>${escapeHtml(chosenName)}</b>\n` +
          `💬 <i>Si richiede di ricontattarlo in privato su Telegram.</i>`
        )

        // Risposta a schermo per lo studente
        await answerCallbackQuery(cb.id, `Richiesta inviata a ${chosenName}!`)

        if (chatId) {
          await sendTutorMessage(
            chatId,
            `✅ <b>Perfetto ${escapeHtml(studentName)}!</b> Ho inviato la notifica a <b>${escapeHtml(chosenName)}</b> nel nostro gruppo interno. Ti risponderà al più presto in privato!`,
            undefined,
            cb.message?.message_id
          )
        }
      }

      return NextResponse.json({ ok: true })
    }

    // 2. Gestione Messaggi Testuali
    const message = update.message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup'
    const fromUser = message.from || {}
    const studentName = fromUser.first_name || 'Corsista'

    // 2a. Evento Nuovo Membro nel Gruppo -> Vademecum Ufficiale
    if (message.new_chat_members && message.new_chat_members.length > 0) {
      for (const newMember of message.new_chat_members) {
        if (newMember.is_bot) continue
        const welcomeName = newMember.first_name || 'nuovo corsista'
        const vademecumText =
          `👋 <b>Benvenuto/a ${escapeHtml(welcomeName)} nella Community di Aiutiamoci!</b> 🚀\n\n` +
          `Ecco un breve <b>Vademecum</b> su come utilizzare al meglio questo spazio:\n\n` +
          `👥 <b>1. Uno Spazio Aperto tra Persone:</b>\n` +
          `• Questo gruppo è una chat libera per confrontarsi, fare networking, scambiarsi feedback ed esperienze pratiche sull'adozione dell'AI nel lavoro.\n` +
          `• Sentiti libero/a di scrivere, condividere news o chiedere consigli agli altri membri.\n\n` +
          `🤖 <b>2. Come usare il Tutor AI (@Corsi_Masterclass_bot):</b>\n` +
          `• Il bot non disturba le vostre conversazioni e resta in silenzio.\n` +
          `• Se hai un dubbio didattico su un prompt, uno strumento (ChatGPT, Claude, DeepSeek) o una lezione, basta <b>taggarlo</b> nel messaggio: <code>@Corsi_Masterclass_bot</code>.\n` +
          `• Puoi anche aprirgli una <b>chat privata</b> 1-a-1 per fargli domande h24 senza intasare il gruppo.\n\n` +
          `⚡ <b>3. Scorciatoie Utili:</b>\n` +
          `• <code>/orari</code> ➔ Data e link Google Meet della prossima Masterclass.\n` +
          `• <code>/docenti</code> ➔ Per metterti in contatto diretto e privato con <b>Marco</b>, <b>Lorenzo</b> o <b>Stefano</b> per qualsiasi esigenza personale.\n` +
          `• <code>/vademecum</code> ➔ Per rileggere questa guida quando vuoi.\n\n` +
          `🌐 <b>4. La Piattaforma Web:</b>\n` +
          `• Accedi a tutte le stanze e strumenti su: <b>https://aiutiamoci.cloud</b>\n\n` +
          `<i>Buon percorso insieme da tutto il team! ✨</i>`

        await sendTutorMessage(chatId, vademecumText)
      }
      return NextResponse.json({ ok: true })
    }

    const text = (message.text || '').trim()
    if (!text) {
      return NextResponse.json({ ok: true })
    }

    // Comandi Vademecum / Start / Guida
    const lowerRawText = text.toLowerCase()
    const isVademecumCommand =
      lowerRawText.startsWith('/vademecum') ||
      lowerRawText.startsWith('/start') ||
      lowerRawText.startsWith('/guida') ||
      lowerRawText.startsWith('/help') ||
      lowerRawText.startsWith('/aiuto')

    if (isVademecumCommand) {
      const vademecumText =
        `📖 <b>Vademecum Ufficiale — Community Aiutiamoci</b> 🚀\n\n` +
        `Ecco come sfruttare al meglio questo spazio:\n\n` +
        `👥 <b>1. Discussione tra Umani:</b>\n` +
        `• Il gruppo è una chat viva per scambiarsi pareri, prompt, idee e casi pratici di business.\n\n` +
        `🤖 <b>2. Il Tutor AI al tuo servizio:</b>\n` +
        `• Tagga <code>@Corsi_Masterclass_bot</code> per ricevere aiuto su prompt, strumenti AI ed esercizi.\n` +
        `• Puoi scrivergli anche in privato per domande individuali riservate.\n\n` +
        `⚡ <b>3. Comandi Rapidi:</b>\n` +
        `• <code>/orari</code> ➔ Orari e link della Masterclass giovedì ore 18:30.\n` +
        `• <code>/docenti</code> ➔ Contatto diretto con <b>Marco</b>, <b>Lorenzo</b> o <b>Stefano</b>.\n\n` +
        `🌐 <b>Piattaforma:</b> <b>https://aiutiamoci.cloud</b>`

      await sendTutorMessage(chatId, vademecumText, undefined, message.message_id)
      return NextResponse.json({ ok: true })
    }

    // Trigger Automatico Proattivo: Assistenza Codice ID / Accesso Piattaforma (risponde anche senza tag!)
    const isLoginHelpNeeded =
      lowerRawText.includes('password') ||
      lowerRawText.includes('psw') ||
      lowerRawText.includes('pwd') ||
      lowerRawText.includes('codice id') ||
      lowerRawText.includes('mio id') ||
      lowerRawText.includes('perso il codice') ||
      lowerRawText.includes('perso l\'id') ||
      lowerRawText.includes('perso lid') ||
      lowerRawText.includes('non ricordo il codice') ||
      lowerRawText.includes('non riesco ad accedere') ||
      lowerRawText.includes('non riesco a entrare') ||
      lowerRawText.includes('non entra') ||
      lowerRawText.includes('recuperare il codice')

    if (isLoginHelpNeeded) {
      const loginKeyboard = {
        inline_keyboard: [
          [
            { text: '👤 Chiedi a Marco', callback_data: 'contact:marco' },
            { text: '👤 Chiedi a Lorenzo', callback_data: 'contact:lorenzo' },
            { text: '👤 Chiedi a Stefano', callback_data: 'contact:stefano' },
          ],
        ],
      }

      const loginHelpMessage =
        `🔑 <b>Hai bisogno del tuo Codice ID per la Piattaforma?</b>\n\n` +
        `• Per accedere a <b>https://aiutiamoci.cloud</b> non serve una password, ma il tuo <b>Codice ID Studente</b> personale (es. <code>AI-START-...</code>).\n` +
        `• Controlla l'email di conferma iscrizione ricevuta dal team di Aiutiamoci.\n\n` +
        `<i>Non riesci a trovarlo? Tocca qui sotto per fartelo rimandare subito in privato:</i>`

      await sendTutorMessage(chatId, loginHelpMessage, loginKeyboard, message.message_id)
      return NextResponse.json({ ok: true })
    }

    // In un gruppo, per tutti gli altri argomenti rispondiamo SOLO se il bot viene menzionato o se è un comando
    const isMentioned =
      text.includes('@Corsi_Masterclass_bot') ||
      message.reply_to_message?.from?.username === 'Corsi_Masterclass_bot' ||
      text.startsWith('/')

    // Se è un gruppo e non siamo menzionati, lasciamo parlare gli studenti tra loro in pace
    if (isGroup && !isMentioned) {
      return NextResponse.json({ ok: true })
    }

    // Puliamo il testo dal tag del bot
    const cleanText = text.replace(/@Corsi_Masterclass_bot/g, '').trim()
    const lowerText = cleanText.toLowerCase()

    // 2b. Gestione Richiesta Personale / Umana -> Routing a Marco, Lorenzo, Stefano
    const isPersonalRequest =
      lowerText.includes('parlare con') ||
      lowerText.includes('contattare') ||
      lowerText.includes('privato') ||
      lowerText.includes('docente') ||
      lowerText.includes('insegnante') ||
      lowerText.includes('marco') ||
      lowerText.includes('lorenzo') ||
      lowerText.includes('stefano') ||
      lowerText.includes('segreteria') ||
      lowerText.includes('amministrazione') ||
      lowerText.includes('pagamento') ||
      lowerText.includes('fattura') ||
      lowerText.includes('assenza') ||
      lowerText.includes('problema con') ||
      lowerText === '/docenti' ||
      lowerText === '/contatto'

    if (isPersonalRequest) {
      const routingKeyboard = {
        inline_keyboard: [
          [
            { text: '👤 Marco', callback_data: 'contact:marco' },
            { text: '👤 Lorenzo', callback_data: 'contact:lorenzo' },
            { text: '👤 Stefano', callback_data: 'contact:stefano' },
          ],
        ],
      }

      await sendTutorMessage(
        chatId,
        `Per questioni personali, riservate o amministrative ti metto subito in contatto con il nostro team.\n\n<b>Con chi preferisci parlare?</b>`,
        routingKeyboard,
        message.message_id
      )
      return NextResponse.json({ ok: true })
    }

    // 2c. Gestione Orari, Date Lezioni e Calendario
    const isCalendarQuery =
      lowerText.includes('orari') ||
      lowerText.includes('orario') ||
      lowerText.includes('quando c') ||
      lowerText.includes('prossima lezione') ||
      lowerText.includes('prossima call') ||
      lowerText.includes('masterclass') ||
      lowerText.includes('giovedi') ||
      lowerText.includes('giovedì') ||
      lowerText.includes('link meet') ||
      lowerText === '/orari'

    if (isCalendarQuery) {
      let nextEventText = ''

      // Tentiamo recupero dinamico da Supabase se configurato
      if (supabase) {
        try {
          const { data: events } = await supabase
            .from('calendar_events')
            .select('title, start_time, end_time, meet_link')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(1)

          if (events && events.length > 0) {
            const ev = events[0]
            const d = new Date(ev.start_time)
            const dateStr = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
            const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            nextEventText = `\n📅 <b>Prossimo appuntamento a calendario:</b>\n• <b>${escapeHtml(ev.title)}</b>\n• ${dateStr} alle ore <b>${timeStr}</b>\n`
          }
        } catch (e) {
          console.error('[TutorBot calendar error]:', e)
        }
      }

      const responseCalendar =
        `🎓 <b>Orari e Dirette Masterclass Aiutiamoci:</b>\n` +
        (nextEventText || `• Le Masterclass si tengono regolarmente <b>ogni giovedì alle 18:30</b>.\n`) +
        `\n🔗 <b>Stanza Ufficiale Google Meet:</b>\n` +
        `<code>https://meet.google.com/wsv-bqxm-bvr</code>\n\n` +
        `Puoi accedere con un click anche dalla piattaforma su:\n` +
        `👉 <b>https://aiutiamoci.cloud/videocall</b>`

      await sendTutorMessage(chatId, responseCalendar, undefined, message.message_id)
      return NextResponse.json({ ok: true })
    }

    // 2d. Regola "Anti-Carbonara" & Off-Topic
    const isOffTopic =
      lowerText.includes('carbonara') ||
      lowerText.includes('ricetta') ||
      lowerText.includes('amatriciana') ||
      lowerText.includes('pasta') ||
      lowerText.includes('meteo domani') ||
      lowerText.includes('oroscopo') ||
      lowerText.includes('calcio') ||
      lowerText.includes('serie a')

    if (isOffTopic) {
      await sendTutorMessage(
        chatId,
        `Sono il Tutor Didattico ufficiale di <b>Aiutiamoci</b> e sono programmato per supportarvi sul Corso, sulle lezioni e sull'adozione dell'AI nel lavoro e nel business.\n\n` +
        `Per la carbonara rigorosamente guanciale e pecorino 😉, ma qui concentriamoci sui nostri moduli! Come posso aiutarti con le lezioni o gli strumenti AI di oggi?`,
        undefined,
        message.message_id
      )
      return NextResponse.json({ ok: true })
    }

    // 2e. Risposta Didattica Generale AI (Gemini Flash con Grounding)
    if (!genAI) {
      await sendTutorMessage(
        chatId,
        `Ciao ${escapeHtml(studentName)}! Come posso aiutarti con il corso o con l'uso dell'Intelligenza Artificiale per il tuo lavoro? Scrivimi pure la tua domanda!`,
        undefined,
        message.message_id
      )
      return NextResponse.json({ ok: true })
    }

    const systemPrompt = `Sei il Tutor Didattico e Assistente AI ufficiale di "Aiutiamoci" (aiutiamoci.cloud).
La piattaforma e l'Academy sono fondate da Marco, Lorenzo e Stefano per supportare professionisti, PMI e corsisti nell'adozione pratica dell'Intelligenza Artificiale (ChatGPT, Claude, DeepSeek, automazioni n8n, prompt engineering).

ISTRUZIONI:
1. Tono professionale, cordiale, incoraggiante, chiaro e concreto.
2. Rispondi con spiegazioni pratiche, bullet point sintetici e zero fuffa teorica.
3. Se l'utente chiede chiarimenti didattici o aiuto su un prompt, spiegaglielo passo dopo passo.
4. Se una domanda richiede l'intervento personale dei fondatori, suggeriscigli di digitare /docenti o chiedere di parlare con Marco, Lorenzo o Stefano.
5. Mantieni la risposta sintetica (massimo 150-200 parole) adatta a una chat Telegram.
6. Rispondi in italiano con formattazione HTML compatibile con Telegram (usa <b> per grassetto, <code> per codice o prompt).`

    const prompt = `${systemPrompt}\n\nDomanda dello studente (${studentName}):\n${cleanText}`

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const reply = response.text()?.trim() || 'Non sono riuscito a elaborare la risposta, riprova tra poco!'
      await sendTutorMessage(chatId, reply, undefined, message.message_id)
    } catch (aiErr: any) {
      console.error('[TutorBot Gemini error]:', aiErr)
      await sendTutorMessage(
        chatId,
        `Sto elaborando molte richieste contemporaneamente! Riprova tra pochi istanti oppure digita /orari per le info sulle lezioni.`,
        undefined,
        message.message_id
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[TutorBot webhook unhandled error]:', error)
    return NextResponse.json({ ok: true })
  }
}
