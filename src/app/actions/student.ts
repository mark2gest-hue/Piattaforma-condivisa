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
