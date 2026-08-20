'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { sendSharedEmail } from '@/app/(dashboard)/posta/actions'

export async function enrollStudentAction(formData: {
  studentName: string
  studentEmail: string
  courseTitle: string
  source: 'landing' | 'dashboard'
}) {
  try {
    const supabaseAdmin = createAdminClient()
    
    // Genera codice unico
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    const generatedCode = `AI-START-${randomHex}`

    // 1. Inserimento student_codes tramite admin client (supera RLS)
    const { error: codeError } = await (supabaseAdmin as any).from('student_codes').insert({
      code: generatedCode,
      student_name: formData.studentName.trim(),
      student_email: formData.studentEmail.trim(),
      course_title: formData.courseTitle,
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
      ? `Studente iscritto da aiutiamoci.cloud. Codice assegnato: ${generatedCode}. Email: ${formData.studentEmail.trim()}`
      : `Iscrizione al corso "${formData.courseTitle}". Codice univoco assegnato: ${generatedCode}.`

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
    const emailSubject = formData.source === 'landing'
      ? `Benvenuto in AI Start! Il tuo Codice di Accesso: ${generatedCode}`
      : `Il tuo Codice di Accesso al Corso AI Start: ${generatedCode}`

    const emailBody = formData.source === 'landing'
      ? `Gentile ${formData.studentName.trim()},\n\ngrazie per esserti iscritto a "${formData.courseTitle}"!\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO per accedere alle 20 lezioni video ed alla Chat con l'assistente @AI:\n👉 CODICE: ${generatedCode}\n\nAccedi alla piattaforma inserendo questo codice nell'Area Studenti.\n\nCordiali saluti,\nTeam Ti AIuto (aiutiamoci.cloud)`
      : `Gentile ${formData.studentName.trim()},\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO per accedere alle 20 lezioni video ed al supporto @AI:\n👉 CODICE: ${generatedCode}\n\nAccedi inserendolo nell'Area Studenti di aiutiamoci.cloud.\n\nCordiali saluti,\nTeam Ti AIuto`

    await sendSharedEmail({
      to: formData.studentEmail.trim(),
      subject: emailSubject,
      body: emailBody,
    })

    return { success: true, code: generatedCode }
  } catch (error: any) {
    console.error('Errore generico enrollStudentAction:', error)
    return { success: false, error: error.message || 'Errore interno del server' }
  }
}

export async function bulkEnrollStudentsAction(
  students: Array<{ name: string; email: string }>,
  sendWelcomeEmail: boolean = false
) {
  try {
    const supabaseAdmin = createAdminClient()
    const results: Array<{ name: string; email: string; code: string }> = []
    const insertRows = []

    for (const student of students) {
      if (!student.email || !student.name) continue
      const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
      const code = `AI-START-${randomHex}`

      insertRows.push({
        code,
        student_name: student.name.trim(),
        student_email: student.email.trim(),
        course_title: 'AI Start - Domina l’Intelligenza Artificiale da Zero',
        is_active: true,
      })

      results.push({
        name: student.name.trim(),
        email: student.email.trim(),
        code,
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
          await sendSharedEmail({
            to: res.email,
            subject: `Il tuo Codice di Accesso ad AI Start: ${res.code}`,
            body: `Gentile ${res.name},\n\nEcco il tuo CODICE DI ACCESSO UNIVOCO per le 20 lezioni video del percorso AI Start:\n👉 CODICE: ${res.code}\n\nAccedi all'Area Studenti su aiutiamoci.cloud inserendo il tuo codice.\n\nCordiali saluti,\nTeam Ti AIuto`,
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

