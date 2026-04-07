import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { user, pass } = await request.json()

    const { data, error } = await supabase.rpc('verify_admin_credentials', {
      p_user: user,
      p_pass: pass
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo validar credenciales en Supabase' },
        { status: 500 }
      )
    }

    if (data === true) {
      const response = NextResponse.json({ ok: true })
      response.cookies.set('admin_auth', process.env.ADMIN_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8 // 8 horas
      })
      return response
    }

    return NextResponse.json(
      { ok: false, error: 'Credenciales incorrectas' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
