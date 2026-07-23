'use client'
import { useState } from 'react'
import { claimProfile, type ClaimResult } from './actions'

export default function ClaimProfileForm({ regions, sugerido }:
  { regions: { id: string; name: string }[]; sugerido: any }) {
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult(null)
    const r = await claimProfile(new FormData(e.currentTarget))
    setResult(r); setLoading(false)
  }

  if (result?.ok) {
    return (
      <div className="card p-6 text-center">
        <div className="text-4xl">🎉</div>
        <p className="mt-3 text-lg font-bold text-noche">{result.message}</p>
        <a href="/rankings" className="btn-primary mt-4 inline-block">Ver mi ranking</a>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      {sugerido && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          Encontramos tu perfil: <b>{sugerido.full_name}</b>. Confirma tu zona y actívalo.
        </div>
      )}
      <div>
        <label className="label">Cédula (opcional, ayuda a encontrarte)</label>
        <input name="cedula" className="input" placeholder="Ej. 12345678"
          defaultValue={sugerido?.cedula ?? ''} />
      </div>
      <div>
        <label className="label">Tu zona / región *</label>
        <select name="region_id" required className="input" defaultValue="">
          <option value="" disabled>Selecciona tu zona…</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <p className="mt-1 text-xs text-slate-400">La zona donde compites habitualmente.</p>
      </div>
      {result && !result.ok && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{result.message}</div>
      )}
      <button disabled={loading} className="btn-primary w-full">
        {loading ? 'Activando…' : 'Reclamar y activar mi perfil'}
      </button>
    </form>
  )
}
