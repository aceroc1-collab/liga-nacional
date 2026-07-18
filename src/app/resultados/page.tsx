import Link from 'next/link'
import { getMatches } from '@/lib/data'
import { SPORTS } from '@/lib/config'
import type { Sport } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Resultados' }

const phaseLabel: Record<string, string> = {
  regular: 'Fase Regular', playoff: 'Playoffs Regionales', interseries: 'Interseries Nacional', master: 'Master Nacional',
}

function Score({ m }: { m: any }) {
  const done = m.status === 'finalizado'
  const homeWin = done && m.home_rubbers > m.away_rubbers
  const awayWin = done && m.away_rubbers > m.home_rubbers
  return (
    <div className="flex items-center gap-3">
      <span className={`flex-1 text-right ${homeWin ? 'font-bold text-noche' : ''}`}>{m.home?.name ?? 'Por definir'}</span>
      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm font-bold">
        {done ? `${m.home_rubbers}–${m.away_rubbers}` : 'vs'}
      </span>
      <span className={`flex-1 ${awayWin ? 'font-bold text-noche' : ''}`}>{m.away?.name ?? 'Por definir'}</span>
    </div>
  )
}

function Bracket({ matches }: { matches: any[] }) {
  const slots = matches.filter(m => ['playoff','interseries','master'].includes(m.phase))
  if (slots.length === 0) return <p className="text-sm text-slate-400">Aún no hay brackets de playoff/Master publicados.</p>
  const byPhase = ['playoff','interseries','master'].map(p => ({ phase: p, items: slots.filter(m => m.phase === p) })).filter(g => g.items.length)
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {byPhase.map(col => (
        <div key={col.phase} className="min-w-[240px] flex-1">
          <h4 className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">{phaseLabel[col.phase]}</h4>
          <div className="flex h-full flex-col justify-around gap-4">
            {col.items.map(m => (
              <div key={m.id} className="card p-3 text-sm">
                <div className={`flex justify-between ${m.status==='finalizado'&&m.home_rubbers>m.away_rubbers?'font-bold':''}`}><span>{m.home?.name ?? '—'}</span><span>{m.status==='finalizado'?m.home_rubbers:''}</span></div>
                <div className="my-1 border-t border-slate-100" />
                <div className={`flex justify-between ${m.status==='finalizado'&&m.away_rubbers>m.home_rubbers?'font-bold':''}`}><span>{m.away?.name ?? '—'}</span><span>{m.status==='finalizado'?m.away_rubbers:''}</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ResultadosPage({ searchParams }: { searchParams: { sport?: string } }) {
  const sport = (searchParams.sport as Sport) ?? 'padel'
  const matches = await getMatches(sport)
  const regular = matches.filter(m => m.phase === 'regular')

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Resultados & Brackets</h1>
      <div className="mt-4 flex gap-2">
        {(['padel','playa'] as const).map(k => (
          <Link key={k} href={`/resultados?sport=${k}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${sport===k?'bg-noche text-white':'bg-white ring-1 ring-slate-200 hover:bg-slate-100'}`}>
            {SPORTS[k].icon} {SPORTS[k].label}
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-noche">🏆 Camino al Master</h2>
        <div className="card p-5"><Bracket matches={matches} /></div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-noche">Fase Regular</h2>
        {regular.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay eliminatorias. Corre <code>seed.sql</code> o créalas en admin.</p>
        ) : (
          <div className="space-y-2">
            {regular.map(m => (
              <div key={m.id} className="card p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{m.round_label}</span>
                  <span className={`badge ${m.status==='finalizado'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}`}>{m.status}</span>
                </div>
                <Score m={m} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
