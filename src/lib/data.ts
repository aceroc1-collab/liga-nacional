import { createClient } from '@/lib/supabase/server'
import type {
  Region, Category, Club, Player, Sponsor,
  PlayerRankingRow, DualRankingRow, TeamStandingRow, Sport
} from '@/lib/types'

async function db() { return createClient() }
// Acepta el query builder de Supabase (thenable) y nunca lanza: devuelve [] ante error.
const safe = async <T,>(q: any): Promise<T> => {
  try { const { data } = await q; return (data ?? []) as T } catch { return ([] as unknown) as T }
}

export async function getRegions() {
  const s = await db()
  return safe<Region[]>(s.from('regions').select('*').order('sort_order'))
}
export async function getCategories(sport?: Sport) {
  const s = await db()
  let q = s.from('categories').select('*').order('sort_order')
  if (sport) q = q.eq('sport', sport)
  return safe<Category[]>(q)
}
export async function getClubs() {
  const s = await db()
  return safe<Club[]>(s.from('clubs').select('*').order('name'))
}
export async function getClubBySlug(slug: string) {
  const s = await db()
  try { const { data } = await s.from('clubs').select('*').eq('slug', slug).single(); return data as Club | null }
  catch { return null }
}
export async function getSponsors() {
  const s = await db()
  return safe<Sponsor[]>(s.from('sponsors').select('*').eq('is_active', true).order('sort_order'))
}
export async function getPlayerRanking(
  sport: Sport,
  opts: { gender?: string; categoryName?: string; regionId?: string; search?: string; limit?: number } = {}
) {
  const s = await db()
  let q = s.from('v_player_ranking').select('*').eq('sport', sport)
  if (opts.gender) q = q.eq('gender', opts.gender)
  if (opts.categoryName) q = q.eq('category_name', opts.categoryName)
  if (opts.regionId) q = q.eq('region_id', opts.regionId)
  if (opts.search && opts.search.trim()) q = q.ilike('full_name', `%${opts.search.trim()}%`)
  // Con categoría: posición determinista de la vista. Sin categoría (Todas): por puntos.
  q = opts.categoryName
    ? q.order('position')
    : q.order('points', { ascending: false }).order('full_name')
  return safe<PlayerRankingRow[]>(q.limit(opts.limit ?? 300))
}
export async function getDualRanking() {
  const s = await db()
  return safe<DualRankingRow[]>(
    s.from('v_dual_ranking').select('*').order('position').limit(200))
}
export async function getTeamStandings(sport?: Sport) {
  const s = await db()
  let q = s.from('v_team_standings').select('*').order('position')
  if (sport) q = q.eq('sport', sport)
  return safe<TeamStandingRow[]>(q)
}
export async function getPlayerBySlug(slug: string) {
  const s = await db()
  try { const { data } = await s.from('players').select('*').eq('slug', slug).single(); return data as Player | null }
  catch { return null }
}
export async function getPlayers() {
  const s = await db()
  return safe<Player[]>(s.from('players').select('*').order('full_name'))
}

export async function getMatches(sport?: Sport) {
  const s = await db()
  let q = s.from('matches')
    .select('id, sport, phase, round_label, bracket_slot, home_rubbers, away_rubbers, status, scheduled_at, home:home_team_id(name, slug), away:away_team_id(name, slug), region_id, category_id')
    .order('scheduled_at', { ascending: true, nullsFirst: false })
  if (sport) q = q.eq('sport', sport)
  try { const { data } = await q; return (data ?? []) as any[] } catch { return [] as any[] }
}

export async function getTeams() {
  const s = await db()
  return safe<any[]>(s.from('teams').select('*, club:club_id(name), category:category_id(name, gender)').order('name'))
}
export async function getActiveSeasonId(): Promise<string | null> {
  try { const s = await db(); const { data } = await s.from('seasons').select('id').eq('is_active', true).single(); return data?.id ?? null }
  catch { return null }
}
export async function getAdminMatches() {
  const s = await db()
  return safe<any[]>(s.from('matches')
    .select('id, sport, phase, round_label, home_rubbers, away_rubbers, status, home:home_team_id(name), away:away_team_id(name)')
    .order('created_at', { ascending: false }).limit(100))
}

export type Dashboard = {
  totals: { players: number; duals: number; clubs: number; teams: number; matches: number; padelPlayers: number; playaPlayers: number }
  byRegion: { name: string; players: number; teams: number }[]
  topDual: { name: string; score: number }[]
  topPadel: { name: string; points: number }[]
  topPlaya: { name: string; points: number }[]
  clubs: { name: string; players: number; teams: number; points: number }[]
}

export async function getDashboard(): Promise<Dashboard> {
  const s = await db()
  const empty: Dashboard = { totals:{players:0,duals:0,clubs:0,teams:0,matches:0,padelPlayers:0,playaPlayers:0}, byRegion:[], topDual:[], topPadel:[], topPlaya:[], clubs:[] }
  try {
    const [players, clubs, teams, regions, standings, dual, padel, playa, matchesFin] = await Promise.all([
      safe<any[]>(s.from('players').select('id, region_id, home_club_id, plays_padel, plays_playa, is_dual')),
      safe<any[]>(s.from('clubs').select('id, name, region_id')),
      safe<any[]>(s.from('teams').select('id, club_id, region_id')),
      safe<any[]>(s.from('regions').select('id, name, sort_order').order('sort_order')),
      safe<any[]>(s.from('v_team_standings').select('team_id, points')),
      safe<any[]>(s.from('v_dual_ranking').select('full_name, dual_score').order('position').limit(10)),
      safe<any[]>(s.from('v_player_ranking').select('full_name, points, sport').eq('sport','padel').order('points', { ascending: false }).limit(10)),
      safe<any[]>(s.from('v_player_ranking').select('full_name, points, sport').eq('sport','playa').order('points', { ascending: false }).limit(10)),
      safe<any[]>(s.from('matches').select('id').eq('status','finalizado')),
    ])
    const teamPoints = new Map<string, number>()
    standings.forEach((r:any)=> teamPoints.set(r.team_id, Number(r.points)||0))
    const byRegion = regions.map((rg:any)=>({
      name: rg.name,
      players: players.filter((p:any)=>p.region_id===rg.id).length,
      teams: teams.filter((t:any)=>t.region_id===rg.id).length,
    }))
    const clubStats = clubs.map((c:any)=>{
      const clubTeams = teams.filter((t:any)=>t.club_id===c.id)
      return {
        name: c.name,
        players: players.filter((p:any)=>p.home_club_id===c.id).length,
        teams: clubTeams.length,
        points: clubTeams.reduce((a:number,t:any)=>a+(teamPoints.get(t.id)||0),0),
      }
    }).sort((a,b)=> b.points-a.points || b.players-a.players)
    return {
      totals: {
        players: players.length,
        duals: players.filter((p:any)=>p.is_dual).length,
        clubs: clubs.length, teams: teams.length, matches: matchesFin.length,
        padelPlayers: players.filter((p:any)=>p.plays_padel).length,
        playaPlayers: players.filter((p:any)=>p.plays_playa).length,
      },
      byRegion,
      topDual: dual.map((d:any)=>({ name:d.full_name, score:Number(d.dual_score)||0 })),
      topPadel: padel.map((d:any)=>({ name:d.full_name, points:Number(d.points)||0 })),
      topPlaya: playa.map((d:any)=>({ name:d.full_name, points:Number(d.points)||0 })),
      clubs: clubStats,
    }
  } catch { return empty }
}
