import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRegions } from '@/lib/data'
import ClaimProfileForm from './ClaimProfileForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reclama tu perfil' }

export default async function ReclamaPage() {
  const s: any = createClient()
  const { data: { user } } = await s.auth.getUser()
  const regions = await getRegions()

  let sugerido: any = null
  let yaActivo = false
  if (user?.email) {
    try {
      const db = createAdminClient()
      const { data } = await db.from('players')
        .select('id, full_name, cedula, status, user_id')
        .eq('email', user.email.toLowerCase().trim()).limit(1)
      const p = (data || [])[0]
      if (p?.user_id) yaActivo = true
      else if (p) sugerido = p
    } catch {}
  }

  return (
    <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-3xl font-black text-noche">Reclama tu perfil</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Si tu correo ya está en el padrón del circuito, tu perfil y tu <b>nivel ya están calculados</b> en ArenaPadel Tour.
          Reclámalo, elige tu zona y aparece en el ranking oficial.
        </p>

        <div className="mt-6">
          {!user ? (
            <div className="card p-6">
              <p className="font-semibold text-noche">Primero inicia sesión o regístrate</p>
              <p className="mt-1 text-sm text-slate-600">
                Usa el <b>mismo correo</b> con el que te inscribiste en el torneo — así te reconocemos al instante.
              </p>
              <Link href="/login" className="btn-primary mt-4 inline-block">Iniciar sesión / Registrarme</Link>
            </div>
          ) : yaActivo ? (
            <div className="card p-6">
              <div className="text-3xl">✅</div>
              <p className="mt-2 font-bold text-noche">Tu perfil ya está activo</p>
              <p className="mt-1 text-sm text-slate-600">Ya reclamaste tu lugar. Puedes ver tu ranking cuando quieras.</p>
              <Link href="/rankings" className="btn-primary mt-4 inline-block">Ver rankings</Link>
            </div>
          ) : (
            <ClaimProfileForm regions={regions} sugerido={sugerido} />
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <h3 className="font-bold">Tu nivel ya está listo</h3>
          <p className="mt-2 text-sm text-slate-600">
            Sembramos tu nivel inicial según tu categoría. En cuanto juegues, el motor lo ajusta
            solo — subes o bajas según tu rendimiento real y el de tus rivales.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">¿No te encontramos?</h3>
          <p className="mt-2 text-sm text-slate-600">
            Asegúrate de usar el correo del torneo. Si aún no aparece, escríbenos por{' '}
            <Link href="/reclamos" className="text-pista underline">Reclamos</Link> y te ayudamos.
          </p>
        </div>
      </aside>
    </div>
  )
}
