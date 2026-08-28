import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se l'utente non è un amministratore/membro del team autenticato (es. uno studente con codice),
  // nascondiamo completamente la Sidebar e la Navbar del team!
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    )
  }

  let profile: any = null
  if (user) {
    const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const resolveUserName = (pName?: string | null, metaName?: string | null, email?: string | null) => {
    if (email && email.toLowerCase() === 'gerelmo@gmail.com') return 'Marco'
    if (pName && pName.trim() && !pName.includes('@') && pName.toLowerCase() !== 'gerelmo') return pName
    if (metaName && metaName.trim() && !metaName.includes('@') && metaName.toLowerCase() !== 'gerelmo') return metaName
    if (email) {
      if (email.toLowerCase().includes('gerelmo') || email.toLowerCase().includes('marco')) return 'Marco'
      const namePart = email.split('@')[0]
      return namePart.charAt(0).toUpperCase() + namePart.slice(1)
    }
    return 'Marco'
  }

  const userName = resolveUserName(profile?.full_name, user.user_metadata?.full_name, user.email)
  const userRole = profile?.role || user.user_metadata?.role || 'dev'
  const userEmail = profile?.email || user.email || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Fixed Sidebar per il Team */}
      <Sidebar />

      {/* Main Content Area per il Team */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
