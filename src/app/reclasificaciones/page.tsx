import Link from 'next/link'
import { getReclasificaciones, getRegions } from '@/lib/data'
import { SPORTS } from '@/lib/config'
import type { Sport } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reclasificaciones' }

const MOV: Record<string, { label: string; cls: string; icon: string }> = {
  sube:        { label: 'Sube',        cls: 'bg-emerald-50 text-emerald-600', icon: '▲' },
  baja:        { label: 'Baja',        cls: 'bg-rose-50 text-rose-500',       icon: '▼' },
  se_mantiene: { label: 'Se mantiene', cls: 'bg-slate-100 text-slate-500',    icon: '=' },
  sin_datos:   { label: 'Por definir', cls: 'bg-amber-50 text-amber-600',     icon: '·' },
}

export default async function ReclasificacionesPage({ searchParams }: { searchParams: { sport?: string } }) {
  const sport = (searchParams.sport as Sport) ?? 'padel'
  const [rows, regions] = await Promise.all([getReclasificaciones(sport), getRegions()])
  const regionName = (id: string | null) => regions.find(r => r.id === id)?.name ?? '—'
  const suben = rows.filter((r: any) => r.movimiento === 'sube').length
  const bajan = rows.filter((r: any) => r.movimiento === 'baja').length

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Reclasificaciones</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Listado oficial de categorías sugeridas según el <b>nivel real</b> de cada atleta, calculado por
        nuestro motor Glicko-2. Se publica cuando el sistema ya tiene certeza suficiente
        (mínimo 5 partidos y baja incertidumbre).
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['padel','playa'] as const).map(k => (
          <Link key={k} href={`/reclasificaciones?sport=${k}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${sport===k?'bg-noche text-white':'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
            {SPORTS[k].icon} {SPORTS[k].label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4"><div className="text-xs uppercase text-slate-400">Atletas evaluados</div><div className="text-2xl font-black text-noche">{rows.length}</div></div>
        <div className="card p-4"><div className="text-xs uppercase text-slate-400">Suben de categoría</div><div className="text-2xl font-black text-emerald-600">{suben}</div></div>
        <div className="card p-4"><div className="text-xs uppercase text-slate-400">Bajan de categoría</div><div className="text-2xl font-black text-rose-500">{bajan}</div></div>
      </div>

      <div className="card mt-6 overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            Aún no hay reclasificaciones publicadas. Se generan automáticamente cuando los atletas
            acumulen partidos suficientes.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="p-3">Atleta</th><th className="p-3">Zona</th><th className="p-3 text-center">PJ</th>
                <th className="p-3 text-right">Nivel</th><th className="p-3">Categoría actual</th>
                <th className="p-3">Sugerida</th><th className="p-3 text-center">Movimiento</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r: any) => {
                const m = MOV[r.movimiento] ?? MOV.sin_datos
                return (
                  <tr key={`${r.player_id}-${r.sport}`} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">
                      <Link href={r.slug ? `/jugadores/${r.slug}` : '#'} className="hover:text-pista">{r.full_name}</Link>
                    </td>
                    <td className="p-3 text-slate-500">{regionName(r.region_id)}</td>
                    <td className="p-3 text-center text-slate-500">{r.matches_played}</td>
                    <td className="p-3 text-right font-bold text-pista">{Number(r.rating).toFixed(2)}</td>
                    <td className="p-3 text-slate-600">{r.categoria_actual ?? '—'}</td>
                    <td className="p-3 font-semibold text-noche">{r.categoria_sugerida ?? '—'}</td>
                    <td className="p-3 text-center"><span className={`badge ${m.cls}`}>{m.icon} {m.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt-6 p-5">
        <h3 className="font-bold text-noche">¿No estás de acuerdo con tu categoría?</h3>
        <p className="mt-1 text-sm text-slate-600">
          Puedes presentar un reclamo formal y el comité lo revisará. También puedes reportar a un
          atleta que creas que está compitiendo en una categoría inferior a su nivel.
        </p>
        <Link href="/reclamos" className="btn-primary mt-3 inline-block">Presentar un reclamo</Link>
      </div>
    </div>
  )
}
