import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Inicio' },
  { href: '/admin/clubes', label: 'Clubes' },
  { href: '/admin/jugadores', label: 'Jugadores' },
  { href: '/admin/equipos', label: 'Equipos' },
  { href: '/admin/partidos', label: 'Partidos' },
  { href: '/admin/patrocinios', label: 'Patrocinios' },
  { href: '/admin/reclamos', label: 'Reclamos' },
  { href: '/admin/usuarios', label: 'Administradores' },
]

export default function AdminNav({ active }: { active: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map(l => (
        <Link key={l.href} href={l.href}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active===l.href?'bg-noche text-white':'text-slate-600 hover:bg-slate-100'}`}>
          {l.label}
        </Link>
      ))}
    </div>
  )
}
