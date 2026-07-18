import { BRAND, SPORTS } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reglamento' }

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>
}

function CatTable({ rows, color }: { rows: [string, string, string][]; color: string }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
          <tr><th className="p-2.5">Categoría</th><th className="p-2.5">Nivel</th><th className="p-2.5">Modalidad</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="p-2.5 font-bold text-noche">{r[0]}</td>
              <td className="p-2.5 text-slate-600">{r[1]}</td>
              <td className="p-2.5 text-slate-500">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  )
}

export default function ReglamentoPage() {
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-noche">Reglamento Oficial</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Resumen de las reglas de juego de {BRAND.fullName}. Un circuito, dos deportes: pádel (modelo SNP)
        y tenis playa (modelo ITF/FITP), unidos por el ranking Atleta Dual.
      </p>

      {/* Índice rápido */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a href="#padel" className="badge text-white" style={{ backgroundColor: SPORTS.padel.color }}>🎾 Reglamento Pádel</a>
        <a href="#playa" className="badge text-white" style={{ backgroundColor: SPORTS.playa.color }}>🏖️ Reglamento Tenis Playa</a>
        <a href="#fases" className="badge bg-noche text-white">🏆 Fases y Master</a>
        <a href="#dual" className="badge bg-brasa text-white">⭐ Atleta Dual</a>
      </div>

      {/* ===================== PÁDEL ===================== */}
      <section id="padel" className="mt-10 scroll-mt-20">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl text-white" style={{ backgroundColor: SPORTS.padel.color }}>🎾</span>
          <h2 className="text-2xl font-black text-noche">Circuito Pádel</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4">
            <Rule title="Formato de la eliminatoria">
              Cada enfrentamiento entre dos equipos se juega en <b>dobles</b>: <b>5 partidos de parejas</b>.
              Gana el equipo que primero se lleva <b>3 partidos</b>. Se requieren mínimo <b>10 jugadores</b> y <b>3 pistas</b>.
            </Rule>
            <Rule title="Puntuación de la eliminatoria">
              Hay <b>12 puntos en juego</b>, repartidos por orden de parejas <b>(3-3-2-2-2)</b>. En la plataforma,
              el ganador de la eliminatoria suma puntos de equipo y cada jugador suma por partido ganado (alimenta el ranking).
            </Rule>
            <Rule title="Reglas de cancha">
              El equipo local aporta bolas nuevas. El <b>orden de parejas</b> se declara antes de iniciar y es obligatoria
              la <b>identificación</b> de los jugadores.
            </Rule>
            <Rule title="Ascensos y descensos">
              Al cierre de la fase regular hay ascensos y descensos entre categorías, por zona de proximidad.
            </Rule>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold text-noche">Categorías de Pádel</h3>
            <CatTable color={SPORTS.padel.color} rows={[
              ['Grand Slam','Pro / Avanzado','Masculino y Femenino'],
              ['1000','Medio-Alto','Masculino y Femenino'],
              ['500','Intermedio','Masculino y Femenino'],
              ['Future','Iniciación','Masculino y Femenino'],
              ['Seniors','Veteranos','Masculino y Femenino'],
              ['Mixto','Todos los niveles','Parejas mixtas'],
            ]} />
          </Card>
        </div>
      </section>

      {/* ===================== TENIS PLAYA ===================== */}
      <section id="playa" className="mt-10 scroll-mt-20">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ backgroundColor: SPORTS.playa.color }}>🏖️</span>
          <h2 className="text-2xl font-black text-noche">Circuito Tenis Playa</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4">
            <Rule title="Formato del encuentro">
              Se juega siempre en <b>dobles</b>. Cada encuentro por equipos incluye <b>dobles masculino, femenino y mixto</b>
              (de 3 a 5 rubbers según la división).
            </Rule>
            <Rule title="Puntuación del partido">
              Cada partido individual: <b>2 sets a 6 juegos</b>; el tercer set se decide por <b>match tie-break a 10 puntos</b>
              (modelo FITP). Gana el encuentro quien se lleva la mayoría de los dobles.
            </Rule>
            <Rule title="Puntos de la liga">
              En fase de grupos: <b>2 puntos</b> por encuentro ganado y 0 por perdido. Cada jugador suma en su ranking por partido ganado.
            </Rule>
            <Rule title="Cancha y material">
              Cancha de arena de <b>16 x 8 m</b>, red a <b>1,70 m</b>, <b>pelota naranja Stage 2</b> (baja compresión) y
              palas de tenis playa homologadas.
            </Rule>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold text-noche">Categorías de Tenis Playa</h3>
            <CatTable color={SPORTS.playa.color} rows={[
              ['Serie A','Élite / Avanzado','Dobles M, F y Mixto'],
              ['Serie B','Intermedio','Dobles M, F y Mixto'],
              ['Serie C','Iniciación','Dobles M, F y Mixto'],
              ['Juvenil','Sub-12 / 14 / 16 / 18','Por categoría de edad'],
              ['Seniors','Veteranos','Dobles M, F y Mixto'],
              ['Mixto','Todos los niveles','Parejas mixtas'],
            ]} />
          </Card>
        </div>
      </section>

      {/* ===================== FASES ===================== */}
      <section id="fases" className="mt-10 scroll-mt-20">
        <h2 className="mb-4 text-2xl font-black text-noche">🏆 Fases de la temporada</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['1. Fase Regular Zonal','Liga a ida y vuelta por proximidad. Pádel y playa en paralelo, sin choques de calendario.'],
            ['2. Playoffs Regionales','Eliminatorias por el título de cada región y el pase a la fase nacional.'],
            ['3. Interseries Nacional','Cruces entre los campeones regionales de cada deporte.'],
            ['4. Master Nacional','Gran final de ambos deportes el mismo fin de semana — festival raqueta con premiación.'],
          ].map((f, i) => (
            <Card key={i}>
              <div className="text-sm font-black text-noche">{f[0]}</div>
              <p className="mt-1 text-sm text-slate-600">{f[1]}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ===================== ATLETA DUAL ===================== */}
      <section id="dual" className="mt-10 scroll-mt-20">
        <div className="card bg-gradient-to-r from-noche to-pista p-6 text-white">
          <h2 className="text-xl font-black">⭐ Ranking Atleta Dual</h2>
          <p className="mt-2 max-w-3xl text-white/85">
            El corazón del circuito: quien compite en <b>ambos deportes</b> (pádel y tenis playa) entra al ranking
            Atleta Dual, que suma sus puntos de los dos circuitos con un <b>bonus especial</b>. Es un incentivo único
            que premia al atleta más completo del país.
          </p>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-slate-400">
        Este es un resumen de las reglas para consulta pública. El reglamento oficial completo por deporte
        rige la competición y puede detallar situaciones específicas (walkovers, sanciones, desempates).
      </p>
    </div>
  )
}
