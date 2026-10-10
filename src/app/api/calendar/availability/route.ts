import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Orari lavorativi standard disponibili per meeting di live chat / demo
const DEFAULT_BUSINESS_HOURS = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '14:00', '14:45', '15:30', '16:15', '17:00', '17:45'
]

// CORS Headers per permettere la chiamata sia da mark2.cloud che da localhost
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

/**
 * GET /api/calendar/availability?date=YYYY-MM-DD
 * Restituisce gli slot disponibili per la data richiesta escludendo quelli già occupati in calendar_events.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: 'Parametro date obbligatorio nel formato YYYY-MM-DD' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const targetDate = new Date(`${dateStr}T00:00:00Z`)
    const dayOfWeek = targetDate.getUTCDay()

    // Escludi weekend (0 = Domenica, 6 = Sabato)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        {
          date: dateStr,
          isWeekend: true,
          slots: [],
          message: 'Fine settimana: il servizio live chat è attivo da Lunedì a Venerdì.',
        },
        { headers: CORS_HEADERS }
      )
    }

    const supabaseAdmin = createAdminClient()

    // 1. Cerca eventi già fissati per questa data
    const { data: existingEvents, error: dbError } = await supabaseAdmin
      .from('calendar_events')
      .select('event_time, title')
      .eq('event_date', dateStr)

    if (dbError) {
      console.error('Errore query calendar_events:', dbError.message)
    }

    const bookedTimes = new Set<string>()
    if (existingEvents) {
      existingEvents.forEach(ev => {
        if (ev.event_time) {
          bookedTimes.add(ev.event_time.trim())
        }
      })
    }

    // 2. Filtra gli slot disponibili
    const availableSlots = DEFAULT_BUSINESS_HOURS.map(time => ({
      time,
      available: !bookedTimes.has(time),
    }))

    return NextResponse.json(
      {
        date: dateStr,
        isWeekend: false,
        allSlots: DEFAULT_BUSINESS_HOURS,
        availableSlots: availableSlots.filter(s => s.available).map(s => s.time),
        slots: availableSlots,
      },
      { headers: CORS_HEADERS }
    )
  } catch (err: any) {
    console.error('Errore availability calendar:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

/**
 * POST /api/calendar/book
 * Prenota un appuntamento inserendolo direttamente in calendar_events su Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone = '',
      company = '',
      date,
      time,
      notes = '',
    } = body

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: 'I campi Nome, Email, Data e Orario sono obbligatori.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const supabaseAdmin = createAdminClient()

    // 1. Controllo preventivo anti-conflitto / accavallamento
    const { data: conflict } = await supabaseAdmin
      .from('calendar_events')
      .select('id, title')
      .eq('event_date', date)
      .eq('event_time', time)
      .maybeSingle()

    if (conflict) {
      return NextResponse.json(
        {
          error: 'Lo slot selezionato è già stato prenotato da un altro utente. Scegli un altro orario.',
          conflict: true,
        },
        { status: 409, headers: CORS_HEADERS }
      )
    }

    // 2. Genera Meet URL dedicato
    const meetId = `mark2-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`
    const meetUrl = `https://meet.google.com/${meetId}`

    const description = `Live Chat / Demo richiesta da ${name.trim()} (${company ? company.trim() : 'PMI/Professionista'}).\n` +
      `Email: ${email.trim()} | Tel: ${phone || 'N/D'}\n` +
      `Note: ${notes || 'Richiesta dal sito mark2.cloud'}\n` +
      `[MEET: ${meetUrl}]`

    // 3. Inserimento in calendar_events
    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('calendar_events')
      .insert({
        title: `Live Chat: ${name.trim()} (${company || 'Lead Impresa'})`,
        description,
        event_date: date,
        event_time: time,
        category: 'meeting',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Errore inserimento calendar_events:', insertError.message)
      return NextResponse.json(
        { error: `Errore salvataggio calendario: ${insertError.message}` },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json(
      {
        success: true,
        eventId: newEvent?.id,
        meetUrl,
        date,
        time,
        message: 'Appuntamento fissato con successo nel calendario del team.',
      },
      { headers: CORS_HEADERS }
    )
  } catch (err: any) {
    console.error('Errore booking calendar:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
