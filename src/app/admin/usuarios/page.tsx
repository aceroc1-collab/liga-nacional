import { requireStaffPage } from '@/lib/admin-gate'
import AdminNav from '@/components/AdminNav'
import UsersAdmin from './UsersAdmin'
import { getRegions } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Administradores' }

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const [{ data: profiles }, regions] = await Promise.all([
    gate.supabase.from('profiles').select('id, full_name, role, region_id, created_at').order('created_at', { ascending: true }),
    getRegions(),
  ])
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Administradores</h1>
      <AdminNav active="/admin/usuarios" />
      <UsersAdmin profiles={profiles ?? []} regions={regions} meId={gate.user.id} meRole={gate.profile?.role ?? ''} />
    </div>
  )
}
