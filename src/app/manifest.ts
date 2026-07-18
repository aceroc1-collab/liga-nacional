import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,
    short_name: BRAND.name,
    description: `${BRAND.tagline}`,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND.colors.noche,
    theme_color: BRAND.colors.noche,
    icons: [
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
