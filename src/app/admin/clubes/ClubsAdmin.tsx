'use client'
import { useState } from 'react'
import { createClub, deleteClub } from '../actions'
import type { Club, Region } from '@/lib/types'

export default function ClubsAdmin({ clubs, regions }: { clubs: Club[]; regions: Region[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const r = await createClub(new FormData(e.currentTarget)); setMsg(r.message); setBusy(false)
    if (r.ok) e.currentTarget.reset()
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">Nuevo club</h3>
        <input name="name" className="input" placeholder="Nombre del club *" required />
        <div className="grid grid-cols-2 gap-2">
          <select name="region_id" className="input"><option value="">Región…</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <input name="city" className="input" placeholder="Ciudad" />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1"><input type="checkbox" name="has_padel" /> Pádel</label>
          <label className="flex items-center gap-1"><input type="checkbox" name="has_playa" /> Playa</label>
          <label className="flex items-center gap-1"><input type="checkbox" name="is_verified" /> Verificado</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="padel_courts" type="number" min="0" className="input" placeholder="Pistas pádel" />
          <input name="playa_courts" type="number" min="0" className="input" placeholder="Canchas playa" />
        </div>
        <input name="contact_name" className="input" placeholder="Contacto" />
        <input name="contact_phone" className="input" placeholder="Teléfono" />
        <input name="instagram" className="input" placeholder="Instagram" />
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy?'Guardando…':'Crear club'}</button>
      </form>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 font-bold">Clubes ({clubs.length})</div>
        <div className="divide-y divide-slate-100">
          {clubs.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 text-sm">
              <div><span className="font-semibold">{c.name}</span> <span className="text-slate-400">· {c.city}</span>
                <div className="text-xs text-slate-400">{c.has_padel?'🎾 ':''}{c.has_playa?'🏖️':''}</div></div>
              <DeleteBtn onClick={() => deleteClub(c.id)} setMsg={setMsg} />
            </div>
          ))}
          {clubs.length===0 && <p className="p-4 text-sm text-slate-400">Sin clubes aún.</p>}
        </div>
      </div>
    </div>
  )
}
function DeleteBtn({ onClick, setMsg }: { onClick: () => Promise<any>; setMsg: (m: string)=>void }) {
  const [busy, setBusy] = useState(false)
  return <button disabled={busy} onClick={async()=>{ if(!confirm('¿Eliminar?'))return; setBusy(true); const r=await onClick(); setMsg(r.message); setBusy(false) }}
    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50">Eliminar</button>
}
