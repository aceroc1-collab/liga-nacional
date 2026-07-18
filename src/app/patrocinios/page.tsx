import { getSponsors } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Patrocinios' }

const tierLabels: Record<string, string> = {
  principal: 'Patrocinador Principal', oro: 'Oro', plata: 'Plata',
  categoria: 'Patrocinador de Categoría', master: 'Master Nacional', club: 'Aliado de Club',
}
const tierOrder = ['principal','oro','plata','master','categoria','club']

export default async function PatrociniosPage() {
  const sponsors = await getSponsors()
  const grouped = tierOrder.map(t => ({ tier: t, items: sponsors.filter(s => s.tier === t) })).filter(g => g.items.length)
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Patrocinios & Alianzas</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Dos deportes, más eventos, más audiencia para el mismo patrocinador. Un paquete comercial
        que ninguna liga de un solo deporte puede ofrecer.
      </p>

      {sponsors.length === 0 ? (
        <div className="mt-8 card p-8 text-center text-slate-500">
          <p>Aún no hay patrocinadores cargados.</p>
          <p className="mt-2 text-sm text-slate-400">Agrégalos desde el panel admin o corre <code>seed.sql</code>.</p>
        </div>
      ) : grouped.map(g => (
        <section key={g.tier} className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">{tierLabels[g.tier]}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map(s => (
              <a key={s.id} href={s.website ?? '#'} target="_blank" rel="noreferrer"
                 className={`card p-6 transition hover:shadow-md ${s.tier==='principal'?'sm:col-span-2 lg:col-span-3 bg-noche text-white':''}`}>
                <div className="flex items-center gap-4">
                  <div className={`grid h-16 w-16 place-items-center rounded-xl ${s.tier==='principal'?'bg-white/10':'bg-slate-100'} text-2xl`}>
                    {s.logo_url ? <img src={s.logo_url} className="max-h-12" alt={s.name} /> : '🤝'}
                  </div>
                  <div>
                    <h3 className="font-bold">{s.name}</h3>
                    {s.description && <p className={`text-sm ${s.tier==='principal'?'text-white/70':'text-slate-500'}`}>{s.description}</p>}
                    {s.sport_scope && <span className="mt-1 inline-block text-xs opacity-70">{s.sport_scope === 'padel' ? '🎾 Pádel' : '🏖️ Tenis Playa'}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 card bg-gradient-to-r from-noche to-pista p-8 text-white">
        <h2 className="text-xl font-black">¿Quieres ser patrocinador?</h2>
        <p className="mt-2 max-w-2xl text-white/80">Naming del circuito, patrocinadores de categoría, del Master festival, palas de pádel y playa, bebidas, banca, telecom. Contáctanos.</p>
      </div>
    </div>
  )
}
