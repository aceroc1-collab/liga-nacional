import { requireStaffPage } from '@/lib/admin-gate'
import AdminNav from '@/components/AdminNav'
import { getClaims } from '@/lib/data'
import ClaimsAdmin from './ClaimsAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Reclamos' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const claims = await getClaims()
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Reclamos</h1>
      <AdminNav active="/admin/reclamos" />
      <ClaimsAdmin claims={claims} />
    </div>
  )
}
