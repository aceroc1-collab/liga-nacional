import { rate, Rating } from './glicko2.ts'
import { recomputeRatings, RubberInput } from './engine.ts'

let pass = 0, fail = 0
function approx(name: string, got: number, want: number, tol: number) {
  const ok = Math.abs(got - want) <= tol
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got=${got.toFixed(4)} want=${want} (tol ${tol})`)
  ok ? pass++ : fail++
}

// 1) Ejemplo canónico de Glickman
const player: Rating = { rating: 1500, rd: 200, vol: 0.06 }
const res = rate(player, [
  { opponent: { rating: 1400, rd: 30,  vol: 0.06 }, score: 1 },
  { opponent: { rating: 1550, rd: 100, vol: 0.06 }, score: 0 },
  { opponent: { rating: 1700, rd: 300, vol: 0.06 }, score: 0 },
])
approx('Glickman rating', res.rating, 1464.06, 0.2)
approx('Glickman RD',     res.rd,     151.52, 0.3)
approx('Glickman vol',    res.vol,    0.05999, 0.0002)

// 2) Idempotencia: recomputar dos veces da lo mismo
const rubbers: RubberInput[] = [
  { sport:'padel', playedAt:'2026-01-05', homeP1:'a', homeP2:'b', awayP1:'c', awayP2:'d', homeWon:true },
  { sport:'padel', playedAt:'2026-01-12', homeP1:'a', homeP2:'c', awayP1:'b', awayP2:'d', homeWon:false },
  { sport:'padel', playedAt:'2026-01-19', homeP1:'a', homeP2:'d', awayP1:'b', awayP2:'c', homeWon:true },
  { sport:'playa', playedAt:'2026-01-06', homeP1:'a', homeP2:'e', awayP1:'f', awayP2:'g', homeWon:true },
]
const r1 = JSON.stringify(recomputeRatings(rubbers))
const r2 = JSON.stringify(recomputeRatings([...rubbers].reverse()))
console.log(`${r1===r2?'PASS':'FAIL'}  Idempotencia (orden de entrada no afecta resultado)`)
r1===r2 ? pass++ : fail++

// 3) Dominancia limpia: pareja (w1,w2) SIEMPRE gana a (l1,l2) → deben quedar por encima
const dom: RubberInput[] = Array.from({length:6}).map((_,i)=>({
  sport:'padel' as const, playedAt:`2026-02-0${i+1}`,
  homeP1:'w1', homeP2:'w2', awayP1:'l1', awayP2:'l2', homeWon:true,
}))
const dr = recomputeRatings(dom)
const W = dr.find(r=>r.playerId==='w1')!, L = dr.find(r=>r.playerId==='l1')!
console.log(`${W.rating>L.rating?'PASS':'FAIL'}  Ganador consistente > perdedor : w1=${W.rating} l1=${L.rating}`)
W.rating>L.rating ? pass++ : fail++

// 4) Separación por deporte: 'a' tiene rating padel y playa independientes
const rows = recomputeRatings(rubbers)
const A = rows.find(r=>r.playerId==='a' && r.sport==='padel')!
const aPlaya = rows.find(r=>r.playerId==='a' && r.sport==='playa')!
console.log(`${aPlaya && A.sport!==aPlaya.sport ? 'PASS':'FAIL'}  Ratings separados por deporte (padel vs playa)`)
aPlaya ? pass++ : fail++

console.log(`\n=== ${pass} PASS, ${fail} FAIL ===`)
if (fail>0) process.exit(1)
