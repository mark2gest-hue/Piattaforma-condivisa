'use server'

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendSharedEmail } from '@/app/(dashboard)/posta/actions'
import { getAllPushSubscriptions, sendWebPushNotification } from '@/lib/web-push'

export type SupportCategory = 'tecnico' | 'didattica' | 'commerciale'
export type SupportTicketStatus = 'open' | 'pending' | 'resolved'

export interface SupportMessageItem {
  id: string
  ticket_id: string
  sender_type: 'student' | 'staff' | 'system'
  sender_id: string
  sender_name: string
  content: string
  attachments?: any[]
  created_at: string
}

export interface SupportTicketItem {
  id: string
  requester_type: 'student' | 'b2b'
  student_id: string
  student_code: string
  requester_name: string
  requester_email: string
  company_name?: string | null
  course_id?: string | null
  lesson_id?: number | null
  lesson_title?: string | null
  category: SupportCategory
  subject: string
  status: SupportTicketStatus
  priority: string
  assigned_to?: string | null
  assigned_name?: string | null
  last_message_at: string
  student_last_read_at?: string | null
  staff_last_read_at?: string | null
  created_at: string
  updated_at: string
  messages: SupportMessageItem[]
}

export interface TeamSupportMember {
  id: string
  full_name: string
  email: string
  role: string
}

export interface ResolvedStudentIdentity {
  studentId: string
  code: string
  name: string
  email: string
  accessTier: string
  cohortId: string | null
  companyName: string | null
}

const LOCAL_SUPPORT_FILE = path.join(process.cwd(), '.support-tickets.json')

