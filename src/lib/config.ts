// ============================================================
//  MARCA / IDENTIDAD — cambia estos valores y se actualiza toda la app.
// ============================================================
export const BRAND = {
  name: 'ArenaPadel Tour',
  fullName: 'ArenaPadel Tour VZLA',
  tagline: 'Un circuito, dos deportes · Venezuela',
  shortName: 'APT',
  country: 'Venezuela',
  year: 2027,
  logo: '/logo.png',            // logo de la marca (en /public/logo.png)
  // Colores (también en tailwind.config.ts) — afinados al logo ArenaPadel
  colors: { padel: '#2A9D8F', playa: '#E9C46A', noche: '#0B1F3A', brasa: '#E76F51' },
  social: { instagram: '', whatsapp: '' },
}

export const SPORTS = {
  padel: { label: 'Pádel', slug: 'padel', color: BRAND.colors.padel, icon: '🎾' },
  playa: { label: 'Tenis Playa', slug: 'playa', color: BRAND.colors.playa, icon: '🏖️' },
} as const

export type SportKey = keyof typeof SPORTS

// ============================================================
//  PRECIOS DE INSCRIPCIÓN (USD) — sin descuento por atleta dual
// ============================================================
export const FEES = {
  currency: 'USD',
  symbol: '$',
  padel: 80,
  playa: 75,
  dualDiscount: 0, // sin descuento por atleta dual
} as const

/** Monto de inscripción según deporte y si es dual (−10%). */
export function inscriptionAmount(sport: 'padel' | 'playa', dual: boolean): number {
  const base = FEES[sport]
  const amount = dual ? base * (1 - FEES.dualDiscount) : base
  return Math.round(amount * 100) / 100
}
