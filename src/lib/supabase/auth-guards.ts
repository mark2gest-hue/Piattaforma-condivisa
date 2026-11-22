import { createClient, createAdminClient } from '@/lib/supabase/server'

export type AppUserRole = 'admin' | 'dev' | 'member' | 'collaborator'

export interface AuthenticatedProfile {
  id: string
  role: AppUserRole
  is_active: boolean
  is_agent: boolean
}

export function isAdminRole(role?: string | null): boolean {
  return role === 'admin' || role === 'dev'
}

export async function getAuthenticatedProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Accesso non autorizzato: autenticazione richiesta.')
  }

  const supabaseAdmin = createAdminClient()
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, is_active, is_agent')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.is_active === false) {
    throw new Error('Accesso negato: profilo utente non attivo o non trovato.')
  }

  return {
    user,
    profile: {
      id: profile.id as string,
      role: profile.role as AppUserRole,
      is_active: Boolean(profile.is_active),
      is_agent: Boolean(profile.is_agent),
    } satisfies AuthenticatedProfile,
  }
}

export async function requireTeamMember() {
  const result = await getAuthenticatedProfile()
  const allowedRoles: AppUserRole[] = ['admin', 'dev', 'member', 'collaborator']
  if (!allowedRoles.includes(result.profile.role)) {
    throw new Error('Permesso negato: accesso riservato ai membri del team.')
  }
  return result
}

export async function requireInternalMember() {
  const result = await getAuthenticatedProfile()
  const allowedRoles: AppUserRole[] = ['admin', 'dev', 'member']
  if (!allowedRoles.includes(result.profile.role)) {
    throw new Error('Permesso negato: azione riservata ai membri interni del team.')
  }
  return result
}

export async function requireAdmin() {
  const result = await getAuthenticatedProfile()
  if (!isAdminRole(result.profile.role)) {
    throw new Error('Permesso negato: azione riservata agli amministratori.')
  }
  return result
}
