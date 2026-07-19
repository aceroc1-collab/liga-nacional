import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,              // ArenaPadel Tour VZLA
    short_name: BRAND.name,            // ArenaPadel Tour  (nombre bajo el ícono)
    description: BRAND.tagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: BRAND.colors.noche,
    theme_color: BRAND.colors.noche,
    categories: ['sports'],
    icons: [
      { src: '/icon-512.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
