import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Permitir acceso libre a login y a las API routes de admin
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin-login') ||
    pathname.startsWith('/api/admin-logout')
  ) {
    return NextResponse.next()
  }

  // Proteger todas las rutas de /admin
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_auth')
    const validToken = process.env.ADMIN_TOKEN

    if (!authCookie || !validToken || authCookie.value !== validToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
