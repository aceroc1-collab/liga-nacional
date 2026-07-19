import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/config'

const SITE = 'https://liga-nacional.vercel.app'
const DESC = `${BRAND.tagline}. La liga amateur por equipos que une pádel y tenis playa: rankings, atleta dual, clubes, resultados y más.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: BRAND.fullName, template: `%s · ${BRAND.name}` },
  description: DESC,
  applicationName: BRAND.fullName,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { url: '/logo.png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: BRAND.name,                 // nombre bajo el ícono en iPhone
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website', siteName: BRAND.fullName, title: BRAND.fullName, description: DESC,
    url: SITE, locale: 'es_VE',
    images: [{ url: '/logo.png', width: 1421, height: 744, alt: BRAND.fullName }],
  },
  twitter: {
    card: 'summary_large_image', title: BRAND.fullName, description: DESC, images: ['/logo.png'],
  },
}

export const viewport: Viewport = {
  themeColor: BRAND.colors.noche,
  width: 'device-width', initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Nav />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
