import { notFound } from 'next/navigation'
import { getPlayerBySlug, getRegions } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function playerPoints(playerId: string) {
  try {
    const s = createClient()
    const { data } = await s.from('player_points').select('sport, points').eq('player_id', playerId)
    const padel = (data ?? []).filter(d => d.sport === 'padel').reduce((a, d) => a + Number(d.points), 0)
    const playa = (data ?? []).filter(d => d.sport === 'playa').reduce((a, d) => a + Number(d.points), 0)
    return { padel, playa }
  } catch { return { padel: 0, playa: 0 } }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayerBySlug(params.id)
  if (!player) notFound()
  const [regions, pts] = await Promise.all([getRegions(), playerPoints(player.id)])
  const region = regions.find(r => r.id === player.region_id)?.name ?? '—'
  return (
    <div>
      <div className="h-48 bg-gradient-to-br from-pista to-noche"
        style={player.cover_url ? { backgroundImage: `url(${player.cover_url})`, backgroundSize: 'cover' } : {}} />
      <div className="container-app -mt-20">
        <div className="card p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            {player.photo_url
              ? <img src={player.photo_url} className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white" alt={player.full_name} />
              : <div className="grid h-28 w-28 place-items-center rounded-2xl bg-slate-100 text-3xl font-black text-slate-400 ring-4 ring-white">
                  {player.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-noche">{player.full_name}</h1>
                {player.is_dual && <span className="badge bg-brasa/10 text-brasa">⭐ Atleta Dual</span>}
              </div>
              <p className="text-slate-500">{region}{player.city ? ` · ${player.city}` : ''}</p>
              <div className="mt-2 flex gap-2 text-xs">
                {player.plays_padel && <span className="badge bg-pista/10 text-pista">🎾 Pádel</span>}
                {player.plays_playa && <span className="badge bg-arena/20 text-amber-700">🏖️ Tenis Playa</span>}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center"><div className="text-2xl font-black text-pista">{pts.padel}</div><div className="text-xs text-slate-400">Pts Pádel</div></div>
              <div className="text-center"><div className="text-2xl font-black text-amber-500">{pts.playa}</div><div className="text-xs text-slate-400">Pts Playa</div></div>
              {player.is_dual && <div className="text-center"><div className="text-2xl font-black text-noche">{Math.round((pts.padel+pts.playa)*1.15)}</div><div className="text-xs text-slate-400">Dual Score</div></div>}
            </div>
          </div>
          {player.bio && <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">{player.bio}</p>}
        </div>
      </div>
    </div>
  )
}
