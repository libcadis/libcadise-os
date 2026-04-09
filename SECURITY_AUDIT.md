# 🔐 AUDITORÍA DE SEGURIDAD - Papelería Ultra

**Fecha**: 9 de abril de 2026  
**Estado**: 🚨 **CRÍTICAS DETECTADAS**  
**Severidad General**: 🔴 **CRÍTICA** (Fácil acceso no autorizado a panel admin)

---

## 📋 RESUMEN EJECUTIVO

Tu aplicación **está expuesta a acceso no autorizado al panel de administración**. Un atacante puede:
1. ✓ Acceder al `/admin` sin credenciales válidas
2. ✓ Modificar productos, precios y pedidos desde el frontend
3. ✓ Leer toda la base de datos debido a políticas RLS deshabilitadas
4. ✓ Subir archivos arbitrarios al Storage

**Riesgo**: Daño operacional completo, pérdida de datos, defunción comercial.

---

## 🚨 VULNERABILIDADES POR SEVERIDAD

### 🔴 CRÍTICA #1: RLS COMPLETAMENTE DESHABILITADO

**Ubicación**: `supabase-schema.sql` + `supabase-migration-homepage.sql`

**Código vulnerable**:
```sql
-- ESTO PERMITE A CUALQUIERA HACER TODO
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections DISABLE ROW LEVEL SECURITY;
```

**Por qué es crítico**:
- La `anon_key` de Supabase está expuesta en `lib/supabase.js`
- Sin RLS, cualquiera con la anon key puede:
  - Leer TODOS los pedidos (datos de clientes)
  - Leer TODOS los admin_users (hashes de contraseña)
  - Modificar TODOS los productos (precios, descripciones)
  - Modificar estado de pedidos

**Código vulnerable en `lib/supabase.js`**:
```javascript
export const supabase = createClient(
  "https://ocmqlinifcnyqpdwkuta.supabase.co",  // ⚠️ PÚBLICO
  "sb_publishable_dWGEA5bFqUPBsKX8Rkb6zA_vrwcld5S"  // ⚠️ EXPUESTA EN GITHUB
)
```

**Ataque conceptual**:
```bash
# Desde la consola del navegador de CUALQUIER SITIO:
const { createClient } = supabase;
const client = createClient(
  "https://ocmqlinifcnyqpdwkuta.supabase.co",
  "sb_publishable_dWGEA5bFqUPBsKX8Rkb6zA_vrwcld5S"  // La anon key está en GitHub
);

# Leer TODOS los pedidos (incluyendo datos personales)
const { data: pedidos } = await client
  .from('pedidos')
  .select('*');

# Modificar precios
await client
  .from('productos')
  .update({ precio: 1 })
  .eq('id', 1);
```

---

### 🔴 CRÍTICA #2: ACCESO AL ADMIN SIN VALIDACIÓN REAL

**Ubicación**: `app/api/admin-login/route.js`

**Código vulnerable**:
```javascript
export async function POST(request) {
  const { user, pass } = await request.json();

  const { data, error } = await supabase.rpc(
    'verify_admin_credentials',  // ⚠️ Función SQL
    { p_user: user, p_pass: pass }
  );

  if (data === true) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_auth', process.env.ADMIN_TOKEN, {
      httpOnly: true,
      // ... configuración cookie
    });
    return response;
  }
}
```

**El problema**:
1. El RPC `verify_admin_credentials` está disponible públicamente
2. La tabla `admin_users` NO tiene RLS habilitado
3. Un atacante sabe el nombre de la función SQL

**Ataque (force brute)**:
```javascript
// Desde la consola del navegador
const diccionario = ['admin', 'paula', 'papeleria', 'password', '123456'];

for (const user of diccionario) {
  for (const pass of diccionario) {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      body: JSON.stringify({ user, pass })
    });
    const data = await res.json();
    if (data.ok) {
      console.log('✓ Credenciales encontradas:', user, pass);
      break;
    }
  }
}
```

