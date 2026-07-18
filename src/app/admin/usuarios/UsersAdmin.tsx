'use client'
import { useState } from 'react'
import { setUserRole } from '../actions'

const ROLES = ['jugador','arbitro','capitan','club_admin','coordinador','admin']
const roleLabel: Record<string,string> = {
  jugador:'Jugador', arbitro:'Árbitro', capitan:'Capitán', club_admin:'Admin de club',
  coordinador:'Coordinador (staff)', admin:'Administrador',
}

export default function UsersAdmin({ profiles, meId, meRole }:
  { profiles: any[]; meId: string; meRole: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [rows, setRows] = useState(profiles)
  const canManage = meRole === 'admin'

  async function change(id: string, role: string) {
    setMsg(null)
    const r = await setUserRole(id, role); setMsg(r.message)
    if (r.ok) setRows(rows.map(x => x.id===id ? { ...x, role } : x))
  }
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <span className="font-bold">Usuarios y roles ({rows.length})</span>
        {!canManage && <span className="text-xs text-amber-600">Solo el Administrador principal puede cambiar roles</span>}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
          <tr><th className="p-3">Usuario</th><th className="p-3">Rol actual</th><th className="p-3">Cambiar a</th></tr>
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
            </tr>
          ))}
        </tbody>
      </table>
      {msg && <p className="border-t border-slate-100 p-3 text-sm text-slate-500">{msg}</p>}
      <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
        <b>¿Cómo nombrar un administrador?</b> Pídele a la persona que cree su cuenta en <code>/login</code> (Regístrate).
        Cuando aparezca en esta lista, cámbiale el rol a <b>Administrador</b> o <b>Coordinador</b>. Solo esos dos roles ven el panel.
      </div>
    </div>
  )
}
