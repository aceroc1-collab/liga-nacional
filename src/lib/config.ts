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

// Precios de inscripción por deporte (sin descuento por atleta dual)
export const PRICES = {
  currency: 'USD',
  symbol: '$',
  padel: 80,
  playa: 75,
} as const