También puede intentar **inyección SQL** o extraer el hash de la contraseña:

```javascript
// Intenta extraer la contraseña hasheada
const { data } = await supabase
  .from('admin_users')
  .select('username, password_hash');  // ⚠️ SIN RLS, esto funciona!

console.log('Hashes encontrados:', data);
```

---

### 🔴 CRÍTICA #3: MIDDLEWARE DE PROTECCIÓN FÁCIL DE BYPASSEAR

**Ubicación**: `middleware.js`

**Código vulnerable**:
```javascript
if (pathname.startsWith('/admin')) {
  const authCookie = request.cookies.get('admin_auth');
  const validToken = process.env.ADMIN_TOKEN;

  if (!authCookie || !validToken || authCookie.value !== validToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
```

**El problema**:
1. **Cookie-based auth es débil**: Los cookies se pueden manipular/clonear
2. **No hay validación en servidor**: Simplemente compara una cookie
3. **Token en `.env` no protege**: El `.env` se puede exponer con error en CI/CD
4. **No hay sesión activa**: No hay verificación de quién está logueado

**Ataque - Falsificar la cookie**:
```javascript
// En DevTools del navegador - establecer cookie falsificada
document.cookie = "admin_auth=cualquiervalor; path=/; max-age=28800";

// Ahora acceder a /admin
window.location.href = "/admin";  // ✓ Entra sin validación real
```

**Ataque - Fuerza bruta del token .env**:
```bash
# Si ADMIN_TOKEN es débil (ej: "admin123")
# El atacante intenta valores comunes
```

---

### 🔴 CRÍTICA #4: OPERACIONES DE BASE DE DATOS SIN AUTORIZACIÓN

**Ubicación**: `components/AdminProductos.js`, `components/AdminPedidos.js`

**Código vulnerable**:
```javascript
// Sin comprobar realmente si es admin
const { agregarProducto, actualizarProducto } = useProductos();

// Cualquiera que sepa hacer fetch puede hacerlo
await agregarProducto({
  nombre: 'Producto malicioso',
  precio: 0.01,
  // ...
});
```

**El problema**:
- Los components de admin NO verifican si el usuario es realmente admin
- Solo confían en la cookie `admin_auth`
- Si un atacante accede al formulario, puede enviar peticiones

**Ataque - Manipular productos vía Network tab**:
```javascript
// Interceptar la petición del formulario y modificarla
fetch('/api/productos', {
  method: 'POST',
  body: JSON.stringify({
    nombre: 'PIRATED VERSION - Click here for virus',
    precio: -1000,  // Precio negativo
    categoria: 'malicioso'
  })
});
```

---

### 🟠 ALTA: FUNCIÓN STORED PROCEDURE EXPUESTA

**Ubicación**: `supabase-schema.sql`

**Código vulnerable**:
```sql
CREATE OR REPLACE FUNCTION verify_admin_credentials(p_user TEXT, p_pass TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER  -- ⚠️ Ejecuta con permisos elevados
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users  -- ⚠️ Sin RLS
    WHERE username = p_user
      AND activo = true
      AND password_hash = crypt(p_pass, password_hash)
  );
$$;
```

**El problema**:
1. `SECURITY DEFINER` = ejecuta con permisos del owner (postgres)
2. Aunque haya RLS, esta función la evita
3. Sin limit de intentos = ataque fuerza bruta

**Ataque - Timing side-channel**:
```javascript
// Medir tiempo de respuesta para detectar usuarios válidos
const users = ['paula', 'admin', 'gucci_fan_22'];

for (const user of users) {
  const start = performance.now();
  await supabase.rpc('verify_admin_credentials', {
    p_user: user,
    p_pass: 'wrongpass'
  });
  const elapsed = performance.now() - start;
  
  if (elapsed > 50) {
    console.log(`✓ Usuario válido: ${user}`);  // Respuesta más lenta = existe
  }
}
```

---

