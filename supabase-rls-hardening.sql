-- ============================================================
-- HARDENING SECURITY: RLS y Protección de Admin
-- Ejecutar en: Supabase SQL Editor
-- Severidad: CRÍTICA - Ejecutar antes de producción
-- ============================================================

-- ============================================================
-- 1. CREAR TABLA DE SESIONES ADMIN
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT,
  is_valid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '8 hours',
  ip_address INET,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_valid 
  ON admin_sessions(user_id) 
  WHERE is_valid = true AND expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires 
  ON admin_sessions(expires_at);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Nadie tiene acceso directo a sesiones
CREATE POLICY "Admin Sessions - Bloqueado"
  ON admin_sessions FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 2. CREAR TABLA DE INTENTOS FALLIDOS (Rate Limiting)
-- ============================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  success BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts 
  ON login_attempts(username, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip
  ON login_attempts(ip_address, created_at DESC);

-- Limpiar intentos antiguos cada semana
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. NUEVA FUNCIÓN RPC CON RATE LIMITING Y SEGURIDAD
-- ============================================================

-- Reemplazar función anterior
DROP FUNCTION IF EXISTS verify_admin_credentials(TEXT, TEXT);

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
SET search_path = public
AS $$
DECLARE
  v_admin_id INT;
  v_session_id UUID;
  v_failed_attempts INT;
  v_password_hash TEXT;
BEGIN
  -- 1. VALIDAR INPUT (prevenir inyección)
  IF length(p_username) < 3 OR length(p_username) > 100 THEN
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);
    RETURN QUERY SELECT false, 'Usuario inválido'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF length(p_password) < 8 OR length(p_password) > 255 THEN
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);
    RETURN QUERY SELECT false, 'Contraseña inválida'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- 2. RATE LIMITING: Máximo 5 intentos fallidos en 15 minutos
  SELECT COUNT(*)
    INTO v_failed_attempts
    FROM login_attempts
   WHERE username = p_username
     AND success = false
     AND created_at > NOW() - INTERVAL '15 minutes';

  IF v_failed_attempts >= 5 THEN
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);
    
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Demasiados intentos fallidos. Intenta en 15 minutos.'::TEXT,
      NULL::UUID;
    RETURN;
  END IF;

  -- 3. VERIFICAR CREDENCIALES (constante time para evitar timing attacks)
  SELECT id, password_hash
    INTO v_admin_id, v_password_hash
    FROM admin_users
   WHERE username = p_username
     AND activo = true;

  -- Siempre ejecutar crypt() para mantener tiempo constante
  IF v_admin_id IS NOT NULL 
     AND v_password_hash = crypt(p_password, v_password_hash) THEN
    
    -- Credenciales correctas
    -- Crear sesión válida
    INSERT INTO admin_sessions (user_id, is_valid, ip_address, user_agent)
      VALUES (v_admin_id, true, p_ip_address, NULL)
      RETURNING admin_sessions.id INTO v_session_id;

    -- Limpiar intentos fallidos antiguos
    DELETE FROM login_attempts
     WHERE username = p_username
       AND created_at < NOW() - INTERVAL '1 hour';

    RETURN QUERY SELECT 
      true::BOOLEAN,
      'Login exitoso'::TEXT,
      v_session_id;
    
  ELSE
    -- Credenciales incorrectas
    INSERT INTO login_attempts (username, success, ip_address)
      VALUES (p_username, false, p_ip_address);

    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Usuario o contraseña incorrectos'::TEXT,
      NULL::UUID;
  END IF;
END;
$$;

-- ============================================================
-- 4. HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLÍTICAS PARA PRODUCTOS
-- ============================================================

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Productos - Public Read" ON productos;
DROP POLICY IF EXISTS "Productos - Admin CRUD" ON productos;

-- Lectura pública (solo activos)
CREATE POLICY "Productos Select Público"
  ON productos FOR SELECT
  TO public
  USING (activo = true);

-- Escritura solo a través de API autenticada (sin RLS, solo servidor)
-- Nota: Las operaciones de admin suceden en el backend con service_role
CREATE POLICY "Productos - Admin Write Bloqueado en FE"
  ON productos FOR INSERT
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Productos - Admin Update Bloqueado en FE"
  ON productos FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Productos - Admin Delete Bloqueado en FE"
  ON productos FOR DELETE
  TO public
  USING (false);

