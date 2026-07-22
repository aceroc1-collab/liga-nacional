'use client'
import { useState } from 'react'
import { updateClaim } from '../actions'

const STATUS = ['pendiente','en_revision','resuelto','rechazado']
const label: Record<string,string> = {
  pendiente:'Pendiente', en_revision:'En revisión', resuelto:'Resuelto', rechazado:'Rechazado',
}
const cls: Record<string,string> = {
  pendiente:'bg-amber-50 text-amber-600', en_revision:'bg-sky-50 text-sky-600',
  resuelto:'bg-emerald-50 text-emerald-600', rechazado:'bg-slate-100 text-slate-500',
}
const tipoLabel: Record<string,string> = {
  categoria:'Categoría/nivel', resultado:'Resultado', conducta:'Conducta', otro:'Otro',
}

export default function ClaimsAdmin({ claims }: { claims: any[] }) {
  const [rows, setRows] = useState(claims)
  const [msg, setMsg] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string,string>>({})

  async function save(id: string, status: string) {
    setMsg(null)
    const r = await updateClaim(id, status, notes[id] ?? '')
    setMsg(r.message)
    if (r.ok) setRows(rows.map(c => c.id === id ? { ...c, status, admin_notes: notes[id] ?? c.admin_notes } : c))
  }

  const pend = rows.filter(c => c.status === 'pendiente').length
  if (rows.length === 0) return <div className="card p-8 text-center text-sm text-slate-400">No hay reclamos por ahora. 🎉</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="card flex-1 p-4"><div className="text-xs uppercase text-slate-400">Pendientes</div><div className="text-2xl font-black text-amber-600">{pend}</div></div>
        <div className="card flex-1 p-4"><div className="text-xs uppercase text-slate-400">Total recibidos</div><div className="text-2xl font-black text-noche">{rows.length}</div></div>
      </div>
      {msg && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{msg}</p>}

      <div className="space-y-3">
        {rows.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className={`badge ${cls[c.status]}`}>{label[c.status]}</span>
                <span className="ml-2 badge bg-noche/10 text-noche">{tipoLabel[c.tipo] ?? c.tipo}</span>
                {c.sport && <span className="ml-2 text-xs text-slate-400">{c.sport === 'padel' ? '🎾 Pádel' : '🏖️ Playa'}</span>}
                <p className="mt-2 font-semibold text-noche">
                  {c.reported_name ? `Reporta a: ${c.reported_name}` : 'Sin jugador señalado'}
                  {c.club_name ? ` · ${c.club_name}` : ''}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                {new Date(c.created_at).toLocaleDateString('es-VE', { day:'2-digit', month:'short', year:'numeric' })}
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600">{c.description}</p>

            <p className="mt-3 text-xs text-slate-500">
              <b>Contacto:</b> {c.contact_name}
              {c.contact_email ? ` · ${c.contact_email}` : ''}
              {c.contact_phone ? ` · ${c.contact_phone}` : ''}
            </p>

            <button onClick={() => setOpen(open === c.id ? null : c.id)} className="btn-ghost mt-3 text-sm">
              {open === c.id ? 'Cerrar' : 'Gestionar'}
            </button>

            {open === c.id && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <textarea className="input" rows={2} placeholder="Notas internas del comité…"
                  defaultValue={c.admin_notes ?? ''}
                  onChange={e => setNotes({ ...notes, [c.id]: e.target.value })} />
                <div className="flex flex-wrap gap-2">
                  {STATUS.map(st => (
                    <button key={st} onClick={() => save(c.id, st)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${c.status===st?'bg-noche text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {label[st]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