### 🟠 ALTA: CLAVES SENSIBLES EN GITHUB PÚBLICO

**Ubicación**: `lib/supabase.js` (commiteado en GitHub)

```javascript
export const supabase = createClient(
  "https://ocmqlinifcnyqpdwkuta.supabase.co",
  "sb_publishable_dWGEA5bFqUPBsKX8Rkb6zA_vrwcld5S"
)
```

**El problema**:
- El URL de Supabase es único por proyecto
- La anon key en GitHub = cualquiera puede acceder
- Atacantes escanean repos públicos buscando `supabase_key`

**Impacto**:
- Acceso a toda tu base de datos
- Modificación de datos
- Posible delete de tablas

---

### 🟡 MEDIA: BUCKET DE STORAGE SIN RESTRICCIONES

**Ubicación**: `supabase-schema.sql`

```sql
-- Políticas de Storage muy abiertas
CREATE POLICY "Productos bucket public insert" 
  ON storage.objects FOR INSERT TO public 
  WITH CHECK (bucket_id = 'productos');

CREATE POLICY "Productos bucket public delete" 
  ON storage.objects FOR DELETE TO public 
  USING (bucket_id = 'productos');
```

**El problema**:
- Cualquiera (con anon key) puede subir/eliminar archivos
- Sin validación de tipo de contenido real
- Sin límite de tamaño por usuario

**Ataque - Upload de archivo malicioso**:
```javascript
const file = new File(
  ['<script>alert("XSS")</script>'],
  'trojan.js',
  { type: 'image/jpeg' }  // Falsificar el tipo
);

await supabase.storage
  .from('productos')
  .upload('trojan.js', file);

// Linkear públicamente: https://storage.com/trojan.js
```

---

## 🛡️ SOLUCIONES CONCRETAS

### PASO 1: Habilitar Row Level Security (RLS)

**Ejecutar en Supabase SQL Editor**:

```sql
-- 1. HABILITAR RLS en TODAS las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- 2. TABLA PRODUCTOS - Pública para lectura, solo admin para escritura
-- Lectura pública (para el catálogo)
CREATE POLICY "Productos - Lectura Pública"
  ON productos FOR SELECT
  TO public
  USING (activo = true);

-- Escritura solo para admin (verificado en backend)
CREATE POLICY "Productos - Admin Update"
  ON productos FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_sessions WHERE is_valid = true))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_sessions WHERE is_valid = true));

-- 3. TABLA PEDIDOS - Pública solo para insert (crear pedido)
CREATE POLICY "Pedidos - Cliente Insert"
  ON pedidos FOR INSERT
  TO public
  WITH CHECK (true);  -- Cualquiera puede crear pedido

-- Lectura privada (solo el admin)
CREATE POLICY "Pedidos - Admin Select"
  ON pedidos FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_sessions WHERE is_valid = true));

-- 4. TABLA ADMIN_USERS - Protegida completamente
-- Nadie tiene acceso directo; solo a través de función con rate limit
CREATE POLICY "Admin Users - No Access"
  ON admin_users FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- 5. TABLA HOMEPAGE_SECTIONS - Lectura pública, escritura restringida
CREATE POLICY "Homepage - Lectura Pública"
  ON homepage_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Homepage - Admin Update"
  ON homepage_sections FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_sessions WHERE is_valid = true))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_sessions WHERE is_valid = true));

-- 6. CREAR tabla de sesiones admin autenticadas
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  is_valid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '8 hours',
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_admin_sessions_valid 
  ON admin_sessions(user_id) 
  WHERE is_valid = true AND expires_at > NOW();

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Sessions - No Access"
  ON admin_sessions FOR ALL
  TO public
  USING (false);
```

---

### PASO 2: Reemplazar RPC de Verificación (con Rate Limit)

**Ejecutar en Supabase SQL Editor**:

