export default interface SongRowCache {
  songID: number;
  gameVersion: number; // TODO convert
  source: string;
  previewStart: string;
  previewEnd: string;
  shortName: string;
  filePath: string;
  vocalParts: number;
  songName: string;
  artist: string;
  albumName?: string;
  trackNumber?: number;
  yearRecorded: number;
  yearReleased: number;
  genre: string;
  guitarDiff?: string;
  drumsDiff?: string;
  bassDiff?: string;
  vocalsDiff?: string;
  bandDiff?: string;
  keysDiff?: string;
  proKeysDiff?: string;
  proGuitarDiff?: string;
  proBassDiff?: string;
  rating: string;
  scrollSpeed: number;
  vocalPercussionBank: string;
  drumBank: string;
  tonicNote: string;
  songTonality: string;
  songLength: string;
  isMaster: boolean;
  vocalGender: string;
}
