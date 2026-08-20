'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendSharedEmail } from '@/app/(dashboard)/posta/actions'

export type CourseAccessTier = 'ai-start' | 'ai-pro' | 'both'

export async function enrollStudentAction(formData: {
  studentName: string
  studentEmail: string
  courseTitle?: string
  accessTier?: CourseAccessTier
  source: 'landing' | 'dashboard'
}) {
  try {
    const supabaseAdmin = createAdminClient()
    const tier: CourseAccessTier = formData.accessTier || 'ai-start'
    
    // Genera codice con prefisso semantico
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    const prefix = tier === 'ai-pro' ? 'AI-PRO' : tier === 'both' ? 'AI-ALL' : 'AI-START'
    const generatedCode = `${prefix}-${randomHex}`

    const defaultTitle = tier === 'ai-pro'
      ? 'AI Pro - Automazioni & Agenti AI'
      : tier === 'both'
      ? 'Bundle Completo: AI Start + AI Pro'
      : 'AI Start - Domina l’Intelligenza Artificiale da Zero'
    
    const finalCourseTitle = formData.courseTitle || defaultTitle

    // 1. Inserimento student_codes tramite admin client (supera RLS)
    const { error: codeError } = await (supabaseAdmin as any).from('student_codes').insert({
      code: generatedCode,
      student_name: formData.studentName.trim(),
      student_email: formData.studentEmail.trim(),
      course_title: finalCourseTitle,
      access_tier: tier,
      is_active: true,
    })

    if (codeError) {
      console.error('Errore inserimento student_codes:', codeError)
      return { success: false, error: codeError.message }
    }

    // 2. Inserimento del task di benvenuto tramite admin client (supera RLS)
    const taskTitle = formData.source === 'landing'
      ? `Nuova Iscrizione Landing: ${formData.studentName.trim()}`
      : `Accoglienza Studente: ${formData.studentName.trim()} (${generatedCode})`
      
    const taskDesc = formData.source === 'landing'
      ? `Studente iscritto da aiutiamoci.cloud. Codice assegnato: ${generatedCode}. Livello: ${tier.toUpperCase()}`
      : `Iscrizione al percorso "${finalCourseTitle}". Codice univoco assegnato: ${generatedCode}.`

    const { error: taskError } = await (supabaseAdmin as any).from('tasks').insert({
      title: taskTitle,
      description: taskDesc,
      status: 'todo',
      priority: 'high',
    })

    if (taskError) {
      console.warn('Errore non bloccante inserimento task:', taskError)
    }

    // 3. Invio email di benvenuto
    const tierDesc = tier === 'ai-pro'
      ? 'Corso Avanzato "AI Pro: Automazioni & Agenti AI"'
      : tier === 'both'
      ? 'Percorso Completo "AI Start" + "AI Pro"'
      : 'Corso Base "AI Start: Domina l’IA da Zero"'

    const emailSubject = `Il tuo Codice di Accesso a ${tier === 'both' ? 'AI Start & AI Pro' : tier === 'ai-pro' ? 'AI Pro' : 'AI Start'}: ${generatedCode}`

    const emailBody = `Gentile ${formData.studentName.trim()},\n\nti confermiamo l'avvenuta attivazione del tuo accesso a:\n👉 ${tierDesc}\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO:\n🔑 CODICE: ${generatedCode}\n\nAccedi subito inserendo il codice nell'Area Studenti su aiutiamoci.cloud.\n\nCordiali saluti,\nTeam Ti AIuto (aiutiamoci.cloud)`

    await sendSharedEmail({
      to: formData.studentEmail.trim(),
      subject: emailSubject,
      body: emailBody,
    })

    return { success: true, code: generatedCode, accessTier: tier }
  } catch (error: any) {
    console.error('Errore generico enrollStudentAction:', error)
    return { success: false, error: error.message || 'Errore interno del server' }
  }
}

