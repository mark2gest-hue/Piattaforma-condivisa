'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CorporateCohort {
  id: string
  company_name: string
  company_code_prefix: string
  logo_url?: string | null
  base_track: 'ai-start' | 'ai-pro' | 'both' | 'custom_only'
  allowed_standard_modules: number[]
  custom_welcome_message?: string | null
  contact_person_name?: string | null
  contact_person_email?: string | null
  is_active: boolean
  created_at?: string
  student_count?: number
  custom_lesson_count?: number
}

export interface CorporateCustomLesson {
  id: string
  cohort_id: string
  title: string
  instructor_name: string
  video_url: string
  duration: string
  description?: string | null
  resources_pdf_url?: string | null
  dedicated_prompts?: Array<{ title: string; prompt: string; notes?: string }>
  order_index: number
  is_active: boolean
  created_at?: string
}

async function requireAuthAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Accesso non autorizzato: operazione riservata agli amministratori.')
  }
  return user
}

/**
 * Recupera tutte le aziende / cohort con conteggio iscritti e lezioni custom
 */
export async function getCorporateCohortsAction(): Promise<{
  success: boolean
  data?: CorporateCohort[]
  error?: string
}> {
  try {
    await requireAuthAdmin()
    const supabaseAdmin = createAdminClient()

    const { data: cohorts, error } = await (supabaseAdmin
      .from('corporate_cohorts') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore getCorporateCohortsAction:', error)
      return { success: false, error: error.message }
    }

    // Recupera conteggio studenti associati
    const { data: students } = await supabaseAdmin
      .from('student_codes')
      .select('cohort_id')

    // Recupera conteggio lezioni custom
    const { data: lessons } = await supabaseAdmin
      .from('corporate_custom_lessons')
      .select('cohort_id')

    const studentCounts: Record<string, number> = {}
    students?.forEach((s: any) => {
      if (s.cohort_id) {
        studentCounts[s.cohort_id] = (studentCounts[s.cohort_id] || 0) + 1
      }
    })

    const lessonCounts: Record<string, number> = {}
    lessons?.forEach((l: any) => {
      if (l.cohort_id) {
        lessonCounts[l.cohort_id] = (lessonCounts[l.cohort_id] || 0) + 1
      }
    })

    const enriched = (cohorts || []).map((c: any) => ({
      ...c,
      student_count: studentCounts[c.id] || 0,
      custom_lesson_count: lessonCounts[c.id] || 0,
      allowed_standard_modules: Array.isArray(c.allowed_standard_modules) ? c.allowed_standard_modules : [],
    }))

    return { success: true, data: enriched }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Crea una nuova Stanza Aziendale B2B
 */
export async function createCorporateCohortAction(formData: {
  companyName: string
  codePrefix: string
  baseTrack: 'ai-start' | 'ai-pro' | 'both' | 'custom_only'
  customWelcomeMessage?: string
  contactPersonName?: string
  contactPersonEmail?: string
  allowedStandardModules?: number[]
}): Promise<{ success: boolean; data?: CorporateCohort; error?: string }> {
  try {
    await requireAuthAdmin()
    const supabaseAdmin = createAdminClient()

    const cleanPrefix = formData.codePrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!cleanPrefix || cleanPrefix.length < 2) {
      return { success: false, error: 'Il prefisso codice azienda deve contenere almeno 2 caratteri alfanumerici (es. ROSSI, ACME).' }
    }

    const { data, error } = await (supabaseAdmin
      .from('corporate_cohorts') as any)
      .insert({
        company_name: formData.companyName.trim(),
        company_code_prefix: cleanPrefix,
        base_track: formData.baseTrack,
        custom_welcome_message: formData.customWelcomeMessage?.trim() || null,
        contact_person_name: formData.contactPersonName?.trim() || null,
        contact_person_email: formData.contactPersonEmail?.trim() || null,
        allowed_standard_modules: formData.allowedStandardModules || [],
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Il prefisso codice "${cleanPrefix}" è già utilizzato da un'altra azienda.` }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/corsi')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Genera un blocco di codici di accesso riservati per i dipendenti dell'azienda
 */
export async function generateCorporateStudentCodesAction(formData: {
  cohortId: string
  companyPrefix: string
  companyName: string
  quantity: number
  tier: 'ai-start' | 'ai-pro' | 'both'
}): Promise<{ success: boolean; generatedCodes?: string[]; error?: string }> {
  try {
    await requireAuthAdmin()
    const supabaseAdmin = createAdminClient()

    const qty = Math.min(Math.max(1, formData.quantity), 100)
    const codesToInsert = []
    const generatedCodes: string[] = []

    for (let i = 1; i <= qty; i++) {
      const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
      const code = `AI-${formData.companyPrefix}-${randomHex}`
      generatedCodes.push(code)

      codesToInsert.push({
        code,
        student_name: `Dipendente ${formData.companyName} #${i}`,
        student_email: `b2b-${formData.companyPrefix.toLowerCase()}-${i}@aziendale.local`,
        course_title: `Corso AI Aziendale: ${formData.companyName}`,
        access_tier: formData.tier,
        cohort_id: formData.cohortId,
        is_active: true,
      })
    }

    const { error } = await (supabaseAdmin.from('student_codes') as any).insert(codesToInsert)
    if (error) {
      console.error('Errore generazione codici corporate:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/corsi')
    return { success: true, generatedCodes }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Aggiunge o aggiorna una lezione/video personalizzato per una Stanza Aziendale
 */
export async function saveCorporateCustomLessonAction(formData: {
  id?: string
  cohortId: string
  title: string
  instructorName?: string
  videoUrl: string
  duration?: string
  description?: string
  resourcesPdfUrl?: string
  dedicatedPrompts?: Array<{ title: string; prompt: string; notes?: string }>
  orderIndex?: number
}): Promise<{ success: boolean; data?: CorporateCustomLesson; error?: string }> {
  try {
    await requireAuthAdmin()
    const supabaseAdmin = createAdminClient()

    const payload = {
      cohort_id: formData.cohortId,
      title: formData.title.trim(),
      instructor_name: formData.instructorName?.trim() || 'Team Aiutiamoci',
      video_url: formData.videoUrl.trim(),
      duration: formData.duration?.trim() || '15:00',
      description: formData.description?.trim() || null,
      resources_pdf_url: formData.resourcesPdfUrl?.trim() || null,
      dedicated_prompts: formData.dedicatedPrompts || [],
      order_index: formData.orderIndex || 1,
      is_active: true,
    }

    let result
    if (formData.id) {
      result = await (supabaseAdmin
        .from('corporate_custom_lessons') as any)
        .update(payload)
        .eq('id', formData.id)
        .select()
        .single()
    } else {
      result = await (supabaseAdmin
        .from('corporate_custom_lessons') as any)
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Errore saveCorporateCustomLessonAction:', result.error)
      return { success: false, error: result.error.message }
    }

    revalidatePath('/corsi')
    return { success: true, data: result.data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Elimina una lezione personalizzata
 */
export async function deleteCorporateCustomLessonAction(lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuthAdmin()
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
      .from('corporate_custom_lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/corsi')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Recupera le informazioni della Stanza Privata e le lezioni custom per il corsista loggato
 */
export async function getCorporateDetailsForStudentAction(cohortId: string): Promise<{
  success: boolean
  cohort?: CorporateCohort
  customLessons?: CorporateCustomLesson[]
  error?: string
}> {
  try {
    const supabaseAdmin = createAdminClient()

    // Recupera la cohort
    const { data: cohort, error: cohortError } = await (supabaseAdmin
      .from('corporate_cohorts') as any)
      .select('*')
      .eq('id', cohortId)
      .eq('is_active', true)
      .maybeSingle()

    if (cohortError || !cohort) {
      return { success: false, error: 'Azienda non trovata o non attiva.' }
    }

    // Recupera le lezioni custom
    const { data: lessons, error: lessonsError } = await (supabaseAdmin
      .from('corporate_custom_lessons') as any)
      .select('*')
      .eq('cohort_id', cohortId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (lessonsError) {
      return { success: false, error: lessonsError.message }
    }

    return {
      success: true,
      cohort: {
        ...cohort,
        allowed_standard_modules: Array.isArray(cohort.allowed_standard_modules) ? cohort.allowed_standard_modules : [],
      },
      customLessons: lessons || [],
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
