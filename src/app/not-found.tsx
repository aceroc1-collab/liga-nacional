import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="container-app grid min-h-[60vh] place-items-center text-center">
      <div>
        <h1 className="text-6xl font-black text-noche">404</h1>
        <p className="mt-2 text-slate-500">No encontramos esta página.</p>
        <Link href="/" className="btn-primary mt-6">Volver al inicio</Link>
      </div>
    </div>
  )
}
