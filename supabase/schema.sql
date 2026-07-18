-- ============================================================================
-- LIGA NACIONAL DE PÁDEL & TENIS PLAYA · VENEZUELA
-- Esquema Supabase / PostgreSQL  ·  by David Navarrete
-- Estilo SNP Galaxy: multi-deporte, atleta dual, escalable a miles de jugadores
-- ============================================================================
-- Ejecuta este archivo completo en:  Supabase → SQL Editor → New query → Run
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- TIPOS (ENUMS)
-- ----------------------------------------------------------------------------
do $$ begin
  create type sport         as enum ('padel', 'playa');
  create type gender        as enum ('M', 'F', 'Mixto');
  create type app_role      as enum ('admin','coordinador','club_admin','capitan','jugador','arbitro');
  create type insc_status   as enum ('borrador','pendiente','pagado','confirmado','rechazado');
  create type match_phase   as enum ('regular','playoff','interseries','master');
  create type match_status  as enum ('programado','en_juego','finalizado','walkover','aplazado');
  create type sponsor_tier  as enum ('principal','oro','plata','categoria','master','club');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- TEMPORADAS
-- ----------------------------------------------------------------------------
create table if not exists seasons (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,                       -- "Temporada 2026"
  year        int  not null,
  is_active   boolean not null default false,
  starts_on   date,
  ends_on     date,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- REGIONES (5 zonas nacionales del dossier)
-- ----------------------------------------------------------------------------
create table if not exists regions (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,                -- Capital, Central, Centro-Occidente...
  slug        text not null unique,
  core_states text,                                -- "Distrito Capital, Miranda, La Guaira"
  strong_in   text,                                -- "Pádel (Caracas) + Playa (litoral)"
  sort_order  int not null default 0
);

-- ----------------------------------------------------------------------------
-- CATEGORÍAS / DIVISIONES por deporte
-- Pádel: Grand Slam, 1000, 500, Future, Seniors, Mixto
-- Playa: Serie A, Serie B, Serie C, Juvenil, Seniors
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  sport       sport not null,
  name        text not null,                       -- "Grand Slam", "Serie A"
  level_label text,                                -- "Pro / Avanzado"
  gender      gender not null default 'M',
  sort_order  int not null default 0,
  unique (sport, name, gender)
);

-- ----------------------------------------------------------------------------
-- CLUBES (sedes: canchas de pádel y/o arena)
-- ----------------------------------------------------------------------------
create table if not exists clubs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  region_id   uuid references regions(id),
  city        text,
  address     text,
  has_padel   boolean not null default false,
  has_playa   boolean not null default false,
  padel_courts int default 0,
  playa_courts int default 0,
  logo_url    text,
  cover_url   text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  instagram   text,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_clubs_region on clubs(region_id);
