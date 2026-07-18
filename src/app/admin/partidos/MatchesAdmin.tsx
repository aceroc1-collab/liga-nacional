'use client'
import { useState } from 'react'
import { createMatch, finalizeMatch, deleteMatch } from '../actions'

export default function MatchesAdmin({ teams, matches, seasonId }:
  { teams: any[]; matches: any[]; seasonId: string | null }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sport, setSport] = useState<'padel'|'playa'>('padel')
  const [scores, setScores] = useState<Record<string,{h:number;a:number}>>({})
  const teamsOfSport = teams.filter(t => t.sport === sport)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    fd.set('season_id', seasonId ?? ''); fd.set('sport', sport)
    const r = await createMatch(fd); setMsg(r.message); setBusy(false)
    if (r.ok) e.currentTarget.reset()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">Nuevo partido</h3>
        <div className="flex gap-3">
          {(['padel','playa'] as const).map(k => (
            <label key={k} className={`flex-1 cursor-pointer rounded-xl border-2 p-2 text-center text-sm font-semibold ${sport===k?'border-noche bg-noche/5':'border-slate-200'}`}>
              <input type="radio" className="hidden" checked={sport===k} onChange={()=>setSport(k)} />
              {k==='padel'?'🎾 Pádel':'🏖️ Playa'}
            </label>
          ))}
        </div>
        <select name="home_team_id" className="input" required><option value="">Equipo local…</option>
          {teamsOfSport.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <select name="away_team_id" className="input" required><option value="">Equipo visitante…</option>
          {teamsOfSport.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <select name="phase" className="input">
          <option value="regular">Fase Regular</option><option value="playoff">Playoff</option>
          <option value="interseries">Interseries</option><option value="master">Master</option>
        </select>
        <input name="round_label" className="input" placeholder="Jornada / Ronda (ej. Jornada 1)" />
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy?'Guardando…':'Crear partido'}</button>
      </form>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 font-bold">Partidos ({matches.length})</div>
        <div className="divide-y divide-slate-100">
          {matches.map(m => {
            const sc = scores[m.id] ?? { h: m.home_rubbers, a: m.away_rubbers }
            const done = m.status === 'finalizado'
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-2 p-3 text-sm">
                <span className="badge bg-slate-100 text-slate-500">{m.sport==='padel'?'🎾':'🏖️'} {m.round_label||m.phase}</span>
                <span className="flex-1 font-semibold">{m.home?.name} vs {m.away?.name}</span>
                <input type="number" min={0} className="input w-14" value={sc.h}
                  onChange={e=>setScores({...scores,[m.id]:{...sc,h:+e.target.value}})} />
                <span>-</span>
                <input type="number" min={0} className="input w-14" value={sc.a}
                  onChange={e=>setScores({...scores,[m.id]:{...sc,a:+e.target.value}})} />
                <button onClick={async()=>{setMsg((await finalizeMatch(m.id, sc.h, sc.a)).message)}}
                  className="btn-primary px-2 py-1 text-xs">{done?'Actualizar':'Finalizar'}</button>
                <button onClick={async()=>{ if(!confirm('¿Eliminar partido?'))return; setMsg((await deleteMatch(m.id)).message)}}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50">✕</button>
              </div>
            )
          })}
          {matches.length===0 && <p className="p-4 text-sm text-slate-400">Sin partidos aún.</p>}
        </div>
      </div>
    </div>
  )
}