export async function bulkEnrollStudentsAction(
  students: Array<{ name: string; email: string }>,
  sendWelcomeEmail: boolean = false,
  accessTier: CourseAccessTier = 'ai-start'
) {
  try {
    const supabaseAdmin = createAdminClient()
    const results: Array<{ name: string; email: string; code: string; tier: string }> = []
    const insertRows = []

    const prefix = accessTier === 'ai-pro' ? 'AI-PRO' : accessTier === 'both' ? 'AI-ALL' : 'AI-START'
    const defaultTitle = accessTier === 'ai-pro'
      ? 'AI Pro - Automazioni & Agenti AI'
      : accessTier === 'both'
      ? 'Bundle Completo: AI Start + AI Pro'
      : 'AI Start - Domina l’Intelligenza Artificiale da Zero'

    for (const student of students) {
      if (!student.email || !student.name) continue
      const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
      const code = `${prefix}-${randomHex}`

      insertRows.push({
        code,
        student_name: student.name.trim(),
        student_email: student.email.trim(),
        course_title: defaultTitle,
        access_tier: accessTier,
        is_active: true,
      })

      results.push({
        name: student.name.trim(),
        email: student.email.trim(),
        code,
        tier: accessTier,
      })
    }

    if (insertRows.length === 0) {
      return { success: false, error: 'Nessun dato valido da inserire.' }
    }

    const { error } = await (supabaseAdmin as any).from('student_codes').insert(insertRows)
    if (error) {
      return { success: false, error: error.message }
    }

    if (sendWelcomeEmail) {
      for (const res of results) {
        try {
          const tierDesc = accessTier === 'ai-pro'
            ? 'Corso Avanzato "AI Pro: Automazioni & Agenti AI"'
            : accessTier === 'both'
            ? 'Percorso Completo "AI Start" + "AI Pro"'
            : 'Corso Base "AI Start: Domina l’IA da Zero"'

          await sendSharedEmail({
            to: res.email,
            subject: `Il tuo Codice di Accesso: ${res.code}`,
            body: `Gentile ${res.name},\n\nti confermiamo l'attivazione dell'accesso a: ${tierDesc}.\n\n👉 CODICE UNIVOCO: ${res.code}\n\nAccedi inserendolo nell'Area Studenti su aiutiamoci.cloud.\n\nCordiali saluti,\nTeam Ti AIuto`,
          })
        } catch (e) {
          console.warn(`Errore invio email massiva a ${res.email}:`, e)
        }
      }
    }

    return { success: true, count: results.length, students: results }
  } catch (error: any) {
    return { success: false, error: error.message || 'Errore importazione massiva' }
  }
}

export async function joinWaitlistAction(email: string, name?: string) {
  try {
    const supabaseAdmin = createAdminClient()
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = (name || cleanEmail.split('@')[0]).trim()

    // 1. Inserimento nella tabella waitlist_leads
    const { error: insertError } = await (supabaseAdmin as any).from('waitlist_leads').insert({
      email: cleanEmail,
      name: cleanName,
      course_interest: 'AI Pro - Automazioni & Agenti',
      converted_to_student: false,
    })

    if (insertError) {
      console.error('Errore inserimento waitlist_leads:', insertError)
    }

    // 2. Creazione del task automatico per il team
    await (supabaseAdmin as any).from('tasks').insert({
      title: `Nuovo Lead in Lista d'Attesa: ${cleanEmail}`,
      description: `L'utente ${cleanName} (${cleanEmail}) si è iscritto alla lista d'attesa del corso "AI Pro: Automazioni & Agenti" dalla landing page.`,
      status: 'todo',
      priority: 'medium',
    })

    // 3. Invio email di conferma all'utente
    await sendSharedEmail({
      to: cleanEmail,
      subject: `Iscrizione Confermata: Lista d'Attesa AI Pro (Automazioni & Agenti)`,
      body: `Gentile ${cleanName},\n\nti confermiamo che sei stato inserito con priorità nella lista d'attesa del Corso Avanzato "AI Pro: Automazioni & Agenti".\n\nNon appena apriremo i posti ufficiali, riceverai una notifica esclusiva con coupon promozionale riservato.\n\nCordiali saluti,\nTeam Ti AIuto (aiutiamoci.cloud)`,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Errore joinWaitlistAction:', error)
    return { success: false, error: error.message || 'Errore iscrizione lista d\'attesa' }
  }
}

export async function getWaitlistLeadsAction() {
  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await (supabaseAdmin as any)
      .from('waitlist_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, leads: [] }
    }

    return { success: true, leads: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message, leads: [] }
  }
}

export async function convertWaitlistLeadAction(leadId: string, email: string, name?: string) {
  try {
    const supabaseAdmin = createAdminClient()
    
    // 1. Iscrivi lo studente a AI Pro
    const enrollRes = await enrollStudentAction({
      studentName: name || email.split('@')[0],
      studentEmail: email,
      courseTitle: 'AI Pro - Automazioni & Agenti AI',
      accessTier: 'ai-pro',
      source: 'dashboard',
    })

    if (!enrollRes.success) {
      return { success: false, error: enrollRes.error }
    }

    // 2. Segna come convertito nella tabella waitlist_leads
    await (supabaseAdmin as any)
      .from('waitlist_leads')
      .update({ converted_to_student: true })
      .eq('id', leadId)

    return { success: true, code: enrollRes.code }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

