'use client'
import { useState } from 'react'
import { claimProfile, searchProfiles, type ClaimResult, type ProfileHit } from './actions'

export default function ClaimProfileForm({ regions, sugerido }:
  { regions: { id: string; name: string }[]; sugerido: any }) {
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ProfileHit[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<string>(sugerido?.id ?? '')

  async function doSearch() {
    if (query.trim().length < 3) { setItems([]); return }
    setSearching(true); setResult(null)
    const r = await searchProfiles(query)
    setItems(r.items || []); setSearching(false)
  }

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
      {sugerido ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          Encontramos tu perfil: <b>{sugerido.full_name}</b>. Confirma tu zona y actívalo.
          <input type="hidden" name="player_id" value={sugerido.id} />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">Búscate por tu nombre</label>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
                className="input" placeholder="Ej. Acevedo Andrés" />
              <button type="button" onClick={doSearch} disabled={searching}
                className="whitespace-nowrap rounded-xl bg-noche px-4 font-semibold text-white disabled:opacity-60">
                {searching ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">Escribe tu nombre y apellido. (También te reconocemos por el correo del torneo si te registraste con él.)</p>
          </div>

          {items && items.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Selecciona tu perfil:</p>
              {items.map(it => (
                <label key={it.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected === it.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="player_id" value={it.id}
                    checked={selected === it.id} onChange={() => setSelected(it.id)} />
                  <span className="flex-1"><b className="text-noche">{it.full_name}</b>
                    {it.categoria ? <span className="text-slate-500"> · {it.categoria}</span> : null}</span>
                </label>
              ))}
            </div>
          )}
          {items && items.length === 0 && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              No encontramos ese nombre sin reclamar. Revisa cómo lo escribiste (nombre y apellido) o escríbenos por Reclamos.
            </div>
          )}
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
      <button disabled={loading || (!sugerido && !selected)} className="btn-primary w-full">
        {loading ? 'Activando…' : 'Reclamar y activar mi perfil'}
      </button>
    </form>
  )
}
