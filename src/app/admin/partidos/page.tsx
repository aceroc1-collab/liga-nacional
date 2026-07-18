import { requireStaffPage } from '@/lib/admin-gate'
import { getTeams, getAdminMatches, getActiveSeasonId } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import MatchesAdmin from './MatchesAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Partidos' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const [teams, matches, seasonId] = await Promise.all([getTeams(), getAdminMatches(), getActiveSeasonId()])
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Partidos y Resultados</h1>
      <AdminNav active="/admin/partidos" />
      <p className="mb-4 text-sm text-slate-500">Crea partidos, pon el marcador (rubbers ganados) y dale Finalizar — los puntos del ranking se otorgan solos.</p>
      <MatchesAdmin teams={teams} matches={matches} seasonId={seasonId} />
    </div>
  )
}
