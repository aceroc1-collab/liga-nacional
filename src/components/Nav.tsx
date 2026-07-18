import Link from 'next/link'
import { BRAND } from '@/lib/config'

const links = [
  { href: '/estadisticas', label: 'Dashboard' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/clubes', label: 'Clubes' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/patrocinios', label: 'Patrocinios' },
  { href: '/inscripciones', label: 'Inscripciones' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={BRAND.logo} alt={BRAND.fullName}
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200" />
          <span className="font-black leading-tight text-noche">
            {BRAND.name}
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brasa">VZLA</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-noche">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary ml-2 px-3 py-2 text-sm">Entrar</Link>
        </div>
      </nav>
    </header>
  )
}