function readLocalTickets(): SupportTicketItem[] {
  try {
    if (!fs.existsSync(LOCAL_SUPPORT_FILE)) return []
    const raw = fs.readFileSync(LOCAL_SUPPORT_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[support.ts] Impossibile leggere .support-tickets.json:', err)
    return []
  }
}

function writeLocalTickets(tickets: SupportTicketItem[]): void {
  try {
    fs.writeFileSync(LOCAL_SUPPORT_FILE, JSON.stringify(tickets, null, 2), 'utf8')
  } catch (err) {
    console.warn('[support.ts] Impossibile scrivere .support-tickets.json:', err)
  }
}

function upsertLocalTicket(ticket: SupportTicketItem): void {
  const list = readLocalTickets()
  const idx = list.findIndex((t) => t.id === ticket.id)
  if (idx >= 0) {
    list[idx] = ticket
  } else {
    list.unshift(ticket)
  }
  writeLocalTickets(list)
}

function mergeTicketLists(
  localList: SupportTicketItem[],
  dbRows: any[],
  dbMessages: any[]
): SupportTicketItem[] {
  const map = new Map<string, SupportTicketItem>()

  for (const t of localList) {
    map.set(t.id, {
      ...t,
      messages: Array.isArray(t.messages) ? [...t.messages] : [],
    })
  }

  const msgsByTicket = new Map<string, SupportMessageItem[]>()
  for (const m of dbMessages) {
    if (!m?.ticket_id) continue
    const arr = msgsByTicket.get(m.ticket_id) || []
    arr.push({
      id: m.id,
      ticket_id: m.ticket_id,
      sender_type: m.sender_type || 'student',
      sender_id: m.sender_id || '',
      sender_name: m.sender_name || 'Utente',
      content: m.content || '',
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
      created_at: m.created_at || new Date().toISOString(),
    })
    msgsByTicket.set(m.ticket_id, arr)
  }

  for (const row of dbRows) {
    const existingLocal = map.get(row.id)
    const msgMap = new Map<string, SupportMessageItem>()
    for (const lm of existingLocal?.messages || []) {
      msgMap.set(lm.id, lm)
    }
    for (const dm of msgsByTicket.get(row.id) || []) {
      msgMap.set(dm.id, dm)
    }
    const mergedMsgs = Array.from(msgMap.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    map.set(row.id, {
      id: row.id,
      requester_type: row.requester_type || 'student',
      student_id: row.student_id,
      student_code: row.student_code,
      requester_name: row.requester_name,
      requester_email: row.requester_email,
      company_name: row.company_name || null,
      course_id: row.course_id || null,
      lesson_id: row.lesson_id ?? null,
      lesson_title: row.lesson_title || null,
      category: row.category || 'tecnico',
      subject: row.subject,
      status: row.status || 'open',
      priority: row.priority || 'normal',
      assigned_to: row.assigned_to || null,
      assigned_name: row.assigned_name || null,
      last_message_at: row.last_message_at || row.created_at,
      student_last_read_at: row.student_last_read_at || null,
      staff_last_read_at: row.staff_last_read_at || null,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
      messages: mergedMsgs,
    })
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )
}

/**
 * Risolve l'identità univoca dello studente a partire dal codice di accesso.
 */
export async function resolveStudentIdentityByCode(
  studentCode: string
): Promise<ResolvedStudentIdentity | null> {
  const cleanCode = (studentCode || '').trim().toUpperCase()
  if (!cleanCode) return null

  if (cleanCode === 'DEMO2026' || cleanCode === 'SUPERADMIN') {
    return {
      studentId: `student-${cleanCode.toLowerCase()}`,
      code: cleanCode,
      name: cleanCode === 'SUPERADMIN' ? 'Super Admin' : 'Utente Demo',
      email: 'demo@aiutiamoci.cloud',
      accessTier: 'both',
      cohortId: null,
      companyName: null,
    }
  }

  const admin = createAdminClient()

  // 1. Ricerca primaria in student_codes
  const { data: codeRow } = await (admin.from('student_codes') as any)
    .select('id, code, student_name, student_email, access_tier, cohort_id, is_active')
    .ilike('code', cleanCode)
    .eq('is_active', true)
    .maybeSingle()

  if (codeRow) {
    let companyName: string | null = null
    if (codeRow.cohort_id) {
      try {
        const { data: cohort } = await (admin.from('corporate_cohorts') as any)
          .select('company_name')
          .eq('id', codeRow.cohort_id)
          .maybeSingle()
        if (cohort?.company_name) {
          companyName = cohort.company_name
        }
      } catch {
        // Ignora se tabella cohort non presente
      }
    }

    return {
      studentId: `student-${codeRow.id}`,
      code: codeRow.code,
      name: (codeRow.student_name || 'Studente').trim(),
      email: (codeRow.student_email || '').trim().toLowerCase(),
      accessTier: codeRow.access_tier || 'ai-start',
      cohortId: codeRow.cohort_id || null,
      companyName,
    }
  }

  // 2. Fallback su course_registrations approvate
  const { data: regRow } = await (admin.from('course_registrations') as any)
    .select('id, name, email, access_code, approved, status')
    .ilike('access_code', cleanCode)
    .maybeSingle()

  if (regRow && (regRow.approved === true || regRow.status === 'approved')) {
    return {
      studentId: `student-${regRow.id}`,
      code: regRow.access_code || cleanCode,
      name: (regRow.name || 'Studente').trim(),
      email: (regRow.email || '').trim().toLowerCase(),
      accessTier: 'ai-start',
      cohortId: null,
      companyName: null,
    }
  }

  return null
}

/**
 * Auto-routing deterministico per categoria verso il membro del team competente.
 */
async function resolveAutoAssignee(category: SupportCategory): Promise<{
  assignedTo: string | null
  assignedName: string
}> {
  try {
    const admin = createAdminClient()
    const { data: profiles } = await (admin.from('profiles') as any)
      .select('id, full_name, email, role, is_agent')
      .order('created_at', { ascending: true })

    const team = (Array.isArray(profiles) ? profiles : []).filter((p) => {
      if (p.is_agent || p.role === 'collaborator') return false
      const n = (p.full_name || '').toLowerCase()
      const e = (p.email || '').toLowerCase()
      return !n.includes('nemotron') && !n.includes('pentest') && !e.includes('nemotron') && !e.includes('pentest')
    })

    if (team.length === 0) {
      return {
        assignedTo: null,
        assignedName:
          category === 'commerciale'
            ? 'Lorenzo'
            : category === 'didattica'
            ? 'Docente AI'
            : 'Marco / Stefano',
      }
    }

    const findByName = (needle: string) =>
      team.find(
        (p) =>
          (p.full_name || '').toLowerCase().includes(needle) ||
          (p.email || '').toLowerCase().includes(needle)
      )

    let chosen: any = null

    if (category === 'commerciale') {
      chosen =
        findByName('lorenzo') ||
        team.find((p) => p.role === 'business') ||
        team[0]
    } else if (category === 'didattica') {
      chosen =
        findByName('stefano') ||
        findByName('marco') ||
        team.find((p) => p.role === 'dev' || p.role === 'admin') ||
        team[0]
    } else {
      // 'tecnico'
      chosen =
        findByName('marco') ||
        findByName('stefano') ||
        team.find((p) => p.role === 'dev' || p.role === 'admin') ||
        team[0]
    }

    return {
      assignedTo: chosen?.id || null,
      assignedName: chosen?.full_name || 'Team AIutiamoci',
    }
  } catch (err) {
    console.warn('[support.ts] Auto-routing fallback:', err)
    return {
      assignedTo: null,
      assignedName: category === 'commerciale' ? 'Lorenzo' : 'Marco / Stefano',
    }
  }
}

/**
 * Verifica che l'utente autenticato sia un membro interno del team (non collaborator).
 */
async function requireInternalTeamMember() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Non autorizzato: accesso riservato al team.')
  }

  const admin = createAdminClient()
  const { data: profile } = await (admin.from('profiles') as any)
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (user.user_metadata?.role === 'collaborator' || profile?.role === 'collaborator') {
    throw new Error('Accesso negato ai collaboratori esterni.')
  }

  return {
    id: user.id,
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team',
    email: profile?.email || user.email || '',
    role: profile?.role || user.user_metadata?.role || 'member',
  }
}

