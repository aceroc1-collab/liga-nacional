import ClaimForm from './ClaimForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reclamos' }

export default function ReclamosPage() {
  return (
    <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-3xl font-black text-noche">Reclamos y reportes</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          La liga se sostiene sobre la confianza. Si detectas una irregularidad —especialmente un
          atleta compitiendo en una categoría por debajo de su nivel— repórtalo aquí. El comité
          revisa cada caso.
        </p>
        <div className="mt-6"><ClaimForm /></div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <h3 className="font-bold">¿Cómo funciona?</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li>1. Envías el reclamo con el mayor detalle posible.</li>
            <li>2. El comité lo revisa junto al historial y al nivel real del atleta.</li>
            <li>3. Se toma una decisión y te contactamos.</li>
            <li>4. Si procede, se aplica la reclasificación.</li>
          </ol>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Sobre el “robo de categorías”</h3>
          <p className="mt-2 text-sm text-slate-600">
            Nuestro motor calcula el <b>nivel real</b> de cada atleta a partir de sus resultados y de la
            calidad de sus rivales. Cuando alguien rinde muy por encima de su categoría, el sistema
            lo detecta solo y lo propone para reclasificación. Tu reporte acelera esa revisión.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Juego limpio</h3>
          <p className="mt-2 text-sm text-slate-600">
            Los reclamos infundados o hechos de mala fe también se registran. Reporta con
            responsabilidad.
          </p>
        </div>
      </aside>
    </div>
  )
}
