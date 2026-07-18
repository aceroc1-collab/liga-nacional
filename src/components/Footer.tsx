import { BRAND } from '@/lib/config'
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col gap-2 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {BRAND.year} {BRAND.fullName} · {BRAND.country}</p>
        <p className="text-slate-400">Un circuito, dos deportes · Atleta Dual</p>
      </div>
    </footer>
  )
}
