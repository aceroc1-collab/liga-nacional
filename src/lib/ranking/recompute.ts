// Lógica de recálculo del rating oculto — compartida por el botón admin y el cron.
import { recomputeRatings, RubberInput } from './engine'
import { suggestCategory } from './glicko2'

export interface RecomputeResult { ok: boolean; message: string; updated?: number }

export async function runRecompute(s: any): Promise<RecomputeResult> {
  const { data, error } = await s
    .from('match_rubbers')
    .select('home_p1, home_p2, away_p1, away_p2, home_won, matches!inner(sport, status, scheduled_at)')
    .not('home_won', 'is', null)
    .eq('matches.status', 'finalizado')

  if (error) return { ok: false, message: error.message }

  const rubbers: RubberInput[] = (data ?? []).map((row: any) => ({
    sport: row.matches.sport,
    playedAt: row.matches.scheduled_at,
    homeP1: row.home_p1, homeP2: row.home_p2,
    awayP1: row.away_p1, awayP2: row.away_p2,
    homeWon: row.home_won === true,
  }))

  const rows = recomputeRatings(rubbers)
  const payload = rows.map(r => ({
    player_id: r.playerId, sport: r.sport,
    rating: r.rating, rd: r.rd, vol: r.vol, matches: r.matches,
    category: suggestCategory({ rating: r.rating, rd: r.rd, vol: r.vol }),
    updated_at: new Date().toISOString(),
  }))

  if (payload.length > 0) {
    const { error: upErr } = await s
      .from('player_ratings')
      .upsert(payload, { onConflict: 'player_id,sport' })
    if (upErr) return { ok: false, message: upErr.message }
  }
  return { ok: true, message: `Ratings recalculados: ${payload.length} registros jugador-deporte`, updated: payload.length }
}
