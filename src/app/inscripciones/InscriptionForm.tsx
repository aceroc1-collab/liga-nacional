'use client'
import { useState } from 'react'
import { submitInscription, type InscriptionResult } from './actions'
import type { Region, Category, Club } from '@/lib/types'
import { SPORTS, FEES, inscriptionAmount } from '@/lib/config'

export default function InscriptionForm({
  regions, categories, clubs, seasonId,
}: { regions: Region[]; categories: Category[]; clubs: Club[]; seasonId: string | null }) {
  const [sport, setSport] = useState<'padel' | 'playa'>('padel')
  const [dual, setDual] = useState(false)
  const [rows, setRows] = useState([0, 1, 2, 3])
  const [result, setResult] = useState<InscriptionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const cats = categories.filter(c => c.sport === sport)
  const base = FEES[sport]
  const total = inscriptionAmount(sport, dual)
  const money = (n: number) => `${FEES.symbol}${n.toFixed(2)}`

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setResult(null)
    const fd = new FormData(e.currentTarget)
    const r = await submitInscription(fd)
    setResult(r); setLoading(false)
    if (r.ok) { e.currentTarget.reset(); setDual(false) }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <input type="hidden" name="season_id" value={seasonId ?? ''} />
      <input type="hidden" name="dual" value={dual ? '1' : '0'} />

      {/* Deporte */}
      <div>
        <label className="label">Deporte *</label>
        <div className="flex gap-3">
          {(['padel','playa'] as const).map(k => (
            <label key={k} className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center font-semibold ${sport===k?'border-noche bg-noche/5':'border-slate-200'}`}>
              <input type="radio" name="sport" value={k} className="hidden"
                checked={sport===k} onChange={() => setSport(k)} />
              {SPORTS[k].icon} {SPORTS[k].label} · {FEES.symbol}{FEES[k]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Región *</label>
          <select name="region_id" className="input" required>
            <option value="">Selecciona…</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Categoría *</label>
          <select name="category_id" className="input" required>
            <option value="">Selecciona…</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name} · {c.gender} {c.level_label ? `(${c.level_label})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Club sede</label>
          <select name="club_id" className="input">
            <option value="">Sin club / por definir</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Nombre del equipo *</label>
          <input name="team_name" className="input" placeholder="Ej. Caracas GS" required />
        </div>
      </div>

      {/* Plantilla */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Plantilla de jugadores</label>
          <span className="text-xs text-slate-400">Mínimo 10 recomendado para pádel</span>
        </div>
        <div className="space-y-2">
          {rows.map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input name="player_name" className="input flex-1" placeholder={`Jugador ${i+1}`} />
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="player_padel" /> Pádel</label>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="player_playa" /> Playa</label>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setRows([...rows, rows.length])}
          className="btn-ghost mt-3 text-sm">+ Agregar jugador</button>
      </div>

      {/* Contacto capitán */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Contacto / Capitán *</label><input name="contact_name" className="input" required /></div>
        <div><label className="label">Teléfono</label><input name="contact_phone" className="input" placeholder="+58…" /></div>
        <div><label className="label">Email</label><input name="contact_email" type="email" className="input" /></div>
      </div>
      <div><label className="label">Notas</label><textarea name="notes" className="input" rows={2} /></div>

      {/* Descuento Dual + resumen de pago */}
      <div className="rounded-xl border border-slate-200 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1" checked={dual} onChange={e => setDual(e.target.checked)} />
          <span>
            <span className="font-semibold text-noche">También compito en la otra disciplina (Atleta Dual)</span>
            <span className="block text-xs text-slate-500">Obtén <b>10% de descuento</b> en esta inscripción por jugar pádel y tenis playa.</span>
          </span>
        </label>
        <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Inscripción {SPORTS[sport].label}</span><span>{money(base)}</span>
          </div>
          {dual && (
            <div className="flex justify-between text-emerald-600">
              <span>Descuento Dual (−10%)</span><span>−{money(base - total)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-black text-noche">
            <span>Total a pagar</span><span>{money(total)}</span>
          </div>
          <p className="pt-1 text-xs text-slate-400">Pago por pago móvil / transferencia. El coordinador confirma tu inscripción.</p>
        </div>
      </div>

      {result && (
        <div className={`rounded-xl p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {result.message}
        </div>
      )}
      <button disabled={loading} className="btn-primary w-full">
        {loading ? 'Enviando…' : `Enviar solicitud · ${money(total)}`}
      </button>
    </form>
  )
}
