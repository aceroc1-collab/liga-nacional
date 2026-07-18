import { requireStaffPage } from '@/lib/admin-gate'
import { getPlayers, getRegions, getClubs } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import PlayersAdmin from './PlayersAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Jugadores' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const [players, regions, clubs] = await Promise.all([getPlayers(), getRegions(), getClubs()])
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Jugadores</h1>
      <AdminNav active="/admin/jugadores" />
      <PlayersAdmin players={players} regions={regions} clubs={clubs} />
    </div>
  )
}
