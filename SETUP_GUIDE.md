# 🚀 GUÍA: Configurar la Web en Netlify

## PASO 1: Configurar Variables Locales (AHORA)

### 1️⃣ Obtener el Service Role Key de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto "papeleria-ultra"
3. Menú izq: **Settings** > **API**
4. Busca **Service role secret** 
5. Haz click en el botón de copiar (icono junto a la key)
6. Abre el archivo `.env.local` en la carpeta `papeleria-ultra.-main/`
7. Reemplaza este valor:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
   ```
   Con tu key real (pega todo el contenido)

### 2️⃣ Generar un ADMIN_TOKEN seguro

En PowerShell, ejecuta:
```powershell
[guid]::NewGuid().ToString("N")
```

Esto genera algo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

Reemplaza en `.env.local`:
```
ADMIN_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3️⃣ Guardar el archivo

- El archivo `.env.local` ya está en `.gitignore`, así que no se commitea
- Solo quedará en tu computadora

---

## PASO 2: Ejecutar SQL en Supabase (CRÍTICO)

Este paso HABILITA la seguridad en tu base de datos.

1. Ve a https://app.supabase.com > Tu proyecto > **SQL Editor**
2. Click botón **+ New query** (o Copy+Paste en un editor vacío)
3. Abre el archivo `supabase-rls-hardening.sql` (en raíz del repo)
4. Copia TODO el contenido
5. Pégalo en Supabase SQL Editor
6. Click en **RUN** (ejecutar)

⏳ Espera a que termine (unos 10-15 segundos)

✅ Si no hay errores rojos = Listo!

---

## PASO 3: Probar Localmente (OPCIONAL)

```bash
cd D:\web-paula-pintos\papeleria-ultra.-main
npm run dev
```

Accede a http://localhost:3000

Pruebas:
- ✅ Puedes ver la página principal
- ✅ El catálogo carga productos
- ✅ Ir a http://localhost:3000/admin/login
- ✅ Intentar loguear (forzarás un error porque no hay usuario admin en BD)

---

## PASO 4: Crear Usuario Admin en Supabase

### Generar contraseña hasheada

En PowerShell:

```powershell
# Primero, abre Node.js
node

# Dentro de Node.js, pega esto:
const bcrypt = require('bcrypt');
const password = 'TU_CONTRASEÑA_SEGURA_AQUI';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);

# Copia el hash que aparece
# Sale algo como: $2b$10$abcdefghijklmnopqrstuvwxyz123456789
```

### Insertar en Supabase

1. Ve a Supabase > SQL Editor > New query
2. Pega esto:

```sql
INSERT INTO admin_users (username, password_hash, activo)
VALUES (
  'paula',
  '$2b$10$PEGA_EL_HASH_AQUI',
  true
);
```

3. Click RUN

✅ Listo! Ya tienes usuario admin "paula"

---

## PASO 5: Configurar Netlify

### 5.1 Conectar Repo

1. Ve a https://app.netlify.com
2. Click **Add new site** > **Import an existing project**
3. Selecciona **GitHub**
4. Busca el repo: `libcadis/libcadise-os`
5. Click Import
6. Netlify detectará automáticamente que es Next.js

### 5.2 Agregar Variables de Entorno

En Netlify:
1. **Build & deploy** > **Environment**
2. Click **Edit variables**
3. Agregar estas variables:

| Variable | Valor |
|----------|-------|
| `ADMIN_TOKEN` | El UUID que generaste |
| `SUPABASE_SERVICE_ROLE_KEY` | El key de Supabase |

**OJO**: NO agregar las variables NEXT_PUBLIC_* (esas son públicas y ya están en el código)

### 5.3 Desplegar

1. Click **Deploy site**
2. Espera a que termine (2-3 minutos)
3. Tu sitio está en vivo en: `https://NOMBRE.netlify.app`

---

## PASO 6: Probar en Netlify

1. Ve a tu URL de Netlify
2. Navega a `/admin/login`
3. Intenta loguear con:
   - Usuario: `paula`
   - Contraseña: La que usaste para generar el hash

✅ Si entra al panel = Todo funciona!

---

## 🐛 Si algo falla

### Error: "Demasiados intentos fallidos"
- Espera 15 minutos (rate limit activo)
- O borra registros de `login_attempts` en Supabase SQL Editor

### Error: "Contraseña inválida" 
- Verifica que el hash se generó correctamente
- El hash comienza con `$2b$10$` (indica bcrypt)

### Error: "Error de autenticación"
- Verifica que SUPABASE_SERVICE_ROLE_KEY es correcta
- No debe tener espacios al principio/final

### Netlify no compila
- Verifica que `.env.local` NO está siendo commiteado (debe estar en .gitignore)
- Verifica que las variables en Netlify Environment están bien

---

## 📋 CHECKLIST FINAL

- [ ] `.env.local` creado con ADMIN_TOKEN y SERVICE_ROLE_KEY
- [ ] SQL de hardening ejecutado en Supabase
- [ ] Usuario admin creado en BD
- [ ] Test local: npm run dev funciona
- [ ] Test local: Admin login funciona
- [ ] Variables agregadas a Netlify
- [ ] Repo subido a GitHub (✓ ya hecho)
- [ ] Sitio desplegado en Netlify
- [ ] URL del sitio prueba correctamente

---

## 🔒 SEGURIDAD

**No hagas esto**:
- ❌ Commitear `.env.local` a Git (ya está en .gitignore)
- ❌ Compartir el SERVICE_ROLE_KEY por chat
- ❌ Usar contraseña débil para admin
- ❌ Deixar la anon_key expuesta en pública

**Haz esto**:
- ✅ Guardar variables en Netlify Environment
- ✅ Rotarlas cada 30 días
- ✅ Si ves que fueron comprometidas, regenerarlas inmediatamente