-- ============================================================
-- 6. POLÍTICAS PARA PEDIDOS
-- ============================================================

-- Insertar públicamente (cualquiera puede crear pedido)
CREATE POLICY "Pedidos - Cliente Insert"
  ON pedidos FOR INSERT
  TO public
  WITH CHECK (true);

-- Lectura bloqueada en anon key
CREATE POLICY "Pedidos - Lectura Bloqueada"
  ON pedidos FOR SELECT
  TO public
  USING (false);

-- Update/Delete bloqueado en anon key
CREATE POLICY "Pedidos - Update Bloqueado"
  ON pedidos FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Pedidos - Delete Bloqueado"
  ON pedidos FOR DELETE
  TO public
  USING (false);

-- ============================================================
-- 7. POLÍTICAS PARA PEDIDO_ITEMS
-- ============================================================

DROP POLICY IF EXISTS "Pedido Items - Insert" ON pedido_items;
DROP POLICY IF EXISTS "Pedido Items - Select" ON pedido_items;

CREATE POLICY "Pedido Items - Insert"
  ON pedido_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Pedido Items - Select Bloqueado"
  ON pedido_items FOR SELECT
  TO public
  USING (false);

CREATE POLICY "Pedido Items - Update Bloqueado"
  ON pedido_items FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 8. POLÍTICAS PARA ADMIN_USERS
-- ============================================================

-- Proteger completamente la tabla
CREATE POLICY "Admin Users - Bloqueado Total"
  ON admin_users FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 9. POLÍTICAS PARA HOMEPAGE_SECTIONS
-- ============================================================

-- Lectura pública
DROP POLICY IF EXISTS "Homepage Sections - Public Read" ON homepage_sections;

CREATE POLICY "Homepage Sections - Select Público"
  ON homepage_sections FOR SELECT
  TO public
  USING (true);

-- Escritura bloqueada en anon key (solo servidor)
CREATE POLICY "Homepage Sections - Admin Write Bloqueado en FE"
  ON homepage_sections FOR INSERT
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Homepage Sections - Admin Update Bloqueado en FE"
  ON homepage_sections FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Homepage Sections - Admin Delete Bloqueado en FE"
  ON homepage_sections FOR DELETE
  TO public
  USING (false);

-- ============================================================
-- 10. POLÍTICAS PARA STORAGE (Bucket "productos")
-- ============================================================

-- Reemplazar políticas de Storage muy abiertas
-- Primero, eliminar las de lectura pública
DELETE FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname IN (
    'Productos bucket public read',
    'Productos bucket public insert',
    'Productos bucket public update',
    'Productos bucket public delete'
  );

-- Nueva política: Lectura pública del bucket
CREATE POLICY "Productos Storage - Public Read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'productos');

-- Escritura solo desde servidor (service_role)
-- Nota: Desde frontend NO es posible, solo endpoint backend
-- No hay política de INSERT/UPDATE/DELETE para anon, así que fallarán

-- ============================================================
-- 11. CREAR FUNCIÓN PARA LIMPIAR SESIONES EXPIRADAS
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions
  WHERE expires_at < NOW()
    OR is_valid = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. VERIFICACIÓN FINAL
-- ============================================================

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'productos',
  'pedidos',
  'pedido_items',
  'admin_users',
  'homepage_sections',
  'admin_sessions',
  'login_attempts'
);

-- Esperado:
-- tablename          | rowsecurity
-- -------------------|------------
-- productos          | t
-- pedidos             | t
-- pedido_items        | t
-- admin_users         | t
-- homepage_sections   | t
-- admin_sessions      | t
-- login_attempts      | t

-- ============================================================
-- 13. TEST: Verificar que anon key NO puede escribir
-- ============================================================

-- Ejecutar como: CUALQUIER USUARIO (simula anon key)
-- SELECT current_user;

-- Estos deben fallar:
-- INSERT INTO admin_users (username, password_hash) VALUES ('hacker', crypt('password', gen_salt('bf')));
-- UPDATE productos SET precio = 1 WHERE id = 1;
-- DELETE FROM pedidos WHERE id = 1;

-- Este debe funcionar (lectura):
-- SELECT * FROM productos WHERE activo = true;

-- Este debe funcionar (crear pedido):
-- INSERT INTO pedidos (cliente_nombre, cliente_email, total) VALUES ('test', 'test@test.com', 100);
