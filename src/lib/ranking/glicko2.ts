// ============================================================================
// Glicko-2  ·  Motor de rating oculto (Capa B) — LIGA ARENAPADEL TOUR
// Implementación de referencia de Mark Glickman (glicko.net/glicko/glicko2.pdf)
// Puro, sin dependencias, 100% testeable. NO se muestra el número al usuario:
// alimenta desempates, categorías (A/B/C/D) y emparejamientos justos.
// ============================================================================

export const SCALE = 173.7178
export const DEFAULT_RATING = 1500
export const DEFAULT_RD = 350
export const DEFAULT_VOL = 0.06
export const DEFAULT_TAU = 0.5 // constante del sistema (0.3–1.2). Menor = más suave

export interface Rating {
  rating: number // r  (escala visible, 1500 = medio)
  rd: number     // RD (incertidumbre)
  vol: number    // σ  (volatilidad)
}

export interface GameResult {
  opponent: Rating
  score: number // 1 = ganó, 0.5 = empate, 0 = perdió
}

export function defaultRating(): Rating {
  return { rating: DEFAULT_RATING, rd: DEFAULT_RD, vol: DEFAULT_VOL }
}

const g = (phi: number) => 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI))
const E = (mu: number, muj: number, phij: number) =>
  1 / (1 + Math.exp(-g(phij) * (mu - muj)))

/**
 * Actualiza el rating de un jugador tras un período con una lista de partidos.
 * Si no jugó partidos en el período, solo aumenta la incertidumbre (RD).
 */
export function rate(player: Rating, games: GameResult[], tau = DEFAULT_TAU): Rating {
  // 1. A escala Glicko-2
  const mu = (player.rating - DEFAULT_RATING) / SCALE
  const phi = player.rd / SCALE
  const sigma = player.vol

  // Sin partidos: solo crece la incertidumbre
  if (games.length === 0) {
    const phiStar = Math.sqrt(phi * phi + sigma * sigma)
    return { rating: player.rating, rd: phiStar * SCALE, vol: sigma }
  }

  // 2. Varianza estimada v y delta
  let vInv = 0
  let deltaSum = 0
  for (const gm of games) {
    const muj = (gm.opponent.rating - DEFAULT_RATING) / SCALE
    const phij = gm.opponent.rd / SCALE
    const gPhij = g(phij)
    const eVal = E(mu, muj, phij)
    vInv += gPhij * gPhij * eVal * (1 - eVal)
    deltaSum += gPhij * (gm.score - eVal)
  }
  const v = 1 / vInv
  const delta = v * deltaSum

  // 3. Nueva volatilidad σ' (algoritmo Illinois)
  const a = Math.log(sigma * sigma)
  const f = (x: number) => {
    const ex = Math.exp(x)
    const num = ex * (delta * delta - phi * phi - v - ex)
    const den = 2 * Math.pow(phi * phi + v + ex, 2)
    return num / den - (x - a) / (tau * tau)
  }
  let A = a
  let B: number
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v)
  } else {
    let k = 1
    while (f(a - k * tau) < 0) k += 1
    B = a - k * tau
  }
  let fA = f(A)
  let fB = f(B)
  const EPS = 1e-6
  while (Math.abs(B - A) > EPS) {
    const C = A + ((A - B) * fA) / (fB - fA)
    const fC = f(C)
    if (fC * fB <= 0) {
      A = B
      fA = fB
    } else {
      fA = fA / 2
    }
    B = C
    fB = fC
  }
  const newVol = Math.exp(A / 2)

  // 4. Nuevo RD (phi') y nuevo rating (mu')
  const phiStar = Math.sqrt(phi * phi + newVol * newVol)
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v)
  const newMu = mu + newPhi * newPhi * deltaSum

  return {
    rating: newMu * SCALE + DEFAULT_RATING,
    rd: newPhi * SCALE,
    vol: newVol,
  }
}

/** Combina dos jugadores en un "rating de equipo" (pádel/playa son de parejas). */
export function teamRating(a: Rating, b: Rating): Rating {
  // rating = promedio; RD combinado = raíz de la media de cuadrados (incertidumbre conjunta)
  return {
    rating: (a.rating + b.rating) / 2,
    rd: Math.sqrt((a.rd * a.rd + b.rd * b.rd) / 2),
    vol: (a.vol + b.vol) / 2,
  }
}

/** Categoría automática A/B/C/D sugerida a partir del rating (con RD bajo). */
export function suggestCategory(r: Rating): 'A' | 'B' | 'C' | 'D' | null {
  if (r.rd > 150) return null // aún no hay certeza suficiente
  if (r.rating >= 1800) return 'A'
  if (r.rating >= 1600) return 'B'
  if (r.rating >= 1400) return 'C'
  return 'D'
}
