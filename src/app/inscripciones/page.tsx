import { getRegions, getCategories, getClubs } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import InscriptionForm from './InscriptionForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inscripciones' }

async function activeSeason(): Promise<string | null> {
  try {
    const s = createClient()
    const { data } = await s.from('seasons').select('id').eq('is_active', true).single()
    return data?.id ?? null
  } catch { return null }
}

export default async function InscripcionesPage() {
  const [regions, categories, clubs, seasonId] = await Promise.all([
    getRegions(), getCategories(), getClubs(), activeSeason(),
  ])
  return (
    <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-3xl font-black text-noche">Inscribe tu equipo</h1>
        <p className="mt-1 text-slate-500">
          Registra tu equipo en la temporada. El capitán arma la plantilla y elige región,
          deporte y categoría. Puedes inscribir equipos en ambos deportes.
        </p>
        <div className="mt-6">
          <InscriptionForm regions={regions} categories={categories} clubs={clubs} seasonId={seasonId} />
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <h3 className="font-bold">¿Cómo funciona?</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Envías la solicitud con tu plantilla.</li>
            <li>2. El coordinador de tu región la valida.</li>
            <li>3. Confirmas el pago (pago móvil / transferencia).</li>
            <li>4. Quedas en el fixture de la fase regular.</li>
          </ol>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Atleta Dual</h3>
          <p className="mt-2 text-sm text-slate-600">
            Si compites en pádel y tenis playa, entras al ranking Atleta Dual. Cada deporte
            se inscribe y se paga por separado.
          </p>
        </div>
      </aside>
    </div>
  )
}
