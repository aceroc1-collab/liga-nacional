import { createClient } from '@supabase/supabase-js'

// Cliente con service-role: SOLO para uso en servidor (cron, jobs).
// Bypassa RLS. La clave NUNCA debe llegar al navegador (no lleva NEXT_PUBLIC_).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
