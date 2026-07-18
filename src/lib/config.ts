// ============================================================
//  MARCA / IDENTIDAD — cambia estos valores y se actualiza toda la app.
//  Cuando decidas la marca paraguas (Ruta A o B del dossier), edita SOLO
//  este archivo.
// ============================================================
export const BRAND = {
  name: 'Liga Nacional',
  fullName: 'Liga Nacional de Pádel & Tenis Playa',
  tagline: 'Un circuito, dos deportes · Venezuela',
  shortName: 'LNPP',
  country: 'Venezuela',
  year: 2026,
  // Colores (también en tailwind.config.ts)
  colors: { padel: '#2A9D8F', playa: '#E9C46A', noche: '#0B1F3A', brasa: '#E76F51' },
  social: { instagram: '', whatsapp: '' },
}

export const SPORTS = {
  padel: { label: 'Pádel', slug: 'padel', color: BRAND.colors.padel, icon: '🎾' },
  playa: { label: 'Tenis Playa', slug: 'playa', color: BRAND.colors.playa, icon: '🏖️' },
} as const

export type SportKey = keyof typeof SPORTS
