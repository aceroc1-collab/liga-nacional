'use client'
import { useState } from 'react'
import { createPlayer, updatePlayer, deletePlayer } from '../actions'
import type { Player, Region, Club } from '@/lib/types'

export default function PlayersAdmin({ players, regions, clubs }:
  { players: Player[]; regions: Region[]; clubs: Club[] }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [edit, setEdit] = useState<Player | null>(null)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const r = edit ? await updatePlayer(edit.id, fd) : await createPlayer(fd)
    setMsg(r.message); setBusy(false)
    if (r.ok) { e.currentTarget.reset(); setEdit(null) }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form key={edit?.id ?? 'new'} onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">{edit ? `Editar: ${edit.full_name}` : 'Nuevo jugador'}</h3>
        <input name="full_name" className="input" placeholder="Nombre completo *" defaultValue={edit?.full_name} required />
        <div className="grid grid-cols-2 gap-2">
          <select name="gender" className="input" defaultValue={edit?.gender ?? 'M'}><option value="M">Masculino</option><option value="F">Femenino</option></select>
          <input name="cedula" className="input" placeholder="Cédula" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select name="region_id" className="input" defaultValue={edit?.region_id ?? ''}><option value="">Región…</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <select name="home_club_id" className="input" defaultValue={edit?.home_club_id ?? ''}><option value="">Club…</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <input name="city" className="input" placeholder="Ciudad" defaultValue={edit?.city ?? ''} />
        <input name="phone" className="input" placeholder="Teléfono" />
        <input name="instagram" className="input" placeholder="Instagram" defaultValue={edit?.instagram ?? ''} />
        <input name="photo_url" className="input" placeholder="URL de foto (opcional)" defaultValue={edit?.photo_url ?? ''} />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1"><input type="checkbox" name="plays_padel" defaultChecked={edit?.plays_padel} /> Pádel</label>
          <label className="flex items-center gap-1"><input type="checkbox" name="plays_playa" defaultChecked={edit?.plays_playa} /> Playa</label>
        </div>
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary flex-1">{busy?'Guardando…':edit?'Guardar cambios':'Crear jugador'}</button>
          {edit && <button type="button" onClick={()=>setEdit(null)} className="btn-ghost">Cancelar</button>}
        </div>
      </form>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 font-bold">Jugadores ({players.length})</div>
        <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
          {players.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 text-sm">
              <div><span className="font-semibold">{p.full_name}</span>
                <span className="ml-2 text-xs text-slate-400">{p.plays_padel?'🎾 ':''}{p.plays_playa?'🏖️':''}{p.is_dual?' ⭐':''}</span></div>
              <div className="flex gap-1">
                <button onClick={()=>{setEdit(p); window.scrollTo({top:0,behavior:'smooth'})}} className="rounded-lg px-2 py-1 text-xs font-semibold text-noche ring-1 ring-slate-300 hover:bg-slate-100">Editar</button>
                <Del onClick={() => deletePlayer(p.id)} setMsg={setMsg} />
              </div>
            </div>
          ))}
          {players.length===0 && <p className="p-4 text-sm text-slate-400">Sin jugadores aún.</p>}
        </div>
      </div>
    </div>
  )
}
function Del({ onClick, setMsg }: { onClick: () => Promise<any>; setMsg: (m: string)=>void }) {
  const [busy, setBusy] = useState(false)
  return <button disabled={busy} onClick={async()=>{ if(!confirm('¿Eliminar jugador?'))return; setBusy(true); const r=await onClick(); setMsg(r.message); setBusy(false) }}
    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50">Eliminar</button>
}
