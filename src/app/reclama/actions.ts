'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ClaimResult = { ok: boolean; message: string }

export async function claimProfile(fd: FormData): Promise<ClaimResult> {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return { ok: false, message: 'Debes iniciar sesión para reclamar tu perfil.' }

  const email = (user.email || '').toLowerCase().trim()
  const cedula = String(fd.get('cedula') || '').replace(/[^0-9]/g, '') || null
  const regionId = String(fd.get('region_id') || '') || null
  if (!regionId) return { ok: false, message: 'Selecciona tu zona / región.' }

  // Buscar el jugador prospecto: por correo (que el usuario controla) o por cédula
  const db = createAdminClient()
  let { data: matches } = await db.from('players')
    .select('id, full_name, email, cedula, status, user_id')
    .or(`email.eq.${email}${cedula ? `,cedula.eq.${cedula}` : ''}`)
    .limit(5)

  const player = (matches || []).find((p: any) => p.status === 'prospecto' && !p.user_id)
    || (matches || []).find((p: any) => !p.user_id)

  if (!player) {
    return { ok: false, message: 'No encontramos un perfil sin reclamar con tu correo o cédula. Si crees que es un error, escríbenos por Reclamos.' }
  }

  const { error } = await db.from('players')
    .update({ status: 'activo', region_id: regionId, user_id: user.id })
    .eq('id', player.id)
  if (error) return { ok: false, message: `No se pudo reclamar: ${error.message}` }

  ;['/', '/rankings', '/estadisticas', `/jugadores`].forEach(p => revalidatePath(p))
  return { ok: true, message: `¡Listo, ${player.full_name}! Tu perfil quedó activo y visible. Bienvenido a ArenaPadel Tour.` }
}
