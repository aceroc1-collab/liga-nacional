'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Devuelve el cliente como `any` a propósito: las acciones usan FormData y no
// necesitan el tipado profundo de Supabase (que ralentiza mucho el type-check).
async function requireStaff(): Promise<any> {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: p } = await s.from('profiles').select('role').eq('id', user.id).single()
  if (!p || !['admin','coordinador'].includes(p.role)) throw new Error('Sin permisos')
  return s
}
type R = { ok: boolean; message: string }
const ok = (m: string): R => ({ ok: true, message: m })
const err = (m: string): R => ({ ok: false, message: m })
const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

function revalidateAll() {
  ;['/admin','/rankings','/clubes','/patrocinios','/resultados','/'].forEach(p => revalidatePath(p))
}

// ---------- INSCRIPCIONES ----------
export async function confirmInscription(id: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('inscriptions').update({ status: 'confirmado' }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Inscripción confirmada')
}
export async function rejectInscription(id: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('inscriptions').update({ status: 'rechazado' }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Inscripción rechazada')
}
export async function deleteInscription(id: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('inscriptions').delete().eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Solicitud eliminada')
}

// ---------- CLUBES ----------
export async function createClub(fd: FormData): Promise<R> {
  const s = await requireStaff()
  const name = String(fd.get('name') || '').trim()
  if (!name) return err('El nombre es obligatorio')
  const { error } = await s.from('clubs').insert({
    name, slug: slugify(name) + '-' + Math.random().toString(36).slice(2,6),
    region_id: fd.get('region_id') || null, city: fd.get('city') || null,
    has_padel: fd.get('has_padel') === 'on', has_playa: fd.get('has_playa') === 'on',
    padel_courts: Number(fd.get('padel_courts') || 0), playa_courts: Number(fd.get('playa_courts') || 0),
    contact_name: fd.get('contact_name') || null, contact_phone: fd.get('contact_phone') || null,
    instagram: fd.get('instagram') || null, is_verified: fd.get('is_verified') === 'on',
  })
  if (error) return err(error.message); revalidateAll(); return ok('Club creado')
}
export async function deleteClub(id: string): Promise<R> {
  const s = await requireStaff()
  // Desvincula el club de todo lo que lo referencia (no borra equipos/jugadores, solo los desliga)
  await s.from('teams').update({ club_id: null }).eq('club_id', id)
  await s.from('players').update({ home_club_id: null }).eq('home_club_id', id)
  await s.from('inscriptions').update({ club_id: null }).eq('club_id', id)
  await s.from('matches').update({ venue_club_id: null }).eq('venue_club_id', id)
  await s.from('profiles').update({ club_id: null }).eq('club_id', id)
  const { error } = await s.from('clubs').delete().eq('id', id)
  if (error) return err(error.message)
  revalidateAll(); return ok('Club eliminado')
}

// ---------- JUGADORES ----------
export async function createPlayer(fd: FormData): Promise<R> {
  const s = await requireStaff()
  const name = String(fd.get('full_name') || '').trim()
  if (!name) return err('El nombre es obligatorio')
  const { error } = await s.from('players').insert({
    full_name: name, slug: slugify(name) + '-' + Math.random().toString(36).slice(2,5),
    gender: fd.get('gender') || 'M', region_id: fd.get('region_id') || null,
    home_club_id: fd.get('home_club_id') || null, cedula: fd.get('cedula') || null,
    city: fd.get('city') || null, phone: fd.get('phone') || null, instagram: fd.get('instagram') || null,
    plays_padel: fd.get('plays_padel') === 'on', plays_playa: fd.get('plays_playa') === 'on',
    photo_url: fd.get('photo_url') || null,
  })
  if (error) return err(error.message); revalidateAll(); return ok('Jugador creado')
}
export async function deletePlayer(id: string): Promise<R> {
  const s = await requireStaff()
  // Desvincula referencias que no borran en cascada (capitanías y parejas de partidos)
  await s.from('teams').update({ captain_player_id: null }).eq('captain_player_id', id)
  await s.from('match_rubbers').update({ home_p1: null }).eq('home_p1', id)
  await s.from('match_rubbers').update({ home_p2: null }).eq('home_p2', id)
  await s.from('match_rubbers').update({ away_p1: null }).eq('away_p1', id)
  await s.from('match_rubbers').update({ away_p2: null }).eq('away_p2', id)
  const { error } = await s.from('players').delete().eq('id', id)
  if (error) return err(error.message)
  revalidateAll(); return ok('Jugador eliminado')
}
export async function setPlayerPhoto(playerId: string, url: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('players').update({ photo_url: url }).eq('id', playerId)
  if (error) return err(error.message); revalidateAll(); return ok('Foto actualizada')
}

// ---------- EQUIPOS ----------
export async function createTeam(fd: FormData): Promise<R> {
  const s = await requireStaff()
  const name = String(fd.get('name') || '').trim()
  const season_id = fd.get('season_id'); const sport = fd.get('sport')
  const category_id = fd.get('category_id'); const region_id = fd.get('region_id')
  if (!name || !season_id || !sport || !category_id || !region_id)
    return err('Faltan campos (nombre, deporte, categoría, región)')
  const { error } = await s.from('teams').insert({
    name, slug: slugify(name) + '-' + Math.random().toString(36).slice(2,5),
    season_id, sport, category_id, region_id,
    club_id: fd.get('club_id') || null, colors: fd.get('colors') || null,
  })
  if (error) return err(error.message); revalidateAll(); return ok('Equipo creado')
}
export async function deleteTeam(id: string): Promise<R> {
  const s = await requireStaff()
  // Borra primero lo que depende del equipo (partidos e inscripciones), para evitar errores de FK
  await s.from('matches').delete().or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
  await s.from('inscriptions').delete().eq('team_id', id)
  const { error } = await s.from('teams').delete().eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Equipo eliminado (con sus partidos)')
}
export async function addTeamPlayer(teamId: string, playerId: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('team_players').insert({ team_id: teamId, player_id: playerId })
  if (error) return err(error.message); revalidateAll(); return ok('Jugador agregado al equipo')
}
export async function removeTeamPlayer(teamId: string, playerId: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('team_players').delete().eq('team_id', teamId).eq('player_id', playerId)
  if (error) return err(error.message); revalidateAll(); return ok('Jugador quitado del equipo')
}

// ---------- PATROCINADORES ----------
export async function createSponsor(fd: FormData): Promise<R> {
  const s = await requireStaff()
  const name = String(fd.get('name') || '').trim()
  if (!name) return err('El nombre es obligatorio')
  const { error } = await s.from('sponsors').insert({
    name, tier: fd.get('tier') || 'categoria',
    sport_scope: fd.get('sport_scope') || null, website: fd.get('website') || null,
    description: fd.get('description') || null, logo_url: fd.get('logo_url') || null,
    sort_order: Number(fd.get('sort_order') || 0),
  })
  if (error) return err(error.message); revalidateAll(); return ok('Patrocinador creado')
}
export async function deleteSponsor(id: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('sponsors').delete().eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Patrocinador eliminado')
}

// ---------- PARTIDOS / RESULTADOS ----------
export async function createMatch(fd: FormData): Promise<R> {
  const s = await requireStaff()
  const season_id = fd.get('season_id'); const sport = fd.get('sport')
  const home = fd.get('home_team_id'); const away = fd.get('away_team_id')
  if (!season_id || !sport || !home || !away) return err('Faltan equipos o deporte')
  if (home === away) return err('El local y el visitante no pueden ser el mismo equipo')
  const { error } = await s.from('matches').insert({
    season_id, sport, phase: fd.get('phase') || 'regular',
    region_id: fd.get('region_id') || null, category_id: fd.get('category_id') || null,
    round_label: fd.get('round_label') || null,
    home_team_id: home, away_team_id: away, status: 'programado',
  })
  if (error) return err(error.message); revalidateAll(); return ok('Partido creado')
}
export async function finalizeMatch(id: string, home: number, away: number): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('matches')
    .update({ home_rubbers: home, away_rubbers: away, status: 'finalizado' }).eq('id', id)
  if (error) return err(error.message); revalidateAll()
  return ok('Partido finalizado · puntos otorgados automáticamente')
}
export async function deleteMatch(id: string): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('matches').delete().eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Partido eliminado')
}

