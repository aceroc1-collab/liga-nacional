import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/config'

export const metadata: Metadata = {
  title: { default: BRAND.fullName, template: `%s · ${BRAND.name}` },
  description: `${BRAND.tagline}. La liga amateur por equipos que une pádel y tenis playa.`,
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
