import Link from 'next/link'
import { getPlayerRanking, getDualRanking, getTeamStandings, getRegions, getCategories, getRankingPulse } from '@/lib/data'
import { SPORTS } from '@/lib/config'
import type { Sport, Category, Region } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Rankings' }

type Search = { tab?: string; sport?: string; region?: string; genero?: string; cat?: string; q?: string; orden?: string }

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
  const genero = searchParams.genero ?? 'M'
  const cat = searchParams.cat ?? ''
  const region = searchParams.region ?? ''
  const q = searchParams.q ?? ''
  const orden = searchParams.orden ?? 'puntos'
  const [regions, categories] = await Promise.all([getRegions(), getCategories()])
  const regionName = (id: string | null) => regions.find(r => r.id === id)?.name ?? '—'

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Rankings</h1>
      <p className="mt-1 text-slate-500">Individual por deporte, género, categoría y zona · Atleta Dual · Clasificación de equipos.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tab href="/rankings?tab=dual" active={tab === 'dual'}>🏆 Atleta Dual</Tab>
        <Tab href="/rankings?tab=individual&sport=padel" active={tab === 'individual' && sport === 'padel'}>🎾 Pádel</Tab>
        <Tab href="/rankings?tab=individual&sport=playa" active={tab === 'individual' && sport === 'playa'}>🏖️ Tenis Playa</Tab>
        <Tab href="/rankings?tab=teams&sport=padel" active={tab === 'teams' && sport === 'padel'}>Equipos Pádel</Tab>
        <Tab href="/rankings?tab=teams&sport=playa" active={tab === 'teams' && sport === 'playa'}>Equipos Playa</Tab>
      </div>

      <div className="mt-6">
        {tab === 'dual' && <DualTable regionName={regionName} />}
        {tab === 'individual' && <IndividualTable sport={sport} genero={genero} cat={cat} region={region} q={q} orden={orden} categories={categories} regions={regions} regionName={regionName} />}
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

async function IndividualTable({
  sport, genero, cat, region, q, orden, categories, regions, regionName,
}: {
  sport: Sport; genero: string; cat: string; region: string; q: string; orden: string;
  categories: Category[]; regions: Region[]; regionName: (id: string | null) => string
}) {
  const s = SPORTS[sport]
  const divisions = Array.from(
    new Map(categories.filter(c => c.sport === sport).map(c => [c.name, c.level_label])).entries()
  ).map(([name, label]) => ({ name, label }))
  // Tenis playa incluye Mixto como género; pádel solo M/F
  const genders = sport === 'playa'
    ? [['M','Masculino'],['F','Femenino'],['Mixto','Mixto']]
    : [['M','Masculino'],['F','Femenino']]
  const [rows, pulse] = await Promise.all([
    getPlayerRanking(sport, {
      gender: genero || undefined,
      categoryName: cat || undefined,
      regionId: region || undefined,
      search: q || undefined,
      orden,
    }),
    getRankingPulse(sport),
  ])
  const lider = rows[0]
  const top = pulse[0]
  const fecha = top?.updated_at
    ? new Date(top.updated_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 truncate text-xl font-black text-noche">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="p-5 text-white" style={{ backgroundColor: s.color }}>
        <h2 className="text-lg font-bold">{s.icon} Ranking Individual · {s.label}</h2>
      </div>

      {/* Pulso del ranking (estilo circuito pro) */}
      <div className="grid gap-3 border-b border-slate-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total jugadores" value={String(rows.length)} sub="en este filtro" />
        <Stat label="Líder actual" value={lider ? lider.full_name : '—'}
              sub={lider ? `${lider.points} pts · Nivel ${Number(lider.hidden_rating ?? 1500).toFixed(0)}` : undefined} />
        <Stat label="Mayor subida" value={top && Number(top.delta) > 0 ? `+${Number(top.delta).toFixed(1)}` : '—'}
              sub={top && Number(top.delta) > 0 ? top.full_name : 'sin movimientos aún'} />
        <Stat label="Última actualización" value={fecha} sub="del motor de nivel" />
      </div>

      {/* Filtros estilo circuito profesional (FITP / SNP) */}
      <form method="get" action="/rankings" className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50 p-4">
        <input type="hidden" name="tab" value="individual" />
        <input type="hidden" name="sport" value={sport} />
        <div>
          <label className="block text-xs font-semibold text-slate-500">Género</label>
          <select name="genero" defaultValue={genero} className="input mt-1 !py-2">
            {genders.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Categoría / División</label>
          <select name="cat" defaultValue={cat} className="input mt-1 !py-2">
            <option value="">Todas las divisiones</option>
            {divisions.map(d => <option key={d.name} value={d.name}>{d.label ? `${d.name} · ${d.label}` : d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Zona / Región</label>
          <select name="region" defaultValue={region} className="input mt-1 !py-2">
            <option value="">Nacional</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500">Ordenar por</label>
          <select name="orden" defaultValue={orden} className="input mt-1 !py-2">
            <option value="puntos">Puntos</option>
            <option value="nivel">Nivel (rating)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500">Buscar jugador</label>
          <input name="q" defaultValue={q} placeholder="Nombre…" className="input mt-1 !py-2" />
        </div>
        <button className="btn-primary !py-2">Filtrar</button>
      </form>

      {rows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr><th className="p-3">#</th><th className="p-3">Jugador</th><th className="p-3">Equipo</th>
              <th className="p-3">Zona</th><th className="p-3 text-center">PJ</th>
              <th className="p-3 text-right">Nivel</th><th className="p-3 text-right">Puntos</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, idx) => (
              <tr key={`${r.player_id}-${r.category_id ?? 'x'}`} className="hover:bg-slate-50">
                <td className="p-3 font-black text-slate-300">{idx + 1}</td>
                <td className="p-3"><Link href={r.slug ? `/jugadores/${r.slug}` : '#'} className="flex items-center gap-3 font-semibold hover:text-pista">
                  <Avatar name={r.full_name} url={r.photo_url} />{r.full_name}</Link></td>
                <td className="p-3 text-slate-500">{r.team_name ?? '—'}</td>
                <td className="p-3 text-slate-500">{regionName(r.region_id)}</td>
                <td className="p-3 text-center text-slate-500">{r.matches_played}</td>
                <td className="p-3 text-right font-bold text-pista">{Number((r as any).hidden_rating ?? 1500).toFixed(2)}</td>
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
    Sin resultados para este filtro todavía. Cambia de categoría, género o zona, o carga resultados en el panel admin.</p>
}