async function sendTargetedTeamPush(params: {
  assignedTo?: string | null
  title: string
  body: string
  ticketId: string
}) {
  try {
    const allSubs = await getAllPushSubscriptions()
    const teamSubs = allSubs.filter((s) => s.user_id && !s.user_id.startsWith('student-'))

    let targets = params.assignedTo
      ? teamSubs.filter((s) => s.user_id === params.assignedTo)
      : []

    if (targets.length === 0) {
      targets = teamSubs
    }

    if (targets.length === 0) return

    await Promise.allSettled(
      targets.map((sub) =>
        sendWebPushNotification(sub, {
          title: params.title,
          body: params.body.slice(0, 180),
          url: `/assistenza?ticket=${encodeURIComponent(params.ticketId)}`,
          tag: `support-${params.ticketId}`,
        })
      )
    )
  } catch (err) {
    console.warn('[support.ts] Push al team non riuscita:', err)
  }
}

function isTicketUnreadForStudent(ticket: SupportTicketItem): boolean {
  const msgs = ticket.messages || []
  if (msgs.length === 0) return false
  const lastMsg = msgs[msgs.length - 1]
  if (lastMsg.sender_type !== 'staff') return false
  if (!ticket.student_last_read_at) return true
  return new Date(lastMsg.created_at).getTime() > new Date(ticket.student_last_read_at).getTime()
}

/**
 * Crea un nuovo ticket di assistenza dallo spazio studente o Stanza B2B.
 */
