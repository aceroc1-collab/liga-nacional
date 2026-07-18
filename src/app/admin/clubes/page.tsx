import { requireStaffPage } from '@/lib/admin-gate'
import { getClubs, getRegions } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import ClubsAdmin from './ClubsAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Clubes' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const [clubs, regions] = await Promise.all([getClubs(), getRegions()])
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Clubes</h1>
      <AdminNav active="/admin/clubes" />
      <ClubsAdmin clubs={clubs} regions={regions} />
    </div>
  )
}
