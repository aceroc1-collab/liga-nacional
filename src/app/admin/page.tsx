import Link from 'next/link'
import { requireStaffPage } from '@/lib/admin-gate'
import { getPlayers } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import PhotoUploader from './PhotoUploader'
import { InscriptionsTable, MatchesTable } from './AdminTables'
import RatingsRecompute from './RatingsRecompute'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Panel Admin' }

const sections = [
  { href: '/admin/clubes', label: 'Clubes', icon: '🏟️', desc: 'Agregar y eliminar sedes' },
  { href: '/admin/jugadores', label: 'Jugadores', icon: '👤', desc: 'Atletas y fotos' },
  { href: '/admin/equipos', label: 'Equipos', icon: '🛡️', desc: 'Equipos y plantillas' },
  { href: '/admin/partidos', label: 'Partidos', icon: '🎾', desc: 'Resultados y puntos' },
  { href: '/admin/patrocinios', label: 'Patrocinios', icon: '🤝', desc: 'Alianzas y logos' },
]

export default async function AdminPage() {
  const gate = await requireStaffPage()
  if (gate.blocked) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-black text-noche">Panel de la Liga</h1>
        <p className="mt-2 text-slate-500">Tu cuenta ({gate.user.email}) no tiene permisos de staff.</p>
        <p className="mt-1 text-sm text-slate-400">Un administrador debe cambiar tu rol a <code>admin</code> o <code>coordinador</code>.</p>
      </div>
    )
  }
  const supabase = gate.supabase
  const [insc, matches, players] = await Promise.all([
    supabase.from('inscriptions').select('*').in('status', ['pendiente','borrador']).order('created_at', { ascending: false }),
    supabase.from('matches').select('id, round_label, home_rubbers, away_rubbers, home:home_team_id(name), away:away_team_id(name)').neq('status','finalizado').limit(50),
    getPlayers(),
  ])
  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-black text-noche">Panel de la Liga</h1>
      <p className="mb-4 mt-1 text-slate-500">Hola {gate.profile?.full_name ?? gate.user.email} · rol {gate.profile?.role}</p>
      <AdminNav active="/admin" />

      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {sections.map(s => (
          <Link key={s.href} href={s.href} className="card p-4 transition hover:shadow-md">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-1 font-bold">{s.label}</div>
            <div className="text-xs text-slate-400">{s.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InscriptionsTable rows={insc.data ?? []} />
        <MatchesTable rows={(matches.data ?? []) as any[]} />
        <PhotoUploader players={players} />
        <RatingsRecompute />
      </div>
    </div>
  )
}