export async function createSupportTicketAction(input: {
  studentCode: string
  category: SupportCategory
  subject: string
  message: string
  courseId?: string
  lessonId?: number
  lessonTitle?: string
  companyName?: string
}) {
  try {
    const subject = (input.subject || '').trim()
    const content = (input.message || '').trim()

    if (!subject || subject.length < 3) {
      return { success: false, error: 'Inserisci un oggetto sintetico (almeno 3 caratteri).' }
    }
    if (!content || content.length < 3) {
      return { success: false, error: 'Scrivi i dettagli della tua richiesta.' }
    }

    let requester: ResolvedStudentIdentity | null = null
    if (input.studentCode === 'TEAM-PREVIEW') {
      const staff = await requireInternalTeamMember()
      requester = {
        studentId: `student-preview-${staff.id}`,
        code: 'TEAM-PREVIEW',
        name: `${staff.full_name} (Test Team)`,
        email: staff.email,
        accessTier: 'both',
        cohortId: null,
        companyName: input.companyName || null,
      }
    } else {
      requester = await resolveStudentIdentityByCode(input.studentCode)
    }

    if (!requester) {
      return { success: false, error: 'Codice studente non valido o non attivo.' }
    }

    const category: SupportCategory =
      input.category === 'didattica' || input.category === 'commerciale'
        ? input.category
        : 'tecnico'

    const { assignedTo, assignedName } = await resolveAutoAssignee(category)
    const nowIso = new Date().toISOString()
    const ticketId = crypto.randomUUID()
    const messageId = crypto.randomUUID()
    const finalCompanyName = (input.companyName || requester.companyName || '').trim() || null
    const requesterType: 'student' | 'b2b' = finalCompanyName ? 'b2b' : 'student'

    const newTicket: SupportTicketItem = {
      id: ticketId,
      requester_type: requesterType,
      student_id: requester.studentId,
      student_code: requester.code,
      requester_name: requester.name,
      requester_email: requester.email,
      company_name: finalCompanyName,
      course_id: input.courseId || requester.accessTier || 'ai-start',
      lesson_id: input.lessonId ?? null,
      lesson_title: input.lessonTitle || null,
      category,
      subject,
      status: 'open',
      priority: requesterType === 'b2b' ? 'high' : 'normal',
      assigned_to: assignedTo,
      assigned_name: assignedName,
      last_message_at: nowIso,
      student_last_read_at: nowIso,
      staff_last_read_at: null,
      created_at: nowIso,
      updated_at: nowIso,
      messages: [
        {
          id: messageId,
          ticket_id: ticketId,
          sender_type: 'student',
          sender_id: requester.studentId,
          sender_name: requester.name,
          content,
          attachments: [],
          created_at: nowIso,
        },
      ],
    }

    // 1. Persistenza locale resiliente
    upsertLocalTicket(newTicket)

    // 2. Persistenza Supabase
    try {
      const admin = createAdminClient()
      const { error: tErr } = await (admin.from('support_tickets') as any).insert({
        id: ticketId,
        requester_type: newTicket.requester_type,
        student_id: newTicket.student_id,
        student_code: newTicket.student_code,
        requester_name: newTicket.requester_name,
        requester_email: newTicket.requester_email,
        company_name: newTicket.company_name,
        course_id: newTicket.course_id,
        lesson_id: newTicket.lesson_id,
        lesson_title: newTicket.lesson_title,
        category: newTicket.category,
        subject: newTicket.subject,
        status: newTicket.status,
        priority: newTicket.priority,
        assigned_to: newTicket.assigned_to,
        assigned_name: newTicket.assigned_name,
        last_message_at: nowIso,
        student_last_read_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
      })

      if (!tErr) {
        await (admin.from('support_messages') as any).insert({
          id: messageId,
          ticket_id: ticketId,
          sender_type: 'student',
          sender_id: requester.studentId,
          sender_name: requester.name,
          content,
          attachments: [],
          created_at: nowIso,
        })
      }
    } catch (dbErr) {
      console.warn('[createSupportTicketAction] Fallback su store locale:', dbErr)
    }

    // 3. Web Push mirata al solo assegnatario competente
    const categoryBadge =
      category === 'commerciale' ? '💼 B2B' : category === 'didattica' ? '🎓 Didattica' : '🛠️ Tecnico'
    await sendTargetedTeamPush({
      assignedTo,
      title: `🛟 Nuovo Ticket [${categoryBadge}] — ${requester.name}`,
      body: `${subject}: ${content}`,
      ticketId,
    })

    return { success: true, ticket: newTicket }
  } catch (err: any) {
    console.error('[createSupportTicketAction] Errore:', err)
    return { success: false, error: err?.message || 'Errore apertura ticket' }
  }
}

/**
 * Recupera i ticket e i messaggi dello studente attivo + conteggio risposte non lette.
 */
