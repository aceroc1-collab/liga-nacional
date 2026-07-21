'use server'
// Recálculo manual del rating oculto (botón del panel admin).
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { runRecompute, RecomputeResult } from '@/lib/ranking/recompute'

async function requireStaff(): Promise<any> {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: p } = await s.from('profiles').select('role').eq('id', user.id).single()
  if (!p || !['admin', 'coordinador'].includes(p.role)) throw new Error('Sin permisos')
  return s
}

export async function recomputeHiddenRatings(): Promise<RecomputeResult> {
  const s = await requireStaff()
  const r = await runRecompute(s)
  ;['/rankings', '/admin', '/'].forEach(p => revalidatePath(p))
  return r
}
