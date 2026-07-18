import { getDashboard } from '@/lib/data'
import { BRAND } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Estadísticas' }

function Kpi({ label, value, sub, color }: { label: string; value: number|string; sub?: string; color?: string }) {
  return (
    <div className="card p-5">
      <div className="text-3xl font-black" style={{ color: color ?? BRAND.colors.noche }}>{value}</div>
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

function Bars({ title, rows, unit, color }:
  { title: string; rows: { name: string; value: number }[]; unit?: string; color: string }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-bold text-noche">{title}</h3>
      {rows.length === 0 ? <p className="text-sm text-slate-400">Aún sin datos.</p> : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate text-slate-600" title={r.name}>{r.name}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(r.value/max)*100}%`, backgroundColor: color }} />
              </div>
              <span className="w-12 shrink-0 text-right font-bold text-noche">{r.value}{unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Podium({ title, rows, unit, color }:
  { title: string; rows: { name: string; value: number }[]; unit: string; color: string }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-bold text-noche">{title}</h3>
      {rows.length === 0 ? <p className="text-sm text-slate-400">Aún sin datos.</p> : (
        <ol className="space-y-2">
          {rows.slice(0,5).map((r, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-slate-200 text-slate-600':i===2?'bg-orange-100 text-orange-700':'bg-slate-100 text-slate-400'}`}>{i+1}</span>
              <span className="flex-1 truncate text-sm font-semibold">{r.name}</span>
              <span className="text-sm font-black" style={{ color }}>{r.value}{unit}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default async function EstadisticasPage() {
  const d = await getDashboard()
  const t = d.totals
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Estadísticas de la Liga</h1>
      <p className="mt-1 text-slate-500">Panorama en vivo de atletas, clubes y competición · {BRAND.country}</p>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Atletas" value={t.players} color={BRAND.colors.noche} />
        <Kpi label="Atletas Duales" value={t.duals} sub={t.players?`${Math.round(t.duals/t.players*100)}% del total`:''} color={BRAND.colors.brasa} />
        <Kpi label="Clubes" value={t.clubs} color={BRAND.colors.padel} />
        <Kpi label="Equipos" value={t.teams} color={BRAND.colors.noche} />
        <Kpi label="Jugadores Pádel" value={t.padelPlayers} color={BRAND.colors.padel} />
        <Kpi label="Jugadores Playa" value={t.playaPlayers} color={BRAND.colors.playa} />
      </div>

      {/* Podios de atletas */}
      <h2 className="mt-10 mb-3 text-lg font-black text-noche">🏆 Mejores atletas</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <Podium title="Ranking Atleta Dual" rows={d.topDual.map(x=>({name:x.name,value:x.score}))} unit=" pts" color={BRAND.colors.brasa} />
        <Podium title="Top Pádel" rows={d.topPadel.map(x=>({name:x.name,value:x.points}))} unit=" pts" color={BRAND.colors.padel} />
        <Podium title="Top Tenis Playa" rows={d.topPlaya.map(x=>({name:x.name,value:x.points}))} unit=" pts" color="#C99A2E" />
      </div>

      {/* Clubes y regiones */}
      <h2 className="mt-10 mb-3 text-lg font-black text-noche">🏟️ Clubes y regiones</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="Clubes por puntos de sus equipos" color={BRAND.colors.noche}
          rows={d.clubs.slice(0,8).map(c=>({name:c.name,value:c.points}))} unit=" pts" />
        <Bars title="Clubes por número de atletas" color={BRAND.colors.padel}
          rows={[...d.clubs].sort((a,b)=>b.players-a.players).slice(0,8).map(c=>({name:c.name,value:c.players}))} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Bars title="Atletas por región" color={BRAND.colors.brasa}
          rows={d.byRegion.map(r=>({name:r.name,value:r.players}))} />
        <Bars title="Equipos por región" color={BRAND.colors.playa}
          rows={d.byRegion.map(r=>({name:r.name,value:r.teams}))} />
      </div>

      {t.players === 0 && (
        <p className="mt-8 text-center text-sm text-slate-400">
          El dashboard se llena solo a medida que registras atletas, clubes, equipos y resultados desde el panel.
        </p>
      )}
    </div>
  )
}