// ---------- EDICIÓN (UPDATE) ----------
export async function updateClub(id: string, fd: FormData): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('clubs').update({
    name: fd.get('name'), region_id: fd.get('region_id') || null, city: fd.get('city') || null,
    has_padel: fd.get('has_padel') === 'on', has_playa: fd.get('has_playa') === 'on',
    padel_courts: Number(fd.get('padel_courts') || 0), playa_courts: Number(fd.get('playa_courts') || 0),
    contact_name: fd.get('contact_name') || null, contact_phone: fd.get('contact_phone') || null,
    instagram: fd.get('instagram') || null, is_verified: fd.get('is_verified') === 'on',
  }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Club actualizado')
}
export async function updatePlayer(id: string, fd: FormData): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('players').update({
    full_name: fd.get('full_name'), gender: fd.get('gender') || 'M',
    region_id: fd.get('region_id') || null, home_club_id: fd.get('home_club_id') || null,
    cedula: fd.get('cedula') || null, city: fd.get('city') || null, phone: fd.get('phone') || null,
    instagram: fd.get('instagram') || null, photo_url: fd.get('photo_url') || null,
    plays_padel: fd.get('plays_padel') === 'on', plays_playa: fd.get('plays_playa') === 'on',
  }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Jugador actualizado')
}
export async function updateTeam(id: string, fd: FormData): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('teams').update({
    name: fd.get('name'), category_id: fd.get('category_id'), region_id: fd.get('region_id'),
    club_id: fd.get('club_id') || null, colors: fd.get('colors') || null,
  }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Equipo actualizado')
}
export async function updateSponsor(id: string, fd: FormData): Promise<R> {
  const s = await requireStaff()
  const { error } = await s.from('sponsors').update({
    name: fd.get('name'), tier: fd.get('tier') || 'categoria',
    sport_scope: fd.get('sport_scope') || null, website: fd.get('website') || null,
    description: fd.get('description') || null, logo_url: fd.get('logo_url') || null,
    sort_order: Number(fd.get('sort_order') || 0),
  }).eq('id', id)
  if (error) return err(error.message); revalidateAll(); return ok('Patrocinador actualizado')
}

// ---------- GESTIÓN DE ADMINISTRADORES (ROLES) ----------
export async function setUserRole(userId: string, role: string): Promise<R> {
  const s = await requireStaff()
  // Solo un admin puede crear otros admin/coordinadores
  const { data: { user } } = await s.auth.getUser()
  const { data: me } = await s.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return err('Solo un administrador principal puede cambiar roles')
  const { error } = await s.from('profiles').update({ role }).eq('id', userId)
  if (error) return err(error.message); revalidateAll(); return ok('Rol actualizado a ' + role)
}

// Asignar la Zona/Region a un usuario (Coordinador Regional). Solo admin.
export async function setUserRegion(userId: string, regionId: string): Promise<R> {
  const s = await requireStaff()
  const { data: { user } } = await s.auth.getUser()
  const { data: me } = await s.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return err('Solo un administrador principal puede asignar regiones')
  const { error } = await s.from('profiles').update({ region_id: regionId || null }).eq('id', userId)
  if (error) return err(error.message); revalidateAll(); return ok('Zona/Región asignada')
}
