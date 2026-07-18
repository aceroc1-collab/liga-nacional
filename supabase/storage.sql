-- ============================================================================
-- STORAGE · Buckets de fotos (logos, avatares, portadas, galería)
-- Ejecuta en Supabase → SQL Editor (después de schema.sql y rls.sql)
-- ============================================================================

-- Bucket público de medios
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- Lectura pública
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select
  using (bucket_id = 'media');

-- Subida: cualquier usuario autenticado (staff/capitanes suben logos y fotos)
drop policy if exists "media_auth_upload" on storage.objects;
create policy "media_auth_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'media');

drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media');
