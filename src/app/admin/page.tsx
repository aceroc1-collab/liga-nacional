import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlayers } from '@/lib/data'
import PhotoUploader from './PhotoUploader'
import { InscriptionsTable, MatchesTable } from './AdminTables'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Panel Admin' }

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = profile && ['admin','coordinador'].includes(profile.role)

  if (!isStaff) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-black text-noche">Panel de la Liga</h1>
        <p className="mt-2 text-slate-500">Tu cuenta ({user.email}) no tiene permisos de staff todavía.</p>
        <p className="mt-1 text-sm text-slate-400">Un administrador debe cambiar tu rol a <code>admin</code> o <code>coordinador</code> en la tabla <code>profiles</code>.</p>
      </div>
    )
  }

  const [insc, matches, players] = await Promise.all([
    supabase.from('inscriptions').select('*').in('status', ['pendiente','borrador']).order('created_at', { ascending: false }),
    supabase.from('matches').select('id, round_label, home_rubbers, away_rubbers, home:home_team_id(name), away:away_team_id(name)').neq('status','finalizado').limit(50),
    getPlayers(),
  ])

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Panel de la Liga</h1>
      <p className="mt-1 text-slate-500">Hola {profile?.full_name ?? user.email} · rol {profile?.role}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <InscriptionsTable rows={insc.data ?? []} />
        <MatchesTable rows={(matches.data ?? []) as any[]} />
        <PhotoUploader players={players} />
      </div>
    </div>
  )
}