export async function getStudentSupportTicketsAction(studentCode: string) {
  try {
    let requester: ResolvedStudentIdentity | null = null
    if (studentCode === 'TEAM-PREVIEW') {
      const staff = await requireInternalTeamMember()
      requester = {
        studentId: `student-preview-${staff.id}`,
        code: 'TEAM-PREVIEW',
        name: staff.full_name,
        email: staff.email,
        accessTier: 'both',
        cohortId: null,
        companyName: null,
      }
    } else {
      requester = await resolveStudentIdentityByCode(studentCode)
    }

    if (!requester) {
      return { success: false, error: 'Codice studente non valido', tickets: [], unreadCount: 0 }
    }

    const localTickets = readLocalTickets().filter(
      (t) =>
        t.student_id === requester!.studentId ||
        t.student_code.toUpperCase() === requester!.code.toUpperCase()
    )

    let dbRows: any[] = []
    let dbMessages: any[] = []

    try {
      const admin = createAdminClient()
      const { data: tData } = await (admin.from('support_tickets') as any)
        .select('*')
        .or(`student_id.eq.${requester.studentId},student_code.ilike.${requester.code}`)
        .order('last_message_at', { ascending: false })

      if (Array.isArray(tData) && tData.length > 0) {
        dbRows = tData
        const ids = tData.map((t) => t.id)
        const { data: mData } = await (admin.from('support_messages') as any)
          .select('*')
          .in('ticket_id', ids)
          .order('created_at', { ascending: true })
        if (Array.isArray(mData)) {
          dbMessages = mData
        }
      }
    } catch {
      // Tabella non ancora migrata sul DB remoto
    }

    const merged = mergeTicketLists(localTickets, dbRows, dbMessages)
    const unreadCount = merged.filter((t) => isTicketUnreadForStudent(t)).length

    return {
      success: true,
      tickets: merged,
      unreadCount,
      studentId: requester.studentId,
    }
  } catch (err: any) {
    console.error('[getStudentSupportTicketsAction] Errore:', err)
    return { success: false, error: err?.message, tickets: [], unreadCount: 0 }
  }
}

/**
 * Risposta dello studente ad un proprio ticket aperto/in attesa.
 */
