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
export async function getPlayerRanking(sport: Sport) {
  const s = await db()
  return safe<PlayerRankingRow[]>(
    s.from('v_player_ranking').select('*').eq('sport', sport).order('position').limit(200))
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
