-- ============================================================================
-- DATOS SEMILLA · Liga Nacional de Pádel & Tenis Playa
-- Regiones, categorías, temporada, clubes demo, patrocinios demo,
-- jugadores demo, equipos y un par de resultados para ver los rankings vivos.
-- Ejecuta DESPUÉS de schema.sql y rls.sql
-- ============================================================================

-- Temporada activa
insert into seasons (id, name, year, is_active, starts_on, ends_on)
values ('00000000-0000-0000-0000-000000000001','Temporada 2026',2026,true,'2026-08-01','2027-05-31')
on conflict do nothing;

-- 5 Regiones (del dossier)
insert into regions (name, slug, core_states, strong_in, sort_order) values
 ('Capital','capital','Distrito Capital, Miranda, La Guaira','Pádel (Caracas) + Playa (litoral La Guaira)',1),
 ('Central','central','Carabobo, Aragua','Pádel + Playa (antecedente de equipos)',2),
 ('Centro-Occidente','centro-occidente','Lara, Portuguesa','Pádel (Barquisimeto, Acarigua)',3),
 ('Occidente','occidente','Zulia, Táchira, Mérida','Pádel + Playa (Zulia)',4),
 ('Oriente e Insular','oriente-insular','Anzoátegui, Nueva Esparta, Bolívar','Playa (Lechería, Margarita, Guayana) + Pádel',5)
on conflict (slug) do nothing;

-- Categorías PÁDEL
insert into categories (sport, name, level_label, gender, sort_order) values
 ('padel','Grand Slam','Pro / Avanzado','M',1),
 ('padel','Grand Slam','Pro / Avanzado','F',1),
 ('padel','1000','Medio-Alto','M',2),
 ('padel','1000','Medio-Alto','F',2),
 ('padel','500','Intermedio','M',3),
 ('padel','500','Intermedio','F',3),
 ('padel','Future','Iniciación','M',4),
 ('padel','Future','Iniciación','F',4),
 ('padel','Seniors','Veteranos','M',5),
 ('padel','Seniors','Veteranos','F',5),
 ('padel','Mixto','Todos los niveles','Mixto',6)
on conflict do nothing;

-- Categorías TENIS PLAYA (modelo FITP: Series)
insert into categories (sport, name, level_label, gender, sort_order) values
 ('playa','Serie A','Élite / avanzado','M',1),
 ('playa','Serie A','Élite / avanzado','F',1),
 ('playa','Serie B','Intermedio','M',2),
 ('playa','Serie B','Intermedio','F',2),
 ('playa','Serie C','Iniciación','M',3),
 ('playa','Serie C','Iniciación','F',3),
 ('playa','Juvenil','Sub-12/14/16/18','M',4),
 ('playa','Seniors','Veteranos','M',5),
 ('playa','Mixto','Dobles mixto','Mixto',6)
on conflict do nothing;

-- Clubes demo
insert into clubs (id, name, slug, region_id, city, has_padel, has_playa, padel_courts, playa_courts, is_verified) values
 ('c0000000-0000-0000-0000-000000000001','Caracas Pádel Center','caracas-padel-center',(select id from regions where slug='capital'),'Caracas',true,false,6,0,true),
 ('c0000000-0000-0000-0000-000000000002','Litoral Beach Club','litoral-beach-club',(select id from regions where slug='capital'),'La Guaira',false,true,0,4,true),
 ('c0000000-0000-0000-0000-000000000003','Valencia Racket Club','valencia-racket-club',(select id from regions where slug='central'),'Valencia',true,true,4,2,true),
 ('c0000000-0000-0000-0000-000000000004','Zulia Arena & Pádel','zulia-arena-padel',(select id from regions where slug='occidente'),'Maracaibo',true,true,5,3,true),
 ('c0000000-0000-0000-0000-000000000005','Lechería Beach Tennis','lecheria-beach-tennis',(select id from regions where slug='oriente-insular'),'Lechería',false,true,0,6,true)
on conflict (slug) do nothing;

