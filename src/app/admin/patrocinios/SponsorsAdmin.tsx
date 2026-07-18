'use client'
import { useState } from 'react'
import { createSponsor, updateSponsor, deleteSponsor } from '../actions'
import type { Sponsor } from '@/lib/types'

export default function SponsorsAdmin({ sponsors }: { sponsors: Sponsor[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [edit, setEdit] = useState<Sponsor | null>(null)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const r = edit ? await updateSponsor(edit.id, fd) : await createSponsor(fd)
    setMsg(r.message); setBusy(false)
    if (r.ok) { e.currentTarget.reset(); setEdit(null) }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form key={edit?.id ?? 'new'} onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">{edit ? `Editar: ${edit.name}` : 'Nuevo patrocinador'}</h3>
        <input name="name" className="input" placeholder="Nombre *" defaultValue={edit?.name} required />
        <select name="tier" className="input" defaultValue={edit?.tier ?? 'categoria'}>
          <option value="principal">Principal</option><option value="oro">Oro</option>
          <option value="plata">Plata</option><option value="categoria">Categoría</option>
          <option value="master">Master</option><option value="club">Aliado de club</option>
        </select>
        <select name="sport_scope" className="input" defaultValue={edit?.sport_scope ?? ''}>
          <option value="">Ambos deportes</option><option value="padel">Solo Pádel</option><option value="playa">Solo Playa</option>
        </select>
        <input name="website" className="input" placeholder="Sitio web (https://…)" defaultValue={edit?.website ?? ''} />
        <input name="logo_url" className="input" placeholder="URL del logo (opcional)" defaultValue={edit?.logo_url ?? ''} />
        <textarea name="description" className="input" rows={2} placeholder="Descripción" defaultValue={edit?.description ?? ''} />
        <input name="sort_order" type="number" className="input" placeholder="Orden (0 = primero)" defaultValue={edit?.sort_order ?? ''} />
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary flex-1">{busy?'Guardando…':edit?'Guardar cambios':'Crear patrocinador'}</button>
          {edit && <button type="button" onClick={()=>setEdit(null)} className="btn-ghost">Cancelar</button>}
        </div>
      </form>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 font-bold">Patrocinadores ({sponsors.length})</div>
        <div className="divide-y divide-slate-100">
          {sponsors.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 text-sm">
              <div><span className="font-semibold">{s.name}</span> <span className="badge bg-slate-100 text-slate-500">{s.tier}</span></div>
              <div className="flex gap-1">
                <button onClick={()=>{setEdit(s); window.scrollTo({top:0,behavior:'smooth'})}} className="rounded-lg px-2 py-1 text-xs font-semibold text-noche ring-1 ring-slate-300 hover:bg-slate-100">Editar</button>
                <Del onClick={() => deleteSponsor(s.id)} setMsg={setMsg} />
              </div>
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
