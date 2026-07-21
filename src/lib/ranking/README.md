# Motor de Ranking Híbrido — LIGA ARENAPADEL TOUR

Sistema de dos capas para pádel, tenis playa y dual.

## Archivos
- `glicko2.ts` — núcleo Glicko-2 puro (rating oculto). Testeado contra el ejemplo canónico de Glickman.
- `engine.ts` — recálculo idempotente de ratings desde los rubbers de la liga (parejas).
- `verify.mts` — pruebas ejecutables: `npx tsx src/lib/ranking/verify.mts`
- `../../app/admin/actions-ranking.ts` — server action `recomputeHiddenRatings()` que conecta el motor con Supabase.
- `../../../supabase/hybrid_ranking.sql` — tabla `player_ratings`, vistas deterministas y DUAL normalizado.

## Puesta en marcha (3 pasos)
1. **SQL:** en Supabase → SQL Editor, ejecuta `supabase/hybrid_ranking.sql` (después de `schema.sql`).
2. **App:** el código ya está integrado. En el panel admin aparece el botón "🧠 Motor de Ranking → Recalcular ratings ahora".
3. **Correr:** pulsa el botón (o llama a `recomputeHiddenRatings()` desde un cron). Recalcula todo desde cero, idempotente.

## Qué arregla
- **Bug de carga:** orden determinista en las vistas → el ranking ya no cambia al recargar.
- **DUAL justo:** normaliza cada deporte a 0–1000 antes de combinar (no suma puntos crudos de deportes distintos).
- **Nivel real oculto:** Glicko-2 con RD y volatilidad → desempate justo, categorías A/B/C/D, seeding.

## Capas
- **Capa A (pública):** `player_points` → vistas `v_player_ranking`, `v_dual_ranking`, `v_team_standings`.
- **Capa B (oculta):** `player_ratings` (Glicko). El número NO se muestra al usuario.

Ver la spec completa: `ARENAPADEL_Motor_Ranking_Hibrido_v1.md`.