```sql
-- Nueva función con RATE LIMITING y mejor validación
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_username TEXT,
  p_password TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  session_token UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id INT;
  v_session_id UUID;
  v_failed_attempts INT;
  v_last_attempt_time TIMESTAMP;
BEGIN
  -- 1. Anti-brute-force: Verificar intentos fallidos recientes
  SELECT COUNT(*),
         MAX(created_at)
    INTO v_failed_attempts, v_last_attempt_time
    FROM login_attempts
   WHERE username = p_username
     AND success = false
     AND created_at > NOW() - INTERVAL '15 minutes';

  IF v_failed_attempts >= 5 THEN
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);
    RETURN QUERY SELECT false::BOOLEAN, 'Demasiados intentos fallidos. Intenta en 15 minutos.'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 2. Verificar credenciales
  SELECT id
    INTO v_admin_id
    FROM admin_users
   WHERE username = p_username
     AND activo = true
     AND password_hash = crypt(p_password, password_hash);

  IF v_admin_id IS NULL THEN
    -- Log de intento fallido
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);
    RETURN QUERY SELECT false::BOOLEAN, 'Usuario o contraseña incorrectos'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 3. Crear sesión admin válida
  INSERT INTO admin_sessions (user_id, is_valid, ip_address)
    VALUES (v_admin_id::UUID, true, p_ip_address)
    RETURNING admin_sessions.id INTO v_session_id;

  -- 4. Log intento exitoso y limpiar fallidos
  DELETE FROM login_attempts
   WHERE username = p_username
     AND created_at < NOW() - INTERVAL '1 hour';

  RETURN QUERY SELECT true::BOOLEAN, 'Login exitoso'::TEXT, v_session_id;
END;
$$;

-- Tabla para tracking de intentos fallidos
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  success BOOLEAN,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_attempts 
  ON login_attempts(username, created_at DESC);
```

---

### PASO 3: Crear archivo `.env.local` (NUNCA commitearlo)

**Archivo**: `papeleria-ultra.-main/.env.local`

```bash
# NO COMPARTIR - GUARDAR EN SECRETO
# Nunca hacer commit de este archivo!

# Variables públicas (safe)
NEXT_PUBLIC_SUPABASE_URL=https://ocmqlinifcnyqpdwkuta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_dWGEA5bFqUPBsKX8Rkb6zA_vrwcld5S

# Variables privadas (solo servidor)
ADMIN_TOKEN=generador_uuid_fuerte_aqui_minimo_32_caracteres_aleatorios
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (obtener de Supabase Settings)
```

**Genera un token fuerte**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### PASO 4: Reemplazar Lógica de Login en Backend

**Archivo**: `app/api/admin-login/route.js`

```javascript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { user, pass } = await request.json()
    
    // Validar input
    if (!user || !pass || user.length < 3 || pass.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 400 }
      )
    }

    // Usar service_role_key SOLO en servidor (de .env.local)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // ⚠️ No en frontend
    )

    // Llamar función RPC con rate limiting
    const { data, error } = await supabaseAdmin.rpc(
      'verify_admin_login',
      {
        p_username: user,
        p_password: pass,
        p_ip_address: request.headers.get('x-forwarded-for') || request.ip
      }
    )

    if (error) {
      console.error('[SECURITY] RPC Error:', error)
      return NextResponse.json(
        { ok: false, error: 'Error de servidor' },
        { status: 500 }
      )
    }

    if (!data[0]?.success) {
      return NextResponse.json(
        { ok: false, error: data[0]?.message || 'Login fallido' },
        { status: 401 }
      )
    }

    // Crear sesión segura (HttpOnly cookie)
    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_session_id', data[0].session_token, {
      httpOnly: true,        // JavaScript NO puede acceder
      secure: true,          // HTTPS only
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,   // 8 horas
      path: '/admin'
    })

    return response
  } catch (error) {
    console.error('[SECURITY] Login error:', error)
    return NextResponse.json(
      { ok: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
```

---

### PASO 5: Middleware de Protección Mejorado

