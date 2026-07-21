import Link from 'next/link'
import { getPlayerRanking, getDualRanking, getTeamStandings, getRegions } from '@/lib/data'
import { SPORTS } from '@/lib/config'
import type { Sport } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Rankings' }

type Search = { tab?: string; sport?: string; region?: string }

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${active ? 'bg-noche text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
      {children}
    </Link>
  )
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover" />
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
      {name.split(' ').map(n => n[0]).slice(0,2).join('')}
    </div>
  )
}

export default async function RankingsPage({ searchParams }: { searchParams: Search }) {
  const tab = searchParams.tab ?? (searchParams.sport ? 'individual' : 'dual')
  const sport = (searchParams.sport as Sport) ?? 'padel'
  const regions = await getRegions()
  const regionName = (id: string | null) => regions.find(r => r.id === id)?.name ?? '—'

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Rankings</h1>
      <p className="mt-1 text-slate-500">Individual por deporte · Atleta Dual · Clasificación de equipos.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tab href="/rankings?tab=dual" active={tab === 'dual'}>🏆 Atleta Dual</Tab>
        <Tab href="/rankings?tab=individual&sport=padel" active={tab === 'individual' && sport === 'padel'}>🎾 Pádel</Tab>
        <Tab href="/rankings?tab=individual&sport=playa" active={tab === 'individual' && sport === 'playa'}>🏖️ Tenis Playa</Tab>
        <Tab href="/rankings?tab=teams&sport=padel" active={tab === 'teams' && sport === 'padel'}>Equipos Pádel</Tab>
        <Tab href="/rankings?tab=teams&sport=playa" active={tab === 'teams' && sport === 'playa'}>Equipos Playa</Tab>
      </div>

      <div className="mt-6">
        {tab === 'dual' && <DualTable regionName={regionName} />}
        {tab === 'individual' && <IndividualTable sport={sport} regionName={regionName} />}
        {tab === 'teams' && <TeamsTable sport={sport} regionName={regionName} />}
      </div>
    </div>
  )
}

async function DualTable({ regionName }: { regionName: (id: string | null) => string }) {
  const rows = await getDualRanking()
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-noche to-pista p-5 text-white">
        <div><h2 className="text-lg font-bold">Ranking Atleta Dual</h2>
          <p className="text-sm text-white/70">Pádel + Playa · ranking combinado de ambas disciplinas</p></div>
      </div>
      {rows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr><th className="p-3">#</th><th className="p-3">Atleta</th><th className="p-3">Región</th>
              <th className="p-3 text-right">Pádel</th><th className="p-3 text-right">Playa</th><th className="p-3 text-right">Dual Score</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(d => (
              <tr key={d.player_id} className="hover:bg-slate-50">
                <td className="p-3 font-black text-slate-300">{d.position}</td>
                <td className="p-3"><Link href={d.slug ? `/jugadores/${d.slug}` : '#'} className="flex items-center gap-3 font-semibold hover:text-pista">
                  <Avatar name={d.full_name} url={d.photo_url} />{d.full_name}</Link></td>
                <td className="p-3 text-slate-500">{regionName(d.region_id)}</td>
                <td className="p-3 text-right">{d.padel_points}</td>
                <td className="p-3 text-right">{d.playa_points}</td>
                <td className="p-3 text-right text-lg font-black text-noche">{d.dual_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

async function IndividualTable({ sport, regionName }: { sport: Sport; regionName: (id: string | null) => string }) {
  const rows = await getPlayerRanking(sport)
  const s = SPORTS[sport]
  return (
    <div className="card overflow-hidden">
      <div className="p-5 text-white" style={{ backgroundColor: s.color }}>
        <h2 className="text-lg font-bold">{s.icon} Ranking Individual · {s.label}</h2>
      </div>
      {rows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr><th className="p-3">#</th><th className="p-3">Jugador</th><th className="p-3">Región</th>
              <th className="p-3 text-center">PJ</th><th className="p-3 text-right">Puntos</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.player_id} className="hover:bg-slate-50">
                <td className="p-3 font-black text-slate-300">{r.position}</td>
                <td className="p-3"><Link href={r.slug ? `/jugadores/${r.slug}` : '#'} className="flex items-center gap-3 font-semibold hover:text-pista">
                  <Avatar name={r.full_name} url={r.photo_url} />{r.full_name}</Link></td>
                <td className="p-3 text-slate-500">{regionName(r.region_id)}</td>
                <td className="p-3 text-center text-slate-500">{r.matches_played}</td>
                <td className="p-3 text-right text-lg font-black text-noche">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

async function TeamsTable({ sport, regionName }: { sport: Sport; regionName: (id: string | null) => string }) {
  const rows = await getTeamStandings(sport)
  const s = SPORTS[sport]
  return (
    <div className="card overflow-hidden">
      <div className="p-5 text-white" style={{ backgroundColor: s.color }}>
        <h2 className="text-lg font-bold">Clasificación de Equipos · {s.label}</h2>
      </div>
      {rows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr><th className="p-3">#</th><th className="p-3">Equipo</th><th className="p-3">Región</th>
              <th className="p-3 text-center">PJ</th><th className="p-3 text-center">G</th><th className="p-3 text-center">P</th>
              <th className="p-3 text-right">Puntos</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(t => (
              <tr key={t.team_id} className="hover:bg-slate-50">
                <td className="p-3 font-black text-slate-300">{t.position}</td>
                <td className="p-3 font-semibold">{t.name}</td>
                <td className="p-3 text-slate-500">{regionName(t.region_id)}</td>
                <td className="p-3 text-center text-slate-500">{t.played}</td>
                <td className="p-3 text-center text-emerald-600">{t.wins}</td>
                <td className="p-3 text-center text-rose-500">{t.losses}</td>
                <td className="p-3 text-right text-lg font-black text-noche">{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Empty() {
  return <p className="p-8 text-center text-sm text-slate-400">
    Aún no hay datos. Corre <code>supabase/seed.sql</code> o carga resultados en el panel admin.</p>
}
