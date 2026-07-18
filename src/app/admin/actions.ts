'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireStaff() {
  const s = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: p } = await s.from('profiles').select('role').eq('id', user.id).single()
  if (!p || !['admin','coordinador'].includes(p.role)) throw new Error('Sin permisos')
  return s
}

export async function confirmInscription(id: string) {
  const s = await requireStaff()
  const { error } = await s.from('inscriptions').update({ status: 'confirmado' }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin'); return { ok: true, message: 'Inscripción confirmada' }
}

export async function rejectInscription(id: string) {
  const s = await requireStaff()
  const { error } = await s.from('inscriptions').update({ status: 'rechazado' }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin'); return { ok: true, message: 'Inscripción rechazada' }
}

export async function finalizeMatch(id: string, home: number, away: number) {
  const s = await requireStaff()
  const { error } = await s.from('matches')
    .update({ home_rubbers: home, away_rubbers: away, status: 'finalizado' }).eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin'); revalidatePath('/rankings')
  return { ok: true, message: 'Eliminatoria finalizada · puntos otorgados' }
}

export async function setPlayerPhoto(playerId: string, url: string) {
  const s = await requireStaff()
  const { error } = await s.from('players').update({ photo_url: url }).eq('id', playerId)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin'); return { ok: true, message: 'Foto actualizada' }
}