**Archivo**: `middleware.js`

```javascript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin-login')
  ) {
    return NextResponse.next()
  }

  // Proteger /admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session_id')

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar sesión en BD (en servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: session, error } = await supabaseAdmin
      .from('admin_sessions')
      .select('is_valid, expires_at')
      .eq('id', sessionCookie.value)
      .single()

    if (error || !session || !session.is_valid || new Date(session.expires_at) < new Date()) {
      console.error('[SECURITY] Invalid session:', sessionCookie.value)
      
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session_id')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin-login']
}
```

---

### PASO 6: Eliminar .env Variables del Código

**Archivo**: `lib/supabase.js` - REEMPLAZAR CON:

```javascript
import { createClient } from "@supabase/supabase-js"

// Solo usar claves PÚBLICAS del navegador
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Para operaciones con permisos elevados, usar endpoint backend
export const createAdminClient = () => {
  // NUNCA usar esto en frontend
  if (typeof window !== 'undefined') {
    throw new Error('Admin client must not be used on frontend')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
```

---

### PASO 7: Configurar .gitignore

**Archivo**: `papeleria-ultra.-main/.gitignore` - AGREGAR:

```bash
# Environment variables (NUNCA commitear)
.env.local
.env.local.backup
.env.production.local
.env.development.local
.env.test.local

# API Keys accidentalmente commitedas (búsqueda histórica)
*.key
*.pem
secrets/
```

---

### PASO 8: Validación en Componentes Admin

**Archivo**: `components/AdminProductos.js` - AGREGAR al inicio:

```javascript
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProductos() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Verificar sesión en servidor
    const checkAuth = async () => {
      const res = await fetch('/api/admin-check-session', {
        method: 'GET',
        credentials: 'include'  // Enviar cookies
      })
      
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      
      setIsAuthorized(true)
    }

    checkAuth()
  }, [router])

  if (!isAuthorized) {
    return <div>Verificando acceso...</div>
  }

  // ... resto del componente
}
```

**Nueva ruta**: `app/api/admin-check-session/route.js`

```javascript
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
      .single()

    if (error || !session?.is_valid || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { ok: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Backupear base de datos
- [ ] Ejecutar SQL de RLS en Supabase
- [ ] Crear `.env.local` con variables seguras
- [ ] Reemplazar login/middleware backend
- [ ] Actualizar `lib/supabase.js`
- [ ] Agregar `.env.local` a `.gitignore`
- [ ] Probar login en desarrollo
- [ ] Probar RLS policies (intentar acceso no autorizado)
- [ ] Hacer commit y push a GitHub
- [ ] Monitorear logs en producción (Netlify)
- [ ] Rotar ADMIN_TOKEN cada 30 días

---

## 📊 IMPACTO DE VULNERABILIDADES

| Vulnerabilidad | Impacto | Exploración |
|---|---|---|
| RLS deshabilitado | Acceso total a BD | Segundos |
| Anon key expuesta | Lectura/escritura de datos | Minutos |
| Auth por cookie | Acceso sin login | Minutos |
| Función RPC pública | Fuerza bruta (5 intentos/15 min) | Horas |
| sin Storage RLS | Upload de archivos | Minutos |

---

## 🔍 CÓMO VERIFICAR CORRECCIONES

### Test 1: Intentar acceder a `/admin` sin login
```bash
curl -H "Cookie: admin_session_id=fake" https://tudominio.com/admin
# Esperado: 302 redirect a /admin/login
```

### Test 2: Intentar leer `admin_users` con anon key
```javascript
const { data } = await supabase
  .from('admin_users')
  .select('*');
// Esperado: Error "new row violates row-level security policy"
```

### Test 3: Verificar que la anon key NO está en GitHub
```bash
git log -p | grep -i "publishable_key\|ANON_KEY"
# Esperado: (vacío - sin matches)
```

---

**Próximas acciones**: Implementar fixes en orden de severidad, empezando por RLS.