create index if not exists idx_clubs_name_trgm on clubs using gin (name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- PERFILES DE USUARIO (extiende auth.users)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        app_role not null default 'jugador',
  club_id     uuid references clubs(id),
  region_id   uuid references regions(id),
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- JUGADORES (atletas — la persona; puede jugar ambos deportes)
-- ----------------------------------------------------------------------------
create table if not exists players (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,  -- si tiene cuenta
  full_name   text not null,
  slug        text unique,
  gender      gender not null default 'M',
  birthdate   date,
  cedula      text,                                -- documento de identidad
  region_id   uuid references regions(id),
  home_club_id uuid references clubs(id),
  photo_url   text,
  cover_url   text,
  bio         text,
  city        text,
  phone       text,
  email       text,
  instagram   text,
  plays_padel boolean not null default false,
  plays_playa boolean not null default false,
  is_dual     boolean generated always as (plays_padel and plays_playa) stored,
  created_at  timestamptz not null default now()
);
create index if not exists idx_players_region on players(region_id);
create index if not exists idx_players_dual on players(is_dual);
create index if not exists idx_players_name_trgm on players using gin (full_name gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- EQUIPOS (un club/grupo compite una temporada; puede tener equipos en ambos deportes)
-- ----------------------------------------------------------------------------
create table if not exists teams (
  id          uuid primary key default uuid_generate_v4(),
  season_id   uuid not null references seasons(id),
  club_id     uuid references clubs(id),
  region_id   uuid not null references regions(id),
  sport       sport not null,
  category_id uuid not null references categories(id),
  name        text not null,
  slug        text,
  captain_player_id uuid references players(id),
  logo_url    text,
  colors      text,                                -- "Azul / Blanco"
  created_at  timestamptz not null default now()
);
create index if not exists idx_teams_region_sport on teams(region_id, sport);
create index if not exists idx_teams_category on teams(category_id);
create index if not exists idx_teams_season on teams(season_id);

-- Plantilla del equipo (roster)
create table if not exists team_players (
  team_id     uuid not null references teams(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  jersey_no   int,
  is_captain  boolean not null default false,
  joined_at   timestamptz not null default now(),
  primary key (team_id, player_id)
);
create index if not exists idx_team_players_player on team_players(player_id);

-- ----------------------------------------------------------------------------
-- INSCRIPCIONES (registro de equipo en la liga, con estado de pago)
-- ----------------------------------------------------------------------------
create table if not exists inscriptions (
  id            uuid primary key default uuid_generate_v4(),
  season_id     uuid not null references seasons(id),
  team_id       uuid references teams(id) on delete cascade,
  club_id       uuid references clubs(id),
  sport         sport not null,
  category_id   uuid references categories(id),
  region_id     uuid references regions(id),
  team_name     text,
  roster        jsonb not null default '[]'::jsonb,   -- plantilla enviada [{nombre,cedula,plays_padel,plays_playa}]
  contact_name  text,
  contact_phone text,
  contact_email text,
  status        insc_status not null default 'borrador',
  amount        numeric(12,2),
  payment_ref   text,                              -- pago móvil / transferencia
  notes         text,
  submitted_at  timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index if not exists idx_insc_season_status on inscriptions(season_id, status);

-- ----------------------------------------------------------------------------
-- ELIMINATORIAS / ENCUENTROS (match = enfrentamiento entre 2 equipos)
-- Pádel: 5 partidos de parejas, gana quien llega a 3 (12 pts en juego 3-3-2-2-2)
-- Playa: dobles masc/fem/mixto (3-5 rubbers), 2 pts por encuentro ganado
-- ----------------------------------------------------------------------------
create table if not exists matches (
  id            uuid primary key default uuid_generate_v4(),
  season_id     uuid not null references seasons(id),
  sport         sport not null,
  phase         match_phase not null default 'regular',
  region_id     uuid references regions(id),
  category_id   uuid references categories(id),
  round_label   text,                              -- "Jornada 3", "Cuartos", "Final Master"
  bracket_slot  int,                               -- posición en el bracket (playoff/master)
  home_team_id  uuid references teams(id),
  away_team_id  uuid references teams(id),
  home_rubbers  int not null default 0,            -- parejas/dobles ganados por el local
  away_rubbers  int not null default 0,
  home_points   int not null default 0,            -- puntos de liga otorgados
  away_points   int not null default 0,
  winner_team_id uuid references teams(id),
  venue_club_id uuid references clubs(id),
  scheduled_at  timestamptz,
  status        match_status not null default 'programado',
  created_at    timestamptz not null default now()
);
create index if not exists idx_matches_season_sport on matches(season_id, sport);
create index if not exists idx_matches_phase on matches(phase);
create index if not exists idx_matches_teams on matches(home_team_id, away_team_id);

-- Partidos individuales (rubbers) dentro de una eliminatoria: parejas y resultado
create table if not exists match_rubbers (
  id            uuid primary key default uuid_generate_v4(),
  match_id      uuid not null references matches(id) on delete cascade,
  rubber_no     int not null,                      -- 1..5 (pádel) o 1..3/5 (playa)
  modality      gender not null default 'M',       -- M / F / Mixto (playa) — pádel usa M/F
  home_p1       uuid references players(id),
  home_p2       uuid references players(id),
  away_p1       uuid references players(id),
  away_p2       uuid references players(id),
  score_text    text,                              -- "6-3 6-4" / "6-2 3-6 [10-7]"
  home_won      boolean,
  status        match_status not null default 'programado',
  unique (match_id, rubber_no)
);
create index if not exists idx_rubbers_match on match_rubbers(match_id);

-- ----------------------------------------------------------------------------
-- LIBRO DE PUNTOS (ledger) — jugadores y equipos acumulan puntos de ranking
-- Se llena automáticamente por trigger al finalizar una eliminatoria
-- ----------------------------------------------------------------------------
create table if not exists player_points (
  id          uuid primary key default uuid_generate_v4(),
  season_id   uuid not null references seasons(id),
  player_id   uuid not null references players(id) on delete cascade,
  sport       sport not null,
  match_id    uuid references matches(id) on delete cascade,
  points      numeric(8,2) not null default 0,
  reason      text,                                -- "victoria rubber", "bonus master"
  created_at  timestamptz not null default now()
);
create index if not exists idx_pp_player_sport on player_points(player_id, sport);
create index if not exists idx_pp_season on player_points(season_id);

create table if not exists team_points (
  id          uuid primary key default uuid_generate_v4(),
  season_id   uuid not null references seasons(id),
  team_id     uuid not null references teams(id) on delete cascade,
  match_id    uuid references matches(id) on delete cascade,
  points      int not null default 0,
  won         boolean,
  created_at  timestamptz not null default now()
);
create index if not exists idx_tp_team on team_points(team_id);

-- ----------------------------------------------------------------------------
-- PATROCINIOS / ALIANZAS
-- ----------------------------------------------------------------------------
create table if not exists sponsors (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  tier        sponsor_tier not null default 'categoria',
  sport_scope sport,                               -- null = ambos deportes
  logo_url    text,
  website     text,
  description text,
  season_id   uuid references seasons(id),
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Fotos / galería (perfiles de jugador, equipo, club, eventos)
create table if not exists media (
  id          uuid primary key default uuid_generate_v4(),
  owner_type  text not null,                       -- 'player' | 'team' | 'club' | 'event'
  owner_id    uuid not null,
  url         text not null,
  caption     text,
  is_cover    boolean not null default false,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists idx_media_owner on media(owner_type, owner_id);

-- ============================================================================
-- FUNCIÓN + TRIGGER: al finalizar una eliminatoria, otorga puntos automáticamente
-- Pádel: 3 pts al ganador de la eliminatoria si toma mayoría; puntos por rubber
-- Playa: 2 pts por encuentro ganado (modelo FITP)
-- Jugadores: puntos por rubber ganado (alimenta ranking individual y dual)
-- ============================================================================
create or replace function award_points_on_finalize()
returns trigger as $$
declare
  r record;
  padel_win_pts int := 3;   -- puntos de liga por eliminatoria ganada (pádel)
  playa_win_pts int := 2;   -- puntos de liga por encuentro ganado (playa)
  rubber_pts numeric := 10; -- puntos de ranking individual por rubber ganado
  win_bonus  numeric;
begin
  if new.status = 'finalizado' and (old.status is distinct from 'finalizado') then
    -- limpia puntos previos de este match (recálculo idempotente)
    delete from player_points where match_id = new.id;
    delete from team_points  where match_id = new.id;

    -- determina ganador de la eliminatoria por rubbers
    if new.home_rubbers > new.away_rubbers then
      new.winner_team_id := new.home_team_id;
    elsif new.away_rubbers > new.home_rubbers then
      new.winner_team_id := new.away_team_id;
    else
      new.winner_team_id := null;
    end if;

    win_bonus := case when new.sport = 'padel' then padel_win_pts else playa_win_pts end;

    -- puntos de equipo
    insert into team_points(season_id, team_id, match_id, points, won)
    values
      (new.season_id, new.home_team_id, new.id,
        case when new.winner_team_id = new.home_team_id then win_bonus else 0 end,
        new.winner_team_id = new.home_team_id),
      (new.season_id, new.away_team_id, new.id,
        case when new.winner_team_id = new.away_team_id then win_bonus else 0 end,
        new.winner_team_id = new.away_team_id);

    new.home_points := case when new.winner_team_id = new.home_team_id then win_bonus else 0 end;
    new.away_points := case when new.winner_team_id = new.away_team_id then win_bonus else 0 end;

    -- puntos de jugadores por cada rubber ganado
    for r in select * from match_rubbers where match_id = new.id and home_won is not null loop
      if r.home_won then
        insert into player_points(season_id, player_id, sport, match_id, points, reason)
        select new.season_id, pid, new.sport, new.id, rubber_pts, 'victoria en rubber'
        from unnest(array[r.home_p1, r.home_p2]) as pid where pid is not null;
      else
        insert into player_points(season_id, player_id, sport, match_id, points, reason)
        select new.season_id, pid, new.sport, new.id, rubber_pts, 'victoria en rubber'
        from unnest(array[r.away_p1, r.away_p2]) as pid where pid is not null;
      end if;
    end loop;

    -- bonus extra en fase Master
    if new.phase = 'master' and new.winner_team_id is not null then
      update team_points set points = points + 5
        where match_id = new.id and team_id = new.winner_team_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_award_points on matches;
create trigger trg_award_points
  before update on matches
  for each row execute function award_points_on_finalize();

-- ============================================================================
-- VISTAS DE RANKING (se recalculan solas — el frontend solo lee)
-- ============================================================================

-- Ranking individual por deporte
create or replace view v_player_ranking as
select
  p.id            as player_id,
  p.full_name,
  p.slug,
  p.gender,
  p.photo_url,
  p.region_id,
  pp.season_id,
  pp.sport,
  coalesce(sum(pp.points),0)              as points,
  count(distinct pp.match_id)             as matches_played,
  rank() over (
    partition by pp.season_id, pp.sport
    order by coalesce(sum(pp.points),0) desc
  )                                       as position
from players p
join player_points pp on pp.player_id = p.id
group by p.id, pp.season_id, pp.sport;

-- Ranking ATLETA DUAL — suma pádel + playa, solo atletas que juegan ambos
create or replace view v_dual_ranking as
with per_sport as (
  select player_id, season_id, sport, sum(points) as pts
  from player_points group by player_id, season_id, sport
),
dual as (
  select
    player_id, season_id,
    sum(case when sport='padel' then pts else 0 end) as padel_points,
    sum(case when sport='playa' then pts else 0 end) as playa_points,
    count(distinct sport) as sports_count
  from per_sport
  group by player_id, season_id
)
select
  d.player_id,
  p.full_name,
  p.slug,
  p.photo_url,
  p.region_id,
  d.season_id,
  d.padel_points,
  d.playa_points,
  (d.padel_points + d.playa_points)                                   as total_points,
  -- bonus dual: 15% extra por competir en ambos deportes
  round((d.padel_points + d.playa_points) * 1.15, 2)                  as dual_score,
  rank() over (
    partition by d.season_id
    order by (d.padel_points + d.playa_points) desc
  )                                                                    as position
from dual d
join players p on p.id = d.player_id
where d.sports_count = 2;                          -- solo atletas duales

-- Clasificación de equipos (standings por deporte/categoría/región)
create or replace view v_team_standings as
select
  t.id            as team_id,
  t.name,
  t.slug,
  t.logo_url,
  t.sport,
  t.category_id,
  t.region_id,
  t.season_id,
  coalesce(sum(tp.points),0)                        as points,
  count(tp.id) filter (where tp.won)                as wins,
  count(tp.id) filter (where tp.won = false)        as losses,
  count(tp.id)                                      as played,
  rank() over (
    partition by t.season_id, t.sport, t.category_id, t.region_id
    order by coalesce(sum(tp.points),0) desc
  )                                                 as position
from teams t
left join team_points tp on tp.team_id = t.id
group by t.id;
