'use client'
import { useState } from 'react'
import { setUserRole, setUserRegion } from '../actions'

const ROLES = ['jugador','arbitro','capitan','club_admin','coordinador','admin']
const roleLabel: Record<string,string> = {
  jugador:'Jugador', arbitro:'Árbitro', capitan:'Capitán', club_admin:'Admin de club',
  coordinador:'Coordinador Regional', admin:'Administrador',
}

export default function UsersAdmin({ profiles, regions, meId, meRole }:
  { profiles: any[]; regions: { id: string; name: string }[]; meId: string; meRole: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [rows, setRows] = useState(profiles)
  const canManage = meRole === 'admin'
  const regionName = (id: string | null) => regions.find(r => r.id === id)?.name ?? '—'
  const admins = rows.filter(u => u.role === 'admin').length
  const coords = rows.filter(u => u.role === 'coordinador').length

  async function change(id: string, role: string) {
    setMsg(null)
    const r = await setUserRole(id, role); setMsg(r.message)
    if (r.ok) setRows(rows.map(x => x.id===id ? { ...x, role } : x))
  }
  async function changeRegion(id: string, region_id: string) {
    setMsg(null)
    const r = await setUserRegion(id, region_id); setMsg(r.message)
    if (r.ok) setRows(rows.map(x => x.id===id ? { ...x, region_id } : x))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="card flex-1 p-4"><div className="text-xs text-slate-400">Administradores</div><div className="text-2xl font-black text-noche">{admins}</div></div>
        <div className="card flex-1 p-4"><div className="text-xs text-slate-400">Coordinadores Regionales</div><div className="text-2xl font-black text-noche">{coords}</div></div>
        <div className="card flex-1 p-4"><div className="text-xs text-slate-400">Usuarios totales</div><div className="text-2xl font-black text-noche">{rows.length}</div></div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <span className="font-bold">Usuarios y roles ({rows.length})</span>
          {!canManage && <span className="text-xs text-amber-600">Solo el Administrador puede cambiar roles y zonas</span>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
            <tr><th className="p-3">Usuario</th><th className="p-3">Rol actual</th><th className="p-3">Cambiar rol</th><th className="p-3">Zona / Región</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(u => (
              <tr key={u.id}>
                <td className="p-3 font-semibold">{u.full_name || '—'}{u.id===meId && <span className="ml-2 badge bg-noche/10 text-noche">tú</span>}</td>
                <td className="p-3"><span className={`badge ${['admin','coordinador'].includes(u.role)?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}`}>{roleLabel[u.role] ?? u.role}</span></td>
                <td className="p-3">
                  <select disabled={!canManage || u.id===meId} defaultValue={u.role}
                    onChange={e=>change(u.id, e.target.value)} className="input w-48 py-1 text-sm">
                    {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  {u.role === 'coordinador' ? (
                    <select disabled={!canManage} defaultValue={u.region_id ?? ''}
                      onChange={e=>changeRegion(u.id, e.target.value)} className="input w-52 py-1 text-sm">
                      <option value="">— Sin zona asignada —</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (
                    <span className="text-slate-400">{u.role==='admin' ? 'Nacional (acceso total)' : regionName(u.region_id)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {msg && <p className="border-t border-slate-100 p-3 text-sm text-slate-500">{msg}</p>}
        <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 space-y-1">
          <p><b>Cómo dar de alta un Coordinador Regional:</b></p>
          <p>1. La persona crea su cuenta en <code>/login</code> (Regístrate).</p>
          <p>2. Cuando aparezca en esta lista, cámbiale el rol a <b>Coordinador Regional</b>.</p>
          <p>3. Asígnale su <b>Zona/Región</b> en la última columna. Listo.</p>
          <p className="pt-1">Los Coordinadores Regionales tienen acceso operativo completo (clubes, jugadores, equipos, partidos, resultados) pero <b>no</b> pueden cambiar roles. Solo el <b>Administrador</b> agrega o quita administradores.</p>
        </div>
      </div>
    </div>
  )
}
