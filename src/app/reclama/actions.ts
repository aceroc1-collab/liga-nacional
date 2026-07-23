'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ClaimResult = { ok: boolean; message: string }
export type ProfileHit = { id: string; full_name: string; tier: string | null }
export type SearchResult = { ok: boolean; items: ProfileHit[]; message?: string }

// Búsqueda por nombre: devuelve perfiles SIN reclamar que coinciden con lo escrito.
export async function searchProfiles(query: string): Promise<SearchResult> {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return { ok: false, items: [], message: 'Debes iniciar sesión para buscar tu perfil.' }

  const tokens = String(query || '')
    .toLowerCase()
    .replace(/[,]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean)
  if (tokens.join('').length < 3) return { ok: true, items: [] }

  const db = createAdminClient()
  let q = db.from('players')
    .select('id, full_name')
    .is('user_id', null)
    .eq('status', 'prospecto')
  for (const t of tokens) q = q.ilike('full_name', `%${t}%`)
  const { data } = await q.order('full_name').limit(15)

  const ids = (data || []).map((p: any) => p.id)
  const levels: Record<string, string> = {}
  if (ids.length) {
    const { data: rs } = await db.from('player_ratings')
      .select('player_id, category').eq('sport', 'padel').in('player_id', ids)
    for (const r of rs || []) levels[r.player_id] = r.category
  }
  const items: ProfileHit[] = (data || []).map((p: any) => ({
    id: p.id, full_name: p.full_name, tier: levels[p.id] ?? null,
  }))
  return { ok: true, items }
}

export async function claimProfile(fd: FormData): Promise<ClaimResult> {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return { ok: false, message: 'Debes iniciar sesión para reclamar tu perfil.' }

  const email = (user.email || '').toLowerCase().trim()
  const cedula = String(fd.get('cedula') || '').replace(/[^0-9]/g, '') || null
  const regionId = String(fd.get('region_id') || '') || null
  const playerId = String(fd.get('player_id') || '') || null
  if (!regionId) return { ok: false, message: 'Selecciona tu zona / región.' }

  const db = createAdminClient()
  let player: any = null

  if (playerId) {
    // El usuario eligió su perfil por nombre
    const { data } = await db.from('players')
      .select('id, full_name, email, cedula, status, user_id')
      .eq('id', playerId).limit(1)
    player = (data || [])[0]
    if (!player) return { ok: false, message: 'No encontramos ese perfil. Búscalo de nuevo, por favor.' }
    if (player.user_id) return { ok: false, message: 'Ese perfil ya fue reclamado. Si crees que es un error, escríbenos por Reclamos.' }
  } else {
    // Auto-match por correo (que el usuario controla) o por cédula
    const { data: matches } = await db.from('players')
      .select('id, full_name, email, cedula, status, user_id')
      .or(`email.eq.${email}${cedula ? `,cedula.eq.${cedula}` : ''}`)
      .limit(5)
    player = (matches || []).find((p: any) => p.status === 'prospecto' && !p.user_id)
      || (matches || []).find((p: any) => !p.user_id)
    if (!player) {
      return { ok: false, message: 'No encontramos un perfil sin reclamar con tu correo o cédula. Búscate por tu nombre arriba, o escríbenos por Reclamos.' }
    }
  }

  const patch: any = { status: 'activo', region_id: regionId, user_id: user.id }
  if (!player.email && email) patch.email = email
  if (!player.cedula && cedula) patch.cedula = cedula

  const { error } = await db.from('players').update(patch).eq('id', player.id)
  if (error) return { ok: false, message: `No se pudo reclamar: ${error.message}` }

  ;['/', '/rankings', '/estadisticas', `/jugadores`].forEach(p => revalidatePath(p))
  return { ok: true, message: `¡Listo, ${player.full_name}! Tu perfil quedó activo y visible. Bienvenido a ArenaPadel Tour.` }
}
