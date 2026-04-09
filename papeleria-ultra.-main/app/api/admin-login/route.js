import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { user, pass } = await request.json()

    // 1. VALIDAR INPUT básico
    if (!user || !pass) {
      return NextResponse.json(
        { ok: false, error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      )
    }

    if (user.length < 3 || user.length > 100) {
      return NextResponse.json(
        { ok: false, error: 'Usuario inválido' },
        { status: 400 }
      )
    }

    if (pass.length < 8 || pass.length > 255) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña inválida' },
        { status: 400 }
      )
    }

    // 2. USAR SERVICE ROLE KEY (solo servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 3. LLAMAR FUNCIÓN RPC CON RATE LIMITING
    const clientIp = request.headers.get('x-forwarded-for') 
      || request.headers.get('cf-connecting-ip')
      || 'unknown'

    const { data, error } = await supabaseAdmin.rpc('verify_admin_login', {
      p_username: user,
      p_password: pass,
      p_ip_address: clientIp
    })

    if (error) {
      console.error('[SECURITY] RPC Error:', error.message)
      return NextResponse.json(
        { ok: false, error: 'Error de autenticación' },
        { status: 500 }
      )
    }

    if (!data || !data[0]) {
      return NextResponse.json(
        { ok: false, error: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

    const [result] = data

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.message },
        { status: 401 }
      )
    }

    // 4. CREAR SESIÓN SEGURA (HttpOnly cookie)
    const response = NextResponse.json({ ok: true })
    
    response.cookies.set('admin_session_id', result.session_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/admin'
    })

    console.log('[AUTH] Login exitoso para usuario:', user)
    return response

  } catch (error) {
    console.error('[SECURITY] Error en admin-login:', error.message)
    return NextResponse.json(
      { ok: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
