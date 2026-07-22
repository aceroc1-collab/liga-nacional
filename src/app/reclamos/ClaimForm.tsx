'use client'
import { useState } from 'react'
import Script from 'next/script'
import { submitClaim, type ClaimResult } from './actions'

const TIPOS = [
  { v: 'categoria', l: 'Categoría incorrecta / nivel de un jugador' },
  { v: 'resultado', l: 'Resultado mal cargado' },
  { v: 'conducta',  l: 'Conducta antideportiva' },
  { v: 'otro',      l: 'Otro' },
]

export default function ClaimForm() {
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState('categoria')
  const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult(null)
    const r = await submitClaim(new FormData(e.currentTarget))
    setResult(r); setLoading(false)
    if (r.ok) { e.currentTarget.reset(); setTipo('categoria') }
    try { (window as any).turnstile?.reset() } catch {}
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <div>
        <label className="label">Tipo de reclamo *</label>
        <select name="tipo" value={tipo} onChange={e=>setTipo(e.target.value)} className="input">
          {TIPOS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Deporte</label>
          <select name="sport" className="input">
            <option value="">Ambos / no aplica</option>
            <option value="padel">Pádel</option>
            <option value="playa">Tenis Playa</option>
          </select>
        </div>
        <div>
          <label className="label">{tipo === 'categoria' ? 'Jugador que reportas' : 'Jugador / equipo involucrado'}</label>
          <input name="reported_name" className="input" placeholder="Nombre y apellido" />
        </div>
      </div>

      <div>
        <label className="label">Club (si aplica)</label>
        <input name="club_name" className="input" placeholder="Ej. Caracas Arena Club" />
      </div>

      <div>
        <label className="label">Cuéntanos el caso *</label>
        <textarea name="description" rows={5} required className="input"
          placeholder="Describe la situación con el mayor detalle posible: fechas, partidos, resultados o cualquier dato que ayude al comité a evaluarlo." />
        <p className="mt-1 text-xs text-slate-400">Mientras más detalle des, más rápido podemos resolverlo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Tu nombre *</label><input name="contact_name" required className="input" /></div>
        <div><label className="label">Tu correo</label><input name="contact_email" type="email" className="input" /></div>
        <div><label className="label">Tu teléfono</label><input name="contact_phone" className="input" placeholder="+58…" /></div>
      </div>

      {captchaSiteKey && (
        <div>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={captchaSiteKey} data-language="es" />
        </div>
      )}

      {result && (
        <div className={`rounded-xl p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {result.message}
        </div>
      )}

      <button disabled={loading} className="btn-primary w-full">
        {loading ? 'Enviando…' : 'Enviar reclamo'}
      </button>
      <p className="text-center text-xs text-slate-400">
        Tu reclamo es confidencial: solo lo ve el comité de la liga.
      </p>
    </form>
  )
}
