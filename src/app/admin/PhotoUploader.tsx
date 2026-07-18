'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setPlayerPhoto } from './actions'
import type { Player } from '@/lib/types'

export default function PhotoUploader({ players }: { players: Player[] }) {
  const [playerId, setPlayerId] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !playerId) { setMsg('Elige jugador y archivo'); return }
    setBusy(true); setMsg(null)
    const supabase = createClient()
    const path = `players/${playerId}-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (error) { setMsg(error.message); setBusy(false); return }
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    const r = await setPlayerPhoto(playerId, data.publicUrl)
    setMsg(r.message); setBusy(false)
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold">📷 Subir foto de jugador</h3>
      <div className="mt-3 space-y-3">
        <select className="input" value={playerId} onChange={e=>setPlayerId(e.target.value)}>
          <option value="">Selecciona jugador…</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={onFile} disabled={busy || !playerId} className="text-sm" />
        {msg && <p className="text-sm text-slate-500">{msg}</p>}
      </div>
    </div>
  )
}
