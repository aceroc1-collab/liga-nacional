'use client'
import { useState, useTransition } from 'react'
import { recomputeHiddenRatings } from './actions-ranking'

export default function RatingsRecompute() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [okState, setOkState] = useState<boolean | null>(null)

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-lg font-bold">🧠 Motor de Ranking</div>
      <p className="mt-1 text-sm text-slate-500">
        Recalcula el rating oculto (Glicko-2) desde los resultados finalizados. Alimenta el
        desempate justo, el ranking Dual normalizado y las categorías A/B/C/D. Es idempotente:
        puedes correrlo cuantas veces quieras.
      </p>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await recomputeHiddenRatings()
          setOkState(r.ok); setMsg(r.message)
        })}
        className="mt-3 rounded-xl bg-noche px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Recalculando…' : 'Recalcular ratings ahora'}
      </button>
      {msg && (
        <p className={`mt-2 text-sm ${okState ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>
      )}
    </div>
  )
}