export async function replyStudentSupportTicketAction(input: {
  studentCode: string
  ticketId: string
  content: string
}) {
  try {
    const content = (input.content || '').trim()
    if (!content) {
      return { success: false, error: 'Scrivi un messaggio prima di inviare.' }
    }

    let requester: ResolvedStudentIdentity | null = null
    if (input.studentCode === 'TEAM-PREVIEW') {
      const staff = await requireInternalTeamMember()
      requester = {
        studentId: `student-preview-${staff.id}`,
        code: 'TEAM-PREVIEW',
        name: `${staff.full_name} (Test Team)`,
        email: staff.email,
        accessTier: 'both',
        cohortId: null,
        companyName: null,
      }
    } else {
      requester = await resolveStudentIdentityByCode(input.studentCode)
    }

    if (!requester) {
      return { success: false, error: 'Codice studente non valido.' }
    }

    // Verifica esistenza e proprietà del ticket
    const resList = await getStudentSupportTicketsAction(input.studentCode)
    const targetTicket = (resList.tickets || []).find((t) => t.id === input.ticketId)
    if (!targetTicket) {
      return { success: false, error: 'Ticket non trovato o non autorizzato.' }
    }

    const nowIso = new Date().toISOString()
    const messageId = crypto.randomUUID()
    const newMessage: SupportMessageItem = {
      id: messageId,
      ticket_id: input.ticketId,
      sender_type: 'student',
      sender_id: requester.studentId,
      sender_name: requester.name,
      content,
      attachments: [],
      created_at: nowIso,
    }

    const updatedTicket: SupportTicketItem = {
      ...targetTicket,
      status: 'open',
      last_message_at: nowIso,
      student_last_read_at: nowIso,
      updated_at: nowIso,
      messages: [...targetTicket.messages, newMessage],
    }

    upsertLocalTicket(updatedTicket)

    try {
      const admin = createAdminClient()
      await (admin.from('support_messages') as any).insert({
        id: messageId,
        ticket_id: input.ticketId,
        sender_type: 'student',
        sender_id: requester.studentId,
        sender_name: requester.name,
        content,
        attachments: [],
        created_at: nowIso,
      })

      await (admin.from('support_tickets') as any)
        .update({
          status: 'open',
          last_message_at: nowIso,
          student_last_read_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', input.ticketId)
    } catch {
      // Fallback locale attivo
    }

    await sendTargetedTeamPush({
      assignedTo: targetTicket.assigned_to,
      title: `💬 Nuova risposta da ${requester.name}`,
      body: `${targetTicket.subject}: ${content}`,
      ticketId: targetTicket.id,
    })

    return { success: true, message: newMessage, ticket: updatedTicket }
  } catch (err: any) {
    console.error('[replyStudentSupportTicketAction] Errore:', err)
    return { success: false, error: err?.message || 'Errore invio risposta' }
  }
}

/**
 * Aggiorna student_last_read_at quando lo studente apre un ticket.
 */
export async function markStudentTicketReadAction(input: {
  studentCode: string
  ticketId: string
}) {
  try {
    const requester =
      input.studentCode === 'TEAM-PREVIEW'
        ? null
        : await resolveStudentIdentityByCode(input.studentCode)

    const nowIso = new Date().toISOString()

    const local = readLocalTickets()
    const idx = local.findIndex((t) => t.id === input.ticketId)
    if (idx >= 0) {
      local[idx] = { ...local[idx], student_last_read_at: nowIso }
      writeLocalTickets(local)
    }

    try {
      const admin = createAdminClient()
      const query = (admin.from('support_tickets') as any)
        .update({ student_last_read_at: nowIso })
        .eq('id', input.ticketId)
      if (requester) {
        query.eq('student_id', requester.studentId)
      }
      await query
    } catch {
      // Ignora se non ancora migrata
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

/**
 * Recupera tutti i ticket di assistenza per la dashboard /assistenza del team.
 */
export async function getTeamSupportTicketsAction() {
  try {
    const staff = await requireInternalTeamMember()
    const admin = createAdminClient()

    const localTickets = readLocalTickets()
    let dbRows: any[] = []
    let dbMessages: any[] = []

    try {
      const { data: tData } = await (admin.from('support_tickets') as any)
        .select('*')
        .order('last_message_at', { ascending: false })

      if (Array.isArray(tData) && tData.length > 0) {
        dbRows = tData
        const ids = tData.map((t) => t.id)
        const { data: mData } = await (admin.from('support_messages') as any)
          .select('*')
          .in('ticket_id', ids)
          .order('created_at', { ascending: true })
        if (Array.isArray(mData)) {
          dbMessages = mData
        }
      }
    } catch {
      // Tabella non ancora migrata
    }

    const { data: profiles } = await (admin.from('profiles') as any)
      .select('id, full_name, email, role, is_agent')
      .order('created_at', { ascending: true })

    const teamMembers: TeamSupportMember[] = (Array.isArray(profiles) ? profiles : [])
      .filter((p) => {
        if (p.is_agent || p.role === 'collaborator') return false
        const n = (p.full_name || '').toLowerCase()
        const e = (p.email || '').toLowerCase()
        return !n.includes('nemotron') && !n.includes('pentest') && !e.includes('nemotron') && !e.includes('pentest')
      })
      .map((p) => ({
        id: p.id,
        full_name: p.full_name || p.email?.split('@')[0] || 'Team',
        email: p.email || '',
        role: p.role || 'member',
      }))

    const tickets = mergeTicketLists(localTickets, dbRows, dbMessages)

    const counts = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      myTickets: tickets.filter((t) => t.assigned_to === staff.id && t.status !== 'resolved').length,
    }

    return {
      success: true,
      tickets,
      teamMembers,
      currentStaffId: staff.id,
      counts,
    }
  } catch (err: any) {
    console.error('[getTeamSupportTicketsAction] Errore:', err)
    return {
      success: false,
      error: err?.message || 'Errore caricamento ticket',
      tickets: [],
      teamMembers: [],
      counts: { total: 0, open: 0, pending: 0, resolved: 0, myTickets: 0 },
    }
  }
}

/**
 * Risposta del team ad un ticket + Web Push al corsista (Livello 1) + Email automatica (Livello 2).
 */
export async function replyTeamSupportTicketAction(input: {
  ticketId: string
  content: string
  newStatus?: SupportTicketStatus
}) {
  try {
    const staff = await requireInternalTeamMember()
    const content = (input.content || '').trim()
    if (!content) {
      return { success: false, error: 'Inserisci il testo della risposta.' }
    }

    const listRes = await getTeamSupportTicketsAction()
    const targetTicket = (listRes.tickets || []).find((t) => t.id === input.ticketId)
    if (!targetTicket) {
      return { success: false, error: 'Ticket non trovato.' }
    }

    const nowIso = new Date().toISOString()
    const messageId = crypto.randomUUID()
    const nextStatus: SupportTicketStatus = input.newStatus || 'pending'

    const newMessage: SupportMessageItem = {
      id: messageId,
      ticket_id: input.ticketId,
      sender_type: 'staff',
      sender_id: staff.id,
      sender_name: staff.full_name,
      content,
      attachments: [],
      created_at: nowIso,
    }

    const updatedTicket: SupportTicketItem = {
      ...targetTicket,
      status: nextStatus,
      assigned_to: targetTicket.assigned_to || staff.id,
      assigned_name: targetTicket.assigned_name || staff.full_name,
      last_message_at: nowIso,
      staff_last_read_at: nowIso,
      updated_at: nowIso,
      messages: [...targetTicket.messages, newMessage],
    }

    upsertLocalTicket(updatedTicket)

    try {
      const admin = createAdminClient()
      await (admin.from('support_messages') as any).insert({
        id: messageId,
        ticket_id: input.ticketId,
        sender_type: 'staff',
        sender_id: staff.id,
        sender_name: staff.full_name,
        content,
        attachments: [],
        created_at: nowIso,
      })

      await (admin.from('support_tickets') as any)
        .update({
          status: nextStatus,
          assigned_to: updatedTicket.assigned_to,
          assigned_name: updatedTicket.assigned_name,
          last_message_at: nowIso,
          staff_last_read_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', input.ticketId)
    } catch {
      // Fallback locale attivo
    }

    // Livello 1: Web Push diretta allo studente destinatario (student-<id>)
    try {
      const allSubs = await getAllPushSubscriptions()
      const studentTargets = allSubs.filter(
        (s) =>
          s.user_id &&
          (s.user_id === targetTicket.student_id ||
            s.user_id === `student-${targetTicket.student_code}`)
      )

      if (studentTargets.length > 0) {
        await Promise.allSettled(
          studentTargets.map((sub) =>
            sendWebPushNotification(sub, {
              title: `🛟 Risposta Assistenza: ${targetTicket.subject}`,
              body: `${staff.full_name}: ${content.slice(0, 150)}`,
              url: `/corsi?support=${encodeURIComponent(targetTicket.id)}`,
              tag: `support-reply-${targetTicket.id}`,
            })
          )
        )
      }
    } catch (pushErr) {
      console.warn('[replyTeamSupportTicketAction] Web Push studente non riuscita:', pushErr)
    }

    // Livello 2: Avviso Email automatico immediato allo studente
    if (
      targetTicket.requester_email &&
      targetTicket.requester_email.includes('@') &&
      !targetTicket.requester_email.endsWith('.local')
    ) {
      const emailBody = `Ciao ${targetTicket.requester_name},\n\nhai ricevuto una nuova risposta dal team AIutiamoci alla tua richiesta di assistenza:\n\n📌 Oggetto: ${targetTicket.subject}\n👤 Risposta di ${staff.full_name}:\n\n"${content}"\n\n👉 Accedi alla piattaforma per leggere tutta la conversazione e rispondere:\nhttps://aiutiamoci.cloud/corsi?support=${encodeURIComponent(targetTicket.id)}\n\nA presto,\nTeam AIutiamoci`

      await sendSharedEmail({
        to: targetTicket.requester_email,
        subject: `🛟 Risposta al tuo ticket: ${targetTicket.subject}`,
        body: emailBody,
      }).catch((e) => console.warn('[replyTeamSupportTicketAction] Invio email fallito:', e))
    }

    return { success: true, message: newMessage, ticket: updatedTicket }
  } catch (err: any) {
    console.error('[replyTeamSupportTicketAction] Errore:', err)
    return { success: false, error: err?.message || 'Errore invio risposta staff' }
  }
}

/**
 * Aggiorna lo stato di un ticket (open / pending / resolved).
 */
export async function updateSupportTicketStatusAction(input: {
  ticketId: string
  status: SupportTicketStatus
}) {
  try {
    await requireInternalTeamMember()
    const nowIso = new Date().toISOString()

    const local = readLocalTickets()
    const idx = local.findIndex((t) => t.id === input.ticketId)
    if (idx >= 0) {
      local[idx] = { ...local[idx], status: input.status, updated_at: nowIso }
      writeLocalTickets(local)
    }

    try {
      const admin = createAdminClient()
      await (admin.from('support_tickets') as any)
        .update({ status: input.status, updated_at: nowIso })
        .eq('id', input.ticketId)
    } catch {
      // Fallback locale attivo
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

/**
 * Riassegna un ticket a un altro membro del team con Web Push mirata al nuovo assegnatario.
 */
export async function reassignSupportTicketAction(input: {
  ticketId: string
  assignedToId: string
}) {
  try {
    const staff = await requireInternalTeamMember()
    const admin = createAdminClient()

    const { data: targetProfile } = await (admin.from('profiles') as any)
      .select('id, full_name, email')
      .eq('id', input.assignedToId)
      .single()

    if (!targetProfile) {
      return { success: false, error: 'Membro del team non trovato.' }
    }

    const assignedName = targetProfile.full_name || targetProfile.email?.split('@')[0] || 'Team'
    const nowIso = new Date().toISOString()

    const listRes = await getTeamSupportTicketsAction()
    const ticket = (listRes.tickets || []).find((t) => t.id === input.ticketId)
    if (ticket) {
      upsertLocalTicket({
        ...ticket,
        assigned_to: targetProfile.id,
        assigned_name: assignedName,
        updated_at: nowIso,
      })
    }

    try {
      await (admin.from('support_tickets') as any)
        .update({
          assigned_to: targetProfile.id,
          assigned_name: assignedName,
          updated_at: nowIso,
        })
        .eq('id', input.ticketId)
    } catch {
      // Fallback locale attivo
    }

    if (targetProfile.id !== staff.id) {
      await sendTargetedTeamPush({
        assignedTo: targetProfile.id,
        title: `🛟 Ticket riassegnato a te da ${staff.full_name}`,
        body: ticket ? `${ticket.requester_name}: ${ticket.subject}` : 'Controlla la Inbox Assistenza',
        ticketId: input.ticketId,
      })
    }

    return { success: true, assignedTo: targetProfile.id, assignedName }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

/**
 * Conteggio leggero ticket aperti (totali e assegnati al membro corrente) per badge Sidebar e Chat.
 */
export async function getOpenSupportTicketsCountAction(): Promise<{
  success: boolean
  openCount: number
  myOpenCount: number
}> {
  try {
    let staff: Awaited<ReturnType<typeof requireInternalTeamMember>>
    try {
      staff = await requireInternalTeamMember()
    } catch {
      return { success: true, openCount: 0, myOpenCount: 0 }
    }

    const byId = new Map<string, { status: string; assigned_to?: string | null }>()

    for (const t of readLocalTickets()) {
      byId.set(t.id, { status: t.status, assigned_to: t.assigned_to || null })
    }

    try {
      const admin = createAdminClient()
      const { data: rows } = await (admin.from('support_tickets') as any)
        .select('id, status, assigned_to')
      if (Array.isArray(rows)) {
        for (const r of rows) {
          if (r?.id) {
            byId.set(r.id, { status: r.status || 'open', assigned_to: r.assigned_to || null })
          }
        }
      }
    } catch {
      // Tabella non ancora accessibile sul DB remoto
    }

    let openCount = 0
    let myOpenCount = 0
    for (const item of byId.values()) {
      if (item.status === 'open') {
        openCount += 1
        if (item.assigned_to === staff.id) {
          myOpenCount += 1
        }
      }
    }

    return { success: true, openCount, myOpenCount }
  } catch {
    return { success: true, openCount: 0, myOpenCount: 0 }
  }
}
