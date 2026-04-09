import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin-login') ||
    pathname.startsWith('/api/admin-logout') ||
    pathname.startsWith('/api/admin-check-session')
  ) {
    return NextResponse.next()
  }

  // Proteger rutas de /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session_id')

    if (!sessionCookie) {
      console.warn('[SECURITY] Acceso a /admin sin sesión desde:', request.ip)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar que la sesión existe y es válida en la BD
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { data: session, error } = await supabaseAdmin
        .from('admin_sessions')
        .select('is_valid, expires_at')
        .eq('id', sessionCookie.value)
        .maybeSingle()  // No error si no existe

      if (error) {
        console.error('[SECURITY] Error validando sesión:', error.message)
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin_session_id')
        return response
      }

      if (
        !session 
        || !session.is_valid 
        || new Date(session.expires_at) < new Date()
      ) {
        console.warn('[SECURITY] Sesión expirada o inválida:', sessionCookie.value)
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin_session_id')
        return response
      }

      return NextResponse.next()

    } catch (error) {
      console.error('[SECURITY] Error en middleware:', error.message)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session_id')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin-login', '/api/admin-logout', '/api/admin-check-session']
}
