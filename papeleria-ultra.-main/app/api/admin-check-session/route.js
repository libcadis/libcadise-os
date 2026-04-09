import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get('admin_session_id')

    if (!sessionCookie) {
      return NextResponse.json(
        { ok: false, error: 'No session' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: session, error } = await supabaseAdmin
      .from('admin_sessions')
      .select('is_valid, expires_at')
      .eq('id', sessionCookie.value)
      .maybeSingle()

    if (error) {
      console.error('[SECURITY] Error verificando sesión:', error.message)
      return NextResponse.json(
        { ok: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    if (
      !session
      || !session.is_valid
      || new Date(session.expires_at) < new Date()
    ) {
      console.warn('[SECURITY] Sesión no válida o expirada')
      const response = NextResponse.json(
        { ok: false, error: 'Session expired' },
        { status: 401 }
      )
      response.cookies.delete('admin_session_id')
      return response
    }

    return NextResponse.json({ ok: true, session })

  } catch (error) {
    console.error('[SECURITY] Error en check-session:', error.message)
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
