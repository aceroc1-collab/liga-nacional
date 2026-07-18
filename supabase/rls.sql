-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- Lectura pública para todo lo consultable (rankings, clubes, equipos,
-- jugadores, patrocinios, resultados). Escritura restringida por rol.
-- Ejecuta DESPUÉS de schema.sql
-- ============================================================================

-- Helper: rol del usuario actual
create or replace function auth_role() returns app_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable;

create or replace function is_staff() returns boolean as $$
  select coalesce(auth_role() in ('admin','coordinador'), false);
$$ language sql stable;

-- Activar RLS
alter table seasons        enable row level security;
alter table regions        enable row level security;
alter table categories     enable row level security;
alter table clubs          enable row level security;
alter table profiles       enable row level security;
alter table players        enable row level security;
alter table teams          enable row level security;
alter table team_players   enable row level security;
alter table inscriptions   enable row level security;
alter table matches        enable row level security;
alter table match_rubbers  enable row level security;
alter table player_points  enable row level security;
alter table team_points    enable row level security;
alter table sponsors       enable row level security;
alter table media          enable row level security;

-- Lectura pública (catálogo y competición)
do $$
declare t text;
begin
  foreach t in array array['seasons','regions','categories','clubs','players',
    'teams','team_players','matches','match_rubbers','player_points','team_points',
    'sponsors','media','inscriptions'] loop
    execute format('drop policy if exists "public_read_%1$s" on %1$s;', t);
    execute format('create policy "public_read_%1$s" on %1$s for select using (true);', t);
  end loop;
end $$;

-- PROFILES: cada quien ve/edita su perfil; staff ve todos
drop policy if exists "own_profile_read" on profiles;
create policy "own_profile_read" on profiles for select
  using (id = auth.uid() or is_staff());
drop policy if exists "own_profile_upsert" on profiles;
create policy "own_profile_upsert" on profiles for insert
  with check (id = auth.uid());
drop policy if exists "own_profile_update" on profiles;
create policy "own_profile_update" on profiles for update
  using (id = auth.uid() or is_staff());

-- ESCRITURA — staff (admin/coordinador) puede todo
do $$
declare t text;
begin
  foreach t in array array['seasons','regions','categories','clubs','players',
    'teams','team_players','matches','match_rubbers','sponsors','media','inscriptions'] loop
    execute format('drop policy if exists "staff_write_%1$s" on %1$s;', t);
    execute format('create policy "staff_write_%1$s" on %1$s for all
                    using (is_staff()) with check (is_staff());', t);
  end loop;
end $$;

-- INSCRIPCIONES: cualquier usuario autenticado puede crear/editar las suyas
drop policy if exists "insc_owner_write" on inscriptions;
create policy "insc_owner_write" on inscriptions for all
  using (created_by = auth.uid() or is_staff())
  with check (created_by = auth.uid() or is_staff());

-- Trigger: crear profile automáticamente al registrarse
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'jugador')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Solicitudes de inscripción públicas: cualquiera puede ENVIAR una solicitud
-- (status borrador/pendiente). El staff luego la confirma y crea equipo/jugadores.
drop policy if exists "insc_public_submit" on inscriptions;
create policy "insc_public_submit" on inscriptions for insert to anon, authenticated
  with check (status in ('borrador','pendiente'));
