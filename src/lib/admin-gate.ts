import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireStaffPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (!profile || !['admin','coordinador'].includes(profile.role)) {
    return { blocked: true as const, user, profile, supabase }
  }
  return { blocked: false as const, user, profile, supabase }
}
