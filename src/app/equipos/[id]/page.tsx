import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SPORTS } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function TeamPage({ params }: { params: { id: string } }) {
  const s = createClient()
  let team: any = null, roster: any[] = []
  try {
    const { data } = await s.from('teams').select('*, club:club_id(name), category:category_id(name, level_label)').eq('slug', params.id).single()
    team = data
    if (team) {
      const { data: tp } = await s.from('team_players').select('is_captain, player:player_id(full_name, slug, photo_url, is_dual)').eq('team_id', team.id)
      roster = tp ?? []
    }
  } catch {}
  if (!team) notFound()
  const sport = SPORTS[team.sport as 'padel' | 'playa']
  return (
    <div className="container-app py-10">
      <div className="card p-6">
        <span className="badge text-white" style={{ backgroundColor: sport.color }}>{sport.icon} {sport.label}</span>
        <h1 className="mt-3 text-2xl font-black text-noche">{team.name}</h1>
        <p className="text-slate-500">{team.club?.name} · {team.category?.name} {team.category?.level_label ? `(${team.category.level_label})` : ''}</p>
      </div>
      <h2 className="mt-8 mb-3 text-lg font-bold">Plantilla</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((r, i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            {r.player?.photo_url
              ? <img src={r.player.photo_url} className="h-12 w-12 rounded-full object-cover" alt="" />
              : <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 font-bold text-slate-400">{r.player?.full_name?.split(' ').map((n:string)=>n[0]).slice(0,2).join('')}</div>}
            <div><div className="font-semibold">{r.player?.full_name}{r.is_captain && ' (C)'}</div>
              {r.player?.is_dual && <span className="badge bg-brasa/10 text-brasa">⭐ Dual</span>}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
