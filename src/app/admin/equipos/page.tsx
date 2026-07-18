import { requireStaffPage } from '@/lib/admin-gate'
import { getTeams, getRegions, getCategories, getClubs, getPlayers } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import { getActiveSeasonId } from '@/lib/data'
import AdminNav from '@/components/AdminNav'
import TeamsAdmin from './TeamsAdmin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Equipos' }

async function getRosters(teamIds: string[]): Promise<Record<string, any[]>> {
  if (teamIds.length === 0) return {}
  try {
    const s = createClient()
    const { data } = await s.from('team_players')
      .select('team_id, player_id, is_captain, player:player_id(full_name)').in('team_id', teamIds)
    const map: Record<string, any[]> = {}
    ;(data ?? []).forEach((r: any) => { (map[r.team_id] ??= []).push(r) })
    return map
  } catch { return {} }
}

export default async function Page() {
  const gate = await requireStaffPage()
  if (gate.blocked) return <div className="container-app py-16 text-center text-slate-500">Sin permisos de staff.</div>
  const [teams, regions, categories, clubs, players, seasonId] = await Promise.all([
    getTeams(), getRegions(), getCategories(), getClubs(), getPlayers(), getActiveSeasonId(),
  ])
  const rosters = await getRosters(teams.map((t:any)=>t.id))
  return (
    <div className="container-app py-10">
      <h1 className="mb-4 text-2xl font-black text-noche">Panel · Equipos y Plantillas</h1>
      <AdminNav active="/admin/equipos" />
      <TeamsAdmin teams={teams} regions={regions} categories={categories} clubs={clubs}
        players={players} rosters={rosters} seasonId={seasonId} />
    </div>
  )
}
