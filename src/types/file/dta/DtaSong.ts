export interface DtaSongRank {
  guitar?: number;
  drum?: number;
  bass?: number;
  vocals?: number;
  band?: number;
  keys?: number;
  real_keys?: number;
  real_guitar?: number;
  real_bass?: number;
}

export interface DtaSongData {
  name: string;
  vocal_parts?: number;
}

export default interface DtaSong {
  song_id: number;
  version: number;
  game_origin: string;
  preview: [number, number];
  song: DtaSongData;
  name: string;
  artist: string;
  album_name?: string;
  album_track_number?: number;
  year_recorded?: number;
  year_released?: number;
  genre: string;
  rating: number;
  song_scroll_speed?: number;
  bank?: string;
  drum_bank?: string;
  vocal_tonic_note?: number;
  song_tonality?: number;
  song_length: number;
  master?: number;
  vocal_gender?: string;
  rank: DtaSongRank;
}