-- Patrocinios demo
insert into sponsors (name, tier, sport_scope, website, description, season_id, sort_order) values
 ('Patrocinador Principal','principal',null,'https://ejemplo.com','Naming del circuito nacional','00000000-0000-0000-0000-000000000001',1),
 ('Marca de Palas Pádel','categoria','padel','https://ejemplo.com','Palas oficiales de pádel','00000000-0000-0000-0000-000000000001',2),
 ('Marca de Palas Playa','categoria','playa','https://ejemplo.com','Palas oficiales de tenis playa','00000000-0000-0000-0000-000000000001',3),
 ('Bebida Oficial','oro',null,'https://ejemplo.com','Hidratación del Master Nacional','00000000-0000-0000-0000-000000000001',4),
 ('Banca Aliada','plata',null,'https://ejemplo.com','Pagos y pasarela','00000000-0000-0000-0000-000000000001',5)
on conflict do nothing;

-- Jugadores demo (algunos duales)
insert into players (id, full_name, slug, gender, region_id, home_club_id, plays_padel, plays_playa) values
 ('a0000000-0000-0000-0000-000000000001','Carlos Méndez','carlos-mendez','M',(select id from regions where slug='capital'),'c0000000-0000-0000-0000-000000000001',true,true),
 ('a0000000-0000-0000-0000-000000000002','Andrés Rojas','andres-rojas','M',(select id from regions where slug='capital'),'c0000000-0000-0000-0000-000000000001',true,true),
 ('a0000000-0000-0000-0000-000000000003','Luis Pérez','luis-perez','M',(select id from regions where slug='central'),'c0000000-0000-0000-0000-000000000003',true,false),
 ('a0000000-0000-0000-0000-000000000004','Jorge Silva','jorge-silva','M',(select id from regions where slug='central'),'c0000000-0000-0000-0000-000000000003',true,false),
 ('a0000000-0000-0000-0000-000000000005','Miguel Torres','miguel-torres','M',(select id from regions where slug='occidente'),'c0000000-0000-0000-0000-000000000004',true,true),
 ('a0000000-0000-0000-0000-000000000006','Pedro Gómez','pedro-gomez','M',(select id from regions where slug='occidente'),'c0000000-0000-0000-0000-000000000004',true,true)
on conflict (id) do nothing;

-- Equipos demo (pádel Grand Slam M)
insert into teams (id, season_id, club_id, region_id, sport, category_id, name, captain_player_id) values
 ('e0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',(select id from regions where slug='capital'),'padel',(select id from categories where sport='padel' and name='Grand Slam' and gender='M'),'Caracas GS','a0000000-0000-0000-0000-000000000001'),
 ('e0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003',(select id from regions where slug='central'),'padel',(select id from categories where sport='padel' and name='Grand Slam' and gender='M'),'Valencia GS','a0000000-0000-0000-0000-000000000003'),
 ('e0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004',(select id from regions where slug='occidente'),'playa',(select id from categories where sport='playa' and name='Serie A' and gender='M'),'Zulia Arena A','a0000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

-- Rosters
insert into team_players (team_id, player_id, is_captain) values
 ('e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',true),
 ('e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002',false),
 ('e0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003',true),
 ('e0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000004',false),
 ('e0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000005',true),
 ('e0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000006',false)
on conflict do nothing;

-- Eliminatoria demo de pádel (Caracas vs Valencia) con rubbers, para ver rankings
insert into matches (id, season_id, sport, phase, region_id, category_id, round_label, home_team_id, away_team_id, home_rubbers, away_rubbers, status)
values ('d0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','padel','regular',
  (select id from regions where slug='capital'),
  (select id from categories where sport='padel' and name='Grand Slam' and gender='M'),
  'Jornada 1','e0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002',3,2,'programado')
on conflict (id) do nothing;

insert into match_rubbers (match_id, rubber_no, modality, home_p1, home_p2, away_p1, away_p2, score_text, home_won) values
 ('d0000000-0000-0000-0000-000000000001',1,'M','a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','6-3 6-4',true),
 ('d0000000-0000-0000-0000-000000000001',2,'M','a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','7-5 6-2',true),
 ('d0000000-0000-0000-0000-000000000001',3,'M','a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','4-6 3-6',false),
 ('d0000000-0000-0000-0000-000000000001',4,'M','a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','6-4 2-6 [10-7]',true),
 ('d0000000-0000-0000-0000-000000000001',5,'M','a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','3-6 4-6',false)
on conflict (match_id, rubber_no) do nothing;

-- Finaliza la eliminatoria → dispara el trigger que otorga puntos
update matches set status='finalizado' where id='d0000000-0000-0000-0000-000000000001';
