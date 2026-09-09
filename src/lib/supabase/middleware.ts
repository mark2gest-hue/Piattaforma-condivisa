import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isApiRoute = pathname.startsWith('/api')
  const isCorsiRoute = pathname.startsWith('/corsi')
  const isZonaCompitiRoute = pathname.startsWith('/zona-compiti')
  const isGraziaRoute = pathname.startsWith('/grazia')
  const isN8nScreencastRoute = pathname.startsWith('/n8n-screencast')
  const isRootRoute = pathname === '/'

  // Rotte pubbliche accessibili: Landing ('/'), Corsi ('/corsi'), Zona Compiti ('/zona-compiti'), Prototipi Grazia ('/grazia'), Login ('/login'), n8n screencast e API
  const isPublicRoute = isRootRoute || isCorsiRoute || isZonaCompitiRoute || isGraziaRoute || isAuthRoute || isApiRoute || isN8nScreencastRoute

  // Se l'utente non è autenticato come membro del team e cerca di accedere a rotte riservate (/lavori, /posta, /chat, /files...),
  // viene reindirizzato a /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
