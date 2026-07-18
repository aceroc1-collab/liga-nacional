import Link from 'next/link'
import { getClubs, getRegions } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Clubes' }

export default async function ClubesPage() {
  const [clubs, regions] = await Promise.all([getClubs(), getRegions()])
  const regionName = (id: string | null) => regions.find(r => r.id === id)?.name ?? '—'
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Clubes sede</h1>
      <p className="mt-1 text-slate-500">Canchas de pádel y de arena en las 5 regiones del país.</p>
      {clubs.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">Aún no hay clubes. Corre <code>seed.sql</code> o agrégalos en admin.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map(c => (
            <Link key={c.id} href={`/clubes/${c.slug}`} className="card overflow-hidden transition hover:shadow-md">
              <div className="h-24 bg-gradient-to-br from-noche to-pista" />
              <div className="p-5">
                <div className="-mt-10 mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl shadow ring-1 ring-slate-200">
                  {c.logo_url ? <img src={c.logo_url} className="h-10 w-10 rounded-lg object-cover" alt="" /> : '🏟️'}
                </div>
                <h3 className="font-bold">{c.name} {c.is_verified && <span title="Verificado">✓</span>}</h3>
                <p className="text-sm text-slate-500">{c.city} · {regionName(c.region_id)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {c.has_padel && <span className="badge bg-pista/10 text-pista">🎾 {c.padel_courts} pistas</span>}
                  {c.has_playa && <span className="badge bg-arena/20 text-amber-700">🏖️ {c.playa_courts} canchas</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
