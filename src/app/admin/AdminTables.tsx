'use client'
import { useState } from 'react'
import { confirmInscription, rejectInscription, finalizeMatch } from './actions'

export function InscriptionsTable({ rows }: { rows: any[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 p-4 font-bold">Solicitudes de inscripción</div>
      {rows.length === 0 ? <p className="p-6 text-sm text-slate-400">Sin solicitudes.</p> : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr><th className="p-3">Equipo</th><th className="p-3">Deporte</th><th className="p-3">Contacto</th><th className="p-3">Estado</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="p-3 font-semibold">{r.team_name}<div className="text-xs text-slate-400">{(r.roster?.length ?? 0)} jugadores</div></td>
                <td className="p-3">{r.sport === 'padel' ? '🎾 Pádel' : '🏖️ Playa'}</td>
                <td className="p-3">{r.contact_name}<div className="text-xs text-slate-400">{r.contact_phone}</div></td>
                <td className="p-3"><span className="badge bg-slate-100 text-slate-600">{r.status}</span></td>
                <td className="p-3 text-right">
                  <button onClick={async()=>setMsg((await confirmInscription(r.id)).message)} className="btn-ghost mr-1 px-2 py-1 text-xs text-emerald-600">Confirmar</button>
                  <button onClick={async()=>setMsg((await rejectInscription(r.id)).message)} className="btn-ghost px-2 py-1 text-xs text-rose-500">Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {msg && <p className="border-t border-slate-100 p-3 text-sm text-slate-500">{msg}</p>}
    </div>
  )
}

export function MatchesTable({ rows }: { rows: any[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, { h: number; a: number }>>({})
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 p-4 font-bold">Eliminatorias por finalizar</div>
      {rows.length === 0 ? <p className="p-6 text-sm text-slate-400">Sin eliminatorias pendientes.</p> : (
        <div className="divide-y divide-slate-100">
          {rows.map(m => {
            const sc = scores[m.id] ?? { h: m.home_rubbers, a: m.away_rubbers }
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className="badge bg-slate-100 text-slate-500">{m.round_label}</span>
                <span className="flex-1 font-semibold">{m.home?.name ?? 'Local'} vs {m.away?.name ?? 'Visita'}</span>
                <input type="number" min={0} className="input w-16" value={sc.h}
                  onChange={e=>setScores({...scores,[m.id]:{...sc,h:+e.target.value}})} />
                <span>-</span>
                <input type="number" min={0} className="input w-16" value={sc.a}
                  onChange={e=>setScores({...scores,[m.id]:{...sc,a:+e.target.value}})} />
                <button onClick={async()=>setMsg((await finalizeMatch(m.id, sc.h, sc.a)).message)} className="btn-primary px-3 py-1.5 text-xs">Finalizar</button>
              </div>
            )
          })}
        </div>
      )}
      {msg && <p className="border-t border-slate-100 p-3 text-sm text-slate-500">{msg}</p>}
    </div>
  )
}
