'use client'
import { useState } from 'react'
import { createTeam, updateTeam, deleteTeam, addTeamPlayer, removeTeamPlayer } from '../actions'
import type { Region, Category, Club, Player } from '@/lib/types'

export default function TeamsAdmin({ teams, regions, categories, clubs, players, rosters, seasonId }:
  { teams: any[]; regions: Region[]; categories: Category[]; clubs: Club[]; players: Player[];
    rosters: Record<string, any[]>; seasonId: string | null }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sport, setSport] = useState<'padel'|'playa'>('padel')
  const [edit, setEdit] = useState<any | null>(null)
  const cats = categories.filter(c => c.sport === (edit ? edit.sport : sport))

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    fd.set('season_id', seasonId ?? ''); fd.set('sport', edit ? edit.sport : sport)
    const r = edit ? await updateTeam(edit.id, fd) : await createTeam(fd)
    setMsg(r.message); setBusy(false)
    if (r.ok) { e.currentTarget.reset(); setEdit(null) }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form key={edit?.id ?? 'new'} onSubmit={submit} className="card space-y-3 p-5">
        <h3 className="font-bold">{edit ? `Editar: ${edit.name}` : 'Nuevo equipo'}</h3>
        <input name="name" className="input" placeholder="Nombre del equipo *" defaultValue={edit?.name} required />
        {!edit && (
          <div className="flex gap-3">
            {(['padel','playa'] as const).map(k => (
              <label key={k} className={`flex-1 cursor-pointer rounded-xl border-2 p-2 text-center text-sm font-semibold ${sport===k?'border-noche bg-noche/5':'border-slate-200'}`}>
                <input type="radio" className="hidden" checked={sport===k} onChange={()=>setSport(k)} />
                {k==='padel'?'🎾 Pádel':'🏖️ Playa'}
              </label>
            ))}
          </div>
        )}
        <select name="category_id" className="input" defaultValue={edit?.category_id ?? ''} required><option value="">Categoría…</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name} · {c.gender}</option>)}</select>
        <select name="region_id" className="input" defaultValue={edit?.region_id ?? ''} required><option value="">Región…</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <select name="club_id" className="input" defaultValue={edit?.club_id ?? ''}><option value="">Club (opcional)…</option>
          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input name="colors" className="input" placeholder="Colores (ej. Azul / Blanco)" defaultValue={edit?.colors ?? ''} />
        {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary flex-1">{busy?'Guardando…':edit?'Guardar cambios':'Crear equipo'}</button>
          {edit && <button type="button" onClick={()=>setEdit(null)} className="btn-ghost">Cancelar</button>}
        </div>
      </form>

      <div className="space-y-3">
        {teams.map(t => (
          <TeamCard key={t.id} team={t} roster={rosters[t.id] ?? []} players={players} setMsg={setMsg}
            onEdit={()=>{setEdit(t); window.scrollTo({top:0,behavior:'smooth'})}} />
        ))}
        {teams.length===0 && <div className="card p-4 text-sm text-slate-400">Sin equipos aún.</div>}
      </div>
    </div>
  )
}

function TeamCard({ team, roster, players, setMsg, onEdit }:
  { team: any; roster: any[]; players: Player[]; setMsg: (m:string)=>void; onEdit: ()=>void }) {
  const [sel, setSel] = useState('')
  const [localRoster, setLocalRoster] = useState(roster)
  const inTeam = new Set(localRoster.map(r => r.player_id))
  const available = players.filter(p => !inTeam.has(p.id))
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div><span className="font-bold">{team.name}</span>
          <span className="ml-2 text-xs text-slate-400">{team.sport==='padel'?'🎾':'🏖️'} {team.category?.name} · {team.club?.name}</span></div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded-lg px-2 py-1 text-xs font-semibold text-noche ring-1 ring-slate-300 hover:bg-slate-100">Editar</button>
          <button onClick={async()=>{ if(!confirm('¿Eliminar equipo?'))return; setMsg((await deleteTeam(team.id)).message)}}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50">Eliminar</button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {localRoster.map(r => (
          <span key={r.player_id} className="badge bg-slate-100 text-slate-600">
            {r.player?.full_name ?? 'Jugador'}
            <button onClick={async()=>{ const res=await removeTeamPlayer(team.id, r.player_id); setMsg(res.message)
              if(res.ok) setLocalRoster(localRoster.filter(x=>x.player_id!==r.player_id)) }}
              className="ml-1 text-rose-500">✕</button>
          </span>
        ))}
        {localRoster.length===0 && <span className="text-xs text-slate-400">Sin jugadores en la plantilla.</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <select value={sel} onChange={e=>setSel(e.target.value)} className="input text-sm">
          <option value="">Agregar jugador…</option>
          {available.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <button disabled={!sel} onClick={async()=>{ const res=await addTeamPlayer(team.id, sel); setMsg(res.message)
          if(res.ok){ const p=players.find(x=>x.id===sel); setLocalRoster([...localRoster,{player_id:sel,player:p}]); setSel('') } }}
          className="btn-ghost px-3 text-sm">+ Agregar</button>
      </div>
    </div>
  )
}
