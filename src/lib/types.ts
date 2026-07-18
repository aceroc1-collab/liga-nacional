export type Sport = 'padel' | 'playa'
export type Gender = 'M' | 'F' | 'Mixto'
export type Role = 'admin' | 'coordinador' | 'club_admin' | 'capitan' | 'jugador' | 'arbitro'

export interface Region { id: string; name: string; slug: string; core_states: string | null; strong_in: string | null; sort_order: number }
export interface Category { id: string; sport: Sport; name: string; level_label: string | null; gender: Gender; sort_order: number }
export interface Club {
  id: string; name: string; slug: string; region_id: string | null; city: string | null;
  has_padel: boolean; has_playa: boolean; padel_courts: number; playa_courts: number;
  logo_url: string | null; cover_url: string | null; is_verified: boolean;
  contact_name?: string | null; contact_phone?: string | null; contact_email?: string | null; instagram?: string | null;
}
export interface Player {
  id: string; full_name: string; slug: string | null; gender: Gender; region_id: string | null;
  home_club_id: string | null; photo_url: string | null; cover_url: string | null; bio: string | null;
  plays_padel: boolean; plays_playa: boolean; is_dual: boolean; city?: string | null; instagram?: string | null;
}
export interface Team {
  id: string; season_id: string; club_id: string | null; region_id: string; sport: Sport;
  category_id: string; name: string; slug: string | null; captain_player_id: string | null; logo_url: string | null; colors: string | null;
}
export interface Sponsor {
  id: string; name: string; tier: string; sport_scope: Sport | null; logo_url: string | null;
  website: string | null; description: string | null; sort_order: number; is_active: boolean;
}
export interface PlayerRankingRow {
  player_id: string; full_name: string; slug: string | null; gender: Gender; photo_url: string | null;
  region_id: string | null; sport: Sport; points: number; matches_played: number; position: number;
}
export interface DualRankingRow {
  player_id: string; full_name: string; slug: string | null; photo_url: string | null; region_id: string | null;
  padel_points: number; playa_points: number; total_points: number; dual_score: number; position: number;
}
export interface TeamStandingRow {
  team_id: string; name: string; slug: string | null; logo_url: string | null; sport: Sport;
  category_id: string; region_id: string; points: number; wins: number; losses: number; played: number; position: number;
}
