'use client'
import { useState } from 'react'
import { createSponsor, deleteSponsor } from '../actions'
import type { Sponsor } from '@/lib/types'

export default function SponsorsAdmin({ sponsors }: { sponsors: Sponsor[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const r = await createSponsor(new FormData(e.currentTarget)); setMsg(r.message); setBusy(false)
    if (r.ok) e.currentTarget.reset()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">Nuevo patrocinador</h3>
        <input name="name" className="input" placeholder="Nombre *" required />
        <select name="tier" className="input">
          <option value="principal">Principal</option><option value="oro">Oro</option>
          <option value="plata">Plata</option><option value="categoria">Categoría</option>
          <option value="master">Master</option><option value="club">Aliado de club</option>
        </select>
        <select name="sport_scope" className="input">
          <option value="">Ambos deportes</option><option value="padel">Solo Pádel</option><option value="playa">Solo Playa</option>
        </select>
        <input name="website" className="input" placeholder="Sitio web (https://…)" />
        <input name="logo_url" className="input" placeholder="URL del logo (opcional)" />
        <textarea name="description" className="input" rows={2} placeholder="Descripción" />
        <input name="sort_order" type="number" className="input" placeholder="Orden (0 = primero)" />
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy?'Guardando…':'Crear patrocinador'}</button>
      </form>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 font-bold">Patrocinadores ({sponsors.length})</div>
        <div className="divide-y divide-slate-100">
          {sponsors.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 text-sm">
              <div><span className="font-semibold">{s.name}</span> <span className="badge bg-slate-100 text-slate-500">{s.tier}</span></div>
              <Del onClick={() => deleteSponsor(s.id)} setMsg={setMsg} />
            </div>
          ))}
          {sponsors.length===0 && <p className="p-4 text-sm text-slate-400">Sin patrocinadores aún.</p>}
        </div>
      </div>
    </div>
  )
}
function Del({ onClick, setMsg }: { onClick: () => Promise<any>; setMsg: (m: string)=>void }) {
  const [busy, setBusy] = useState(false)
  return <button disabled={busy} onClick={async()=>{ if(!confirm('¿Eliminar?'))return; setBusy(true); const r=await onClick(); setMsg(r.message); setBusy(false) }}
    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50">Eliminar</button>
}
