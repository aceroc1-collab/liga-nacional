# 🎾🏖️ Liga Nacional de Pádel & Tenis Playa · Venezuela

Plataforma web estilo **SNP Galaxy** para la liga amateur por equipos que une **pádel y tenis playa**: inscripciones de clubes/equipos/jugadores, **ranking individual + ranking Atleta Dual**, perfiles con fotos, patrocinios, resultados y brackets del Master Nacional.

Construida con **Next.js 14 + Supabase (PostgreSQL) + Tailwind**, lista para desplegar en **Vercel**. Diseñada para escalar a miles de atletas y cientos de clubes.

---

## ✨ Qué incluye

| Área | Detalle |
|------|---------|
| **Inscripciones** | Clubes, equipos y plantillas de jugadores. Solicitud pública que el staff confirma. Elige región, deporte y categoría. |
| **Ranking individual** | Por deporte (pádel / tenis playa), con puntos automáticos por victoria en cada partido. |
| **Ranking Atleta Dual** | Suma pádel + playa con **bonus 15%** — la joya del proyecto. Solo atletas que compiten en ambos deportes. |
| **Clasificación de equipos** | Standings por deporte, categoría y región. |
| **Perfiles con fotos** | Jugador, equipo y club. Subida de imágenes a Supabase Storage. |
| **Patrocinios** | Alianzas por nivel (principal, oro, plata, categoría, Master). |
| **Resultados & brackets** | Fase regular + camino al Master Nacional (playoffs → interseries → master). |
| **Panel admin** | Confirmar inscripciones, finalizar eliminatorias (otorga puntos solo), subir fotos. |

La **marca es configurable** en un solo archivo: `src/lib/config.ts`. Cuando decidas la marca paraguas (Ruta A o B del dossier), edita solo ese archivo.

---

## 🚀 Puesta en marcha (≈ 30 minutos)

### 1. Crear el proyecto en Supabase
1. Entra a **https://supabase.com** → **New project**. Elige nombre, contraseña y región (recomendado: *East US* por latencia a Venezuela).
2. Espera a que termine de aprovisionar (~2 min).

### 2. Cargar la base de datos
En Supabase → **SQL Editor** → **New query**, pega y ejecuta **en este orden** (un archivo a la vez, botón *Run*):
1. `supabase/schema.sql`  — tablas, funciones y vistas de ranking
2. `supabase/rls.sql`     — seguridad (Row Level Security) y roles
3. `supabase/storage.sql` — bucket de fotos `media`
4. `supabase/seed.sql`    — datos demo (regiones, categorías, clubes, un resultado para ver rankings vivos)

> El `seed.sql` es opcional pero recomendado para ver la app con datos desde el minuto uno. Puedes borrar los datos demo luego.

### 3. Copiar las llaves de Supabase
Supabase → **Project Settings → API**. Copia:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Probar en local (opcional)
```bash
npm install
cp .env.example .env.local     # y rellena las dos variables
npm run dev                     # http://localhost:3000
```

### 5. Subir a GitHub
```bash
git init
git add .
git commit -m "Liga Nacional Pádel & Tenis Playa"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/liga-nacional.git
git push -u origin main
```

### 6. Desplegar en Vercel
1. Entra a **https://vercel.com** → **Add New → Project** → importa tu repo de GitHub.
2. En **Environment Variables** agrega las dos:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**. En ~1 minuto tendrás tu URL pública (`https://liga-nacional.vercel.app`).

### 7. Crear tu usuario admin
1. Regístrate en la app en `/login` (crear cuenta) con tu correo.
2. Confirma el correo (Supabase envía un email).
3. En Supabase → **Table Editor → profiles**, busca tu fila y cambia `role` a `admin`.
4. Entra a `/admin`: ya puedes confirmar inscripciones, cargar resultados y subir fotos.

---

## 🧮 Cómo funciona el ranking (automático)

- Al **finalizar una eliminatoria** (desde el panel admin, o `UPDATE matches SET status='finalizado'`), un **trigger** de Postgres otorga:
  - **Puntos de equipo**: 3 (pádel) / 2 (playa) al ganador, +5 bonus en fase Master.
  - **Puntos individuales**: 10 por cada partido/rubber ganado, para ambos jugadores de la pareja.
- Las **vistas** `v_player_ranking`, `v_dual_ranking` y `v_team_standings` recalculan la clasificación sola. El frontend solo lee.
- El **Dual Score** = (puntos pádel + puntos playa) × **1.15**. Solo aparece si el atleta tiene puntos en **ambos** deportes.

Puedes ajustar los valores en la función `award_points_on_finalize()` dentro de `schema.sql`.

---

## 🗂️ Estructura del proyecto

```
liga-nacional/
├── supabase/
│   ├── schema.sql      # tablas, trigger de puntos, vistas de ranking
│   ├── rls.sql         # seguridad por rol
│   ├── storage.sql     # bucket de fotos
│   └── seed.sql        # datos demo
├── src/
│   ├── lib/
│   │   ├── config.ts   # 👈 MARCA (cambia el nombre aquí)
│   │   ├── types.ts
│   │   ├── data.ts     # consultas a Supabase
│   │   └── supabase/   # clientes browser/server
│   ├── components/     # Nav, Footer, badges
│   ├── middleware.ts   # refresco de sesión
│   └── app/
│       ├── page.tsx            # landing
│       ├── rankings/           # individual · dual · equipos
│       ├── inscripciones/      # formulario + server action
│       ├── clubes/             # listado + detalle
│       ├── jugadores/[id]/     # perfil con fotos y puntos
│       ├── equipos/[id]/       # plantilla del equipo
│       ├── patrocinios/        # alianzas por nivel
│       ├── resultados/         # fase regular + brackets
│       ├── login/              # auth Supabase
│       └── admin/              # panel de la liga
└── README.md
```

## 🔐 Roles
`admin`, `coordinador` (staff, acceso al panel), `club_admin`, `capitan`, `jugador`, `arbitro`. Se asignan en la tabla `profiles`.

## 🌎 Regiones y categorías (del dossier)
- **5 regiones**: Capital, Central, Centro-Occidente, Occidente, Oriente e Insular.
- **Pádel**: Grand Slam, 1000, 500, Future, Seniors, Mixto (M/F).
- **Tenis Playa**: Serie A, B, C, Juvenil, Seniors, Mixto (modelo FITP/ITF).

---

## 📈 Próximos pasos sugeridos (Fase 2)
- Generación automática de fixtures/calendario por zona.
- Pasarela de pago integrada (pago móvil / transferencia con confirmación).
- App móvil / PWA y notificaciones por WhatsApp.
- Feed social con fotos y videos del Master.
- Proyección internacional (ITF Américas) para campeones.

---
*by David Navarrete · Julio 2026 · Documento y plataforma de trabajo.*
