import Link from 'next/link'
import { BRAND } from '@/lib/config'

const links = [
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
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-noche text-sm font-black text-white">
            {BRAND.shortName.slice(0,2)}
          </span>
          <span className="hidden font-black leading-tight text-noche sm:block">
            {BRAND.name}
            <span className="block text-[10px] font-medium tracking-wide text-slate-400">{BRAND.tagline}</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-noche">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary ml-2 px-3 py-2 text-sm">Entrar</Link>
        </div>
      </nav>
    </header>
  )
}
