'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/config'

const links = [
  { href: '/estadisticas', label: 'Dashboard' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/clubes', label: 'Clubes' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/reglamento', label: 'Reglamento' },
  { href: '/patrocinios', label: 'Patrocinios' },
  { href: '/inscripciones', label: 'Inscripciones' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-app flex h-16 items-center justify-between gap-2">
        {/* Logo + marca */}
        <Link href="/" onClick={()=>setOpen(false)} className="flex min-w-0 items-center gap-2.5">
          <img src={BRAND.logo} alt={BRAND.fullName}
            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
          <span className="min-w-0 truncate font-black leading-tight text-noche">
            {BRAND.name}
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brasa">VZLA</span>
          </span>
        </Link>

        {/* Links en escritorio */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-noche">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary ml-2 px-3 py-2 text-sm">Entrar</Link>
        </div>

        {/* Botón hamburguesa en móvil */}
        <button onClick={()=>setOpen(!open)} aria-label="Menú"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-slate-300 lg:hidden">
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-noche transition ${open?'translate-y-2 rotate-45':''}`} />
            <span className={`block h-0.5 w-5 bg-noche transition ${open?'opacity-0':''}`} />
            <span className={`block h-0.5 w-5 bg-noche transition ${open?'-translate-y-2 -rotate-45':''}`} />
          </div>
        </button>
      </nav>

      {/* Menú desplegable móvil */}
      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-app flex flex-col py-2">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={()=>setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={()=>setOpen(false)} className="btn-primary mt-2">Entrar</Link>
          </div>
        </div>
      )}
    </header>
  )
}
