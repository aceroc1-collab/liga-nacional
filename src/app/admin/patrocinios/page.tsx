import { requireStaffPage } from '@/lib/admin-gate'
import { getSponsors } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import SponsorsAdmin from './SponsorsAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Patrocinios' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const sponsors = await getSponsors()
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Patrocinios</h1>
      <AdminNav active="/admin/patrocinios" />
      <SponsorsAdmin sponsors={sponsors} />
    </div>
  )
}
