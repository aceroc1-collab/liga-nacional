import { notFound } from 'next/navigation'
import { getClubBySlug, getRegions } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function ClubPage({ params }: { params: { id: string } }) {
  const club = await getClubBySlug(params.id)
  if (!club) notFound()
  const regions = await getRegions()
  const region = regions.find(r => r.id === club.region_id)?.name ?? '—'
  return (
    <div>
      <div className="h-48 bg-gradient-to-br from-noche to-pista" />
      <div className="container-app -mt-16">
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-3xl shadow ring-1 ring-slate-200">
              {club.logo_url ? <img src={club.logo_url} className="h-16 w-16 rounded-xl object-cover" alt="" /> : '🏟️'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-noche">{club.name} {club.is_verified && '✓'}</h1>
              <p className="text-slate-500">{club.city} · {region}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {club.has_padel && <span className="badge bg-pista/10 text-pista">🎾 Pádel · {club.padel_courts} pistas</span>}
                {club.has_playa && <span className="badge bg-arena/20 text-amber-700">🏖️ Tenis Playa · {club.playa_courts} canchas</span>}
              </div>
            </div>
          </div>
          {(club.contact_name || club.contact_phone) && (
            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
              {club.contact_name && <div><span className="text-slate-400">Contacto</span><br />{club.contact_name}</div>}
              {club.contact_phone && <div><span className="text-slate-400">Teléfono</span><br />{club.contact_phone}</div>}
              {club.instagram && <div><span className="text-slate-400">Instagram</span><br />{club.instagram}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
