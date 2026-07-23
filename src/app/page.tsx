import Link from 'next/link'
import { BRAND, SPORTS } from '@/lib/config'
import { getRegions, getDualRanking, getSponsors, getClubs, getLeagueStats } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [regions, dual, sponsors, clubs, stats] = await Promise.all([
    getRegions(), getDualRanking(), getSponsors(), getClubs(), getLeagueStats(),
  ])
  const topDual = dual.slice(0, 5)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-noche text-white">
        <div className="absolute inset-0 opacity-20"
             style={{ background: `radial-gradient(60% 60% at 20% 10%, ${BRAND.colors.padel} 0%, transparent 60%), radial-gradient(60% 60% at 90% 30%, ${BRAND.colors.playa} 0%, transparent 55%)` }} />
        <div className="container-app relative py-14">
          <div className="mx-auto mb-8 max-w-3xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
            <img src={BRAND.logo} alt={BRAND.fullName} className="w-full" />
          </div>
          <p className="badge bg-white/10 text-white/80">Proyecto Nacional · {BRAND.country} · {BRAND.year}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Un circuito, <span className="text-arena">dos deportes.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            La liga amateur por equipos más grande del país. Juega por tus colores toda la
            temporada — en la cancha de pádel y en la arena — y compite por el ranking Atleta Dual.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscripciones" className="btn bg-brasa text-white hover:bg-brasa/90">Inscribir mi equipo</Link>
            <Link href="/rankings" className="btn bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">Ver rankings</Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: stats.clubs, v: 'Clubes miembros' },
              { k: stats.players, v: 'Atletas registrados' },
              { k: stats.matches, v: 'Encuentros jugados' },
              { k: stats.rubbers, v: 'Partidos individuales' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-3xl font-black">{s.k}</div>
                <div className="text-sm text-white/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOS DEPORTES */}
      <section className="container-app grid gap-6 py-16 sm:grid-cols-2">
        {(['padel','playa'] as const).map(k => {
          const s = SPORTS[k]
          return (
            <div key={k} className="card overflow-hidden">
              <div className="h-28" style={{ backgroundColor: s.color }} />
              <div className="p-6">
                <div className="-mt-12 mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow ring-1 ring-slate-200">{s.icon}</div>
                <h3 className="text-xl font-bold">Circuito {s.label}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {k === 'padel'
                    ? 'Formato SNP: 5 partidos de parejas por eliminatoria, categorías Grand Slam a Future, ascensos y descensos.'
                    : 'Modelo FITP/ITF: dobles masculino, femenino y mixto en la arena, Series A/B/C y juveniles.'}
                </p>
                <Link href={`/rankings?sport=${k}`} className="btn-ghost mt-4 text-sm">Ranking {s.label} →</Link>
              </div>
            </div>
          )
        })}
      </section>

      {/* TOP ATLETA DUAL */}
      <section className="container-app py-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-noche">🏆 Ranking Atleta Dual</h2>
            <p className="text-sm text-slate-500">Los que compiten en ambos deportes — la joya de la liga.</p>
          </div>
          <Link href="/rankings?tab=dual" className="text-sm font-semibold text-pista">Ver todos →</Link>
        </div>
        <div className="card divide-y divide-slate-100">
          {topDual.length === 0 && (
            <p className="p-6 text-sm text-slate-400">Aún no hay puntos cargados. Corre <code>seed.sql</code> o carga resultados.</p>
          )}
          {topDual.map((d) => (
            <div key={d.player_id} className="flex items-center gap-4 p-4">
              <span className="w-8 text-center text-lg font-black text-slate-300">{d.position}</span>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                {d.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{d.full_name}</div>
                <div className="text-xs text-slate-400">Pádel {d.padel_points} · Playa {d.playa_points}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-noche">{d.dual_score}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400">Dual score</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PATROCINIOS */}
      {sponsors.length > 0 && (
        <section className="container-app py-12">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">Con el respaldo de</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {sponsors.map(sp => (
              <div key={sp.id} className="card flex h-16 min-w-[140px] items-center justify-center px-6 text-sm font-semibold text-slate-500">
                {sp.logo_url
                  ? <img src={sp.logo_url} alt={sp.name} className="max-h-10" />
                  : sp.name}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
