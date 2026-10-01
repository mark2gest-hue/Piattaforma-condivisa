import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSharedEmail } from '@/app/(dashboard)/posta/actions'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const secretApiKey = process.env.AUTO_ENROLL_API_KEY || 'aiutiamoci_atoma_secret_2026'

    if (authHeader !== `Bearer ${secretApiKey}`) {
      return NextResponse.json(
        { error: 'Non autorizzato. API Key non valida.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, tier = 'ai-start', orderId } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Parametri mancanti: name ed email sono obbligatori.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const supabaseAdmin = createAdminClient()

    // 1. Controlla se lo studente è già registrato con questa email per evitare doppioni
    const { data: existingStudent } = await supabaseAdmin
      .from('student_codes')
      .select('id, code, access_tier')
      .ilike('student_email', cleanEmail)
      .maybeSingle()

    if (existingStudent) {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: `Studente ${cleanName} già iscritto con codice esistente.`,
        code: existingStudent.code,
        tier: existingStudent.access_tier,
      })
    }

    // 2. Genera codice univoco (AI-START-XXXX o AI-PRO-XXXX)
    const prefix = tier === 'ai-pro' ? 'AI-PRO' : tier === 'both' ? 'AI-ALL' : 'AI-START'
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    const generatedCode = `${prefix}-${randomHex}`

    const courseTitle = tier === 'ai-pro'
      ? 'AI Pro - Automazioni & Agenti AI'
      : tier === 'both'
        ? 'Bundle Completo: AI Start + AI Pro'
        : 'AI Start - Domina l’Intelligenza Artificiale da Zero'

    // 3. Salva su Supabase (student_codes)
    const { error: insertErr } = await supabaseAdmin
      .from('student_codes')
      .insert({
        code: generatedCode,
        student_name: cleanName,
        student_email: cleanEmail,
        course_title: courseTitle,
        access_tier: tier,
        is_active: true,
      })

    if (insertErr) {
      console.error('[Auto-Enroll Error]:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // 3.1 Se l'utente era già in attesa nella tabella delle registrazioni (course_registrations), aggiorna lo stato in "Approvato"
    const nowIso = new Date().toISOString()
    await supabaseAdmin
      .from('course_registrations')
      .update({
        status: 'approved',
        approved: true,
        approved_at: nowIso,
        access_code: generatedCode,
        updated_at: nowIso,
      })
      .ilike('email', cleanEmail)

    // 4. Invia email di benvenuto formattata con Resend
    const tierDesc = tier === 'ai-pro'
      ? 'Masterclass Avanzata "AI Pro: Automazioni & Agenti AI"'
      : tier === 'both'
        ? 'Percorso Completo "AI Start" + "AI Pro"'
        : 'Masterclass Base "AI Start: Domina l’IA da Zero"'

    const emailSubject = `Il tuo Codice di Accesso ad AI Start: ${generatedCode}`
    const emailBody = `Gentile ${cleanName},\n\nti confermiamo l'avvenuta ricezione del tuo ordine${orderId ? ` (#${orderId})` : ''} e l'attivazione immediata del tuo account per:\n👉 ${tierDesc}\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO:\n🔑 ${generatedCode}\n\nPer iniziare subito:\n1. Vai su: https://aiutiamoci.cloud/corsi\n2. Clicca su "Accedi con Codice Studente"\n3. Inserisci il codice sopra per sbloccare tutte le 20 video-lezioni, il tutor @AI e l'esame finale con Certificato EQF.\n\nPer qualsiasi supporto, rispondiamo direttamente a questa email o nel gruppo Telegram dedicato.\n\nBuono studio e benvenuto a bordo!\nTeam aiutiamoci.cloud`

    await sendSharedEmail({
      to: cleanEmail,
      subject: emailSubject,
      body: emailBody,
    })

    return NextResponse.json({
      success: true,
      code: generatedCode,
      name: cleanName,
      email: cleanEmail,
      tier,
    })
  } catch (err: any) {
    console.error('[Auto-Enroll Fatal Error]:', err)
    return NextResponse.json({ error: err.message || 'Errore interno' }, { status: 500 })
  }
}
