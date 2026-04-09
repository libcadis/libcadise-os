import { createClient } from "@supabase/supabase-js"

// ⚠️ SOLO usar claves PÚBLICAS en el frontend
// Las variables NEXT_PUBLIC_* son públicas por diseño
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Para operaciones que necesitan permisos elevados,
// NUNCA importar esto en componentes de cliente
// Solo usar en rutas API (/api/...)
export const createAdminClient = () => {
  // Seguridad: asegurarse que esto solo se ejecuta en servidor
  if (typeof window !== 'undefined') {
    throw new Error(
      'Admin client must not be used on frontend. ' +
      'Use backend API routes with service_role_key instead.'
    )
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
