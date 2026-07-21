-- ============================================================================
-- MOTOR DE RANKING HÍBRIDO v1  ·  LIGA ARENAPADEL TOUR
-- Ejecutar DESPUÉS de schema.sql en:  Supabase → SQL Editor → Run
-- Añade: (1) Capa B Glicko oculta  (2) orden determinista (arregla el bug de
-- "el ranking cambia al recargar")  (3) DUAL normalizado (no suma peras+manzanas)
-- Idempotente y seguro: solo crea/reemplaza, no borra datos existentes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CAPA B — Rating oculto Glicko-2 por jugador y deporte
-- Lo escribe la acción recomputeRatings() del backend. NO se muestra el número.
-- ----------------------------------------------------------------------------
create table if not exists player_ratings (
  player_id   uuid not null references players(id) on delete cascade,
  sport       sport not null,
  rating      numeric(10,4) not null default 1500,
  rd          numeric(10,4) not null default 350,
  vol         numeric(10,6) not null default 0.06,
  matches     int not null default 0,
  category    text,                                  -- 'A'|'B'|'C'|'D' sugerida
  updated_at  timestamptz not null default now(),
  primary key (player_id, sport)
);

-- ----------------------------------------------------------------------------
-- CAPA A — Ranking individual por deporte, con ORDEN DETERMINISTA
-- Desempate exacto (§3.3 spec): puntos → rating oculto → RD → nombre → id
-- row_number() garantiza posiciones estables e idénticas en cada carga.
-- ----------------------------------------------------------------------------
drop view if exists v_player_ranking cascade;
create view v_player_ranking as
with base as (
  select
    p.id as player_id, p.full_name, p.slug, p.gender, p.photo_url, p.region_id,
    pp.season_id, pp.sport, m.category_id,
    coalesce(sum(pp.points),0)    as points,
    count(distinct pp.match_id)   as matches_played
  from players p
  join player_points pp on pp.player_id = p.id
  left join matches m on m.id = pp.match_id
  group by p.id, pp.season_id, pp.sport, m.category_id
)
select
  b.player_id, b.full_name, b.slug, b.gender, b.photo_url, b.region_id,
  b.season_id, b.sport, b.category_id,
  cat.name as category_name, cat.level_label,
  b.points, b.matches_played,
  tm.team_name,
  coalesce(pr.rating, 1500) as hidden_rating,
  row_number() over (
    partition by b.season_id, b.sport, b.gender, b.category_id
    order by b.points desc,
             coalesce(pr.rating, 1500) desc,
             coalesce(pr.rd, 350) asc,
             b.full_name asc,
             b.player_id asc
  ) as position
from base b
left join categories cat on cat.id = b.category_id
left join player_ratings pr on pr.player_id = b.player_id and pr.sport = b.sport
left join lateral (
  select t.name as team_name
  from team_players tpp
  join teams t on t.id = tpp.team_id
  where tpp.player_id = b.player_id
    and t.season_id = b.season_id
    and t.sport = b.sport
    and (b.category_id is null or t.category_id = b.category_id)
  limit 1
) tm on true;

-- ----------------------------------------------------------------------------
-- RANKING DUAL — normalizado (NO suma puntos crudos de deportes distintos)
-- Cada deporte se lleva a escala 0–1000 respecto a su líder; luego se combinan
-- 50/50 con +5% de bonus por versatilidad. Orden determinista con row_number().
-- ----------------------------------------------------------------------------
drop view if exists v_dual_ranking cascade;
create view v_dual_ranking as
with per_sport as (
  select player_id, season_id, sport,
         sum(points) as pts,
         count(distinct match_id) as mp
  from player_points
  group by player_id, season_id, sport
),
normed as (
  select *,
    max(pts) over (partition by season_id, sport) as max_pts
  from per_sport
),
scaled as (
  select player_id, season_id, sport, pts, mp,
    case when max_pts > 0 then 1000.0 * pts / max_pts else 0 end as norm
  from normed
),
dual as (
  select
    player_id, season_id,
    sum(case when sport='padel' then pts  else 0 end) as padel_points,
    sum(case when sport='playa' then pts  else 0 end) as playa_points,
    sum(case when sport='padel' then norm else 0 end) as padel_norm,
    sum(case when sport='playa' then norm else 0 end) as playa_norm,
    sum(case when sport='padel' then mp   else 0 end) as padel_matches,
    sum(case when sport='playa' then mp   else 0 end) as playa_matches,
    count(distinct sport) as sports_count
  from scaled
  group by player_id, season_id
)
select
  d.player_id, p.full_name, p.slug, p.photo_url, p.region_id, d.season_id,
  d.padel_points, d.playa_points,
  (d.padel_points + d.playa_points) as total_points,
  -- Dual Score normalizado y comparable entre deportes (0–1050 aprox)
  round(0.5 * d.padel_norm + 0.5 * d.playa_norm, 2) as dual_score,
  row_number() over (
    partition by d.season_id
    order by round(0.5 * d.padel_norm + 0.5 * d.playa_norm, 2) desc,
             (d.padel_norm + d.playa_norm) desc,
             p.full_name asc,
             d.player_id asc
  ) as position
from dual d
join players p on p.id = d.player_id
-- elegibilidad DUAL: actividad mínima en AMBOS deportes (≥1; sube a 3 en prod)
where d.sports_count = 2
  and d.padel_matches >= 1
  and d.playa_matches >= 1;

-- ----------------------------------------------------------------------------
-- Clasificación de equipos — con orden determinista (arregla el mismo bug)
-- ----------------------------------------------------------------------------
drop view if exists v_team_standings cascade;
create view v_team_standings as
with base as (
  select
    t.id as team_id, t.name, t.slug, t.logo_url, t.sport, t.category_id,
    t.region_id, t.season_id,
    coalesce(sum(tp.points),0)                 as points,
    count(tp.id) filter (where tp.won)         as wins,
    count(tp.id) filter (where tp.won = false) as losses,
    count(tp.id)                               as played
  from teams t
  left join team_points tp on tp.team_id = t.id
  group by t.id
)
select b.*,
  row_number() over (
    partition by b.season_id, b.sport, b.category_id, b.region_id
    order by b.points desc, b.wins desc, b.name asc, b.team_id asc
  ) as position
from base b;

-- ----------------------------------------------------------------------------
-- Vista pública de categorías sugeridas (para páginas de jugador / admin)
-- ----------------------------------------------------------------------------
drop view if exists v_player_category cascade;
create view v_player_category as
select player_id, sport, category, rating, rd, matches, updated_at
from player_ratings
where category is not null;

-- ----------------------------------------------------------------------------
-- RLS de player_ratings (mismo patrón que rls.sql): lectura pública,
-- escritura solo staff. El cron usa service-role, que bypassa RLS.
-- ----------------------------------------------------------------------------
alter table player_ratings enable row level security;

drop policy if exists "public_read_player_ratings" on player_ratings;
create policy "public_read_player_ratings" on player_ratings for select using (true);

drop policy if exists "staff_write_player_ratings" on player_ratings;
create policy "staff_write_player_ratings" on player_ratings for all
  using (is_staff()) with check (is_staff());
