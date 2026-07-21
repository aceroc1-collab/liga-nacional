// ============================================================================
// Motor de recálculo de ratings (Capa B) a partir de los rubbers de la liga.
// Idempotente: parte SIEMPRE de ratings por defecto y reprocesa en orden
// cronológico → correrlo N veces da EXACTAMENTE el mismo resultado.
// ============================================================================
import { Rating, defaultRating, rate, teamRating } from './glicko2'

export type Sport = 'padel' | 'playa'

/** Un rubber confirmado: dos parejas y quién ganó. */
export interface RubberInput {
  sport: Sport
  playedAt: string | Date | null
  homeP1: string | null
  homeP2: string | null
  awayP1: string | null
  awayP2: string | null
  homeWon: boolean
}

export interface RatingRow {
  playerId: string
  sport: Sport
  rating: number
  rd: number
  vol: number
  matches: number
}

const key = (playerId: string, sport: Sport) => `${sport}:${playerId}`

/**
 * Recalcula desde cero los ratings de todos los jugadores por deporte.
 * Procesa cada rubber como un mini-período (una partida) — enfoque secuencial,
 * robusto para ligas amateur con asistencia irregular.
 */
export function recomputeRatings(rubbers: RubberInput[]): RatingRow[] {
  const state = new Map<string, Rating>()
  const played = new Map<string, number>()

  const get = (playerId: string, sport: Sport): Rating => {
    const k = key(playerId, sport)
    let r = state.get(k)
    if (!r) {
      r = defaultRating()
      state.set(k, r)
    }
    return r
  }

  // Orden cronológico determinista (los sin fecha van al final, en orden estable)
  const sorted = [...rubbers].sort((a, b) => {
    const ta = a.playedAt ? new Date(a.playedAt).getTime() : Number.MAX_SAFE_INTEGER
    const tb = b.playedAt ? new Date(b.playedAt).getTime() : Number.MAX_SAFE_INTEGER
    return ta - tb
  })

  for (const rb of sorted) {
    const home = [rb.homeP1, rb.homeP2].filter(Boolean) as string[]
    const away = [rb.awayP1, rb.awayP2].filter(Boolean) as string[]
    if (home.length === 0 || away.length === 0) continue

    const homeRatings = home.map(id => get(id, rb.sport))
    const awayRatings = away.map(id => get(id, rb.sport))

    // rating de equipo rival (para actualizar a cada jugador contra el "equipo")
    const teamHome = homeRatings.reduce((acc, r) => teamRating(acc, r))
    const teamAway = awayRatings.reduce((acc, r) => teamRating(acc, r))

    // snapshot de nuevos valores (se aplican tras calcular ambos lados)
    const updates: Array<[string, Rating]> = []
    for (const id of home) {
      const nr = rate(get(id, rb.sport), [{ opponent: teamAway, score: rb.homeWon ? 1 : 0 }])
      updates.push([key(id, rb.sport), nr])
      played.set(key(id, rb.sport), (played.get(key(id, rb.sport)) ?? 0) + 1)
    }
    for (const id of away) {
      const nr = rate(get(id, rb.sport), [{ opponent: teamHome, score: rb.homeWon ? 0 : 1 }])
      updates.push([key(id, rb.sport), nr])
      played.set(key(id, rb.sport), (played.get(key(id, rb.sport)) ?? 0) + 1)
    }
    for (const [k, r] of updates) state.set(k, r)
  }

  const rows: RatingRow[] = []
  for (const [k, r] of state) {
    const [sport, playerId] = k.split(':') as [Sport, string]
    rows.push({
      playerId,
      sport,
      rating: Number(r.rating.toFixed(4)),
      rd: Number(r.rd.toFixed(4)),
      vol: Number(r.vol.toFixed(6)),
      matches: played.get(k) ?? 0,
    })
  }
  return rows
}
