import rb3_disc_songs_dta from "@/assets/static/songs_rb3_disc_songs.dta?raw";
import DTAParser from "../dta/DTAParser";
import type DtaSong from "@/types/file/dta/DtaSong";
import type SongRowCache from "@/types/file/SongRowCache";
import Helper from "@/util/Helper";
import SongGenre from "./data/SongGenre";
import InstrumentDifficulty from "./data/InstrumentDifficulty";
import Rating from "./data/Rating";
import SongSource from "./data/SongSource";
import type { DtaValue } from "@/types/file/dta/DtaValue";
import TonicNote from "./data/TonicNote";
import Tonality from "./data/Tonality";

const readOnDiscRb3Songs = () => {
  return convertDTAToCacheFormat(DTAParser.parseDTAToMap(rb3_disc_songs_dta));
};

const convertDTAToCacheFormat = (
  dtaMap: Record<string, Record<string, DtaValue>>,
): SongRowCache[] => {
  const cacheSongs = [];
  Object.keys(dtaMap).forEach((technicalName) => {
    const { props /*meta*/ } = dtaMap[technicalName];
    const dtaSong = props as unknown as DtaSong;
    const songRowCache: Partial<SongRowCache> = {
      songID: dtaSong.song_id,
      gameVersion: dtaSong.version,
      source: dtaSong.game_origin,
      previewStart: Helper.convertMilliSecondsToReadableTime(
        dtaSong.preview[0],
      ),
      previewEnd: Helper.convertMilliSecondsToReadableTime(dtaSong.preview[1]),
      shortName: technicalName,
      filePath: dtaSong.song.name,
      vocalParts: dtaSong.song.vocal_parts,
      songName: dtaSong.name,
      artist: dtaSong.artist,
      albumName: dtaSong.album_name,
      trackNumber: dtaSong.album_track_number,
      yearRecorded: dtaSong.year_recorded,
      yearReleased: dtaSong.year_released,
      genre: SongGenre.parseGenre(dtaSong.genre),
      rating: Rating.convertRating(dtaSong.rating),
      scrollSpeed: dtaSong.song_scroll_speed,
      vocalPercussionBank: dtaSong.bank,
      drumBank: dtaSong.drum_bank,
      tonicNote: TonicNote.parseTonicNote(dtaSong.vocal_tonic_note),
      songTonality: Tonality.parseTonality(dtaSong.song_tonality),
      songLength: Helper.convertMilliSecondsToReadableTime(dtaSong.song_length),
      isMaster: dtaSong.master === 1,
      vocalGender: Helper.capitalizeFirstLetter(dtaSong.vocal_gender ?? ""),
    };
    songRowCache.source = SongSource.parseSource(songRowCache);
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "guitar",
      dtaSong.rank.guitar,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "drum",
      dtaSong.rank.drum,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "bass",
      dtaSong.rank.bass,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "vocals",
      dtaSong.rank.vocals,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "band",
      dtaSong.rank.band,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "keys",
      dtaSong.rank.keys,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "real_keys",
      dtaSong.rank.real_keys,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "real_guitar",
      dtaSong.rank.real_guitar,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songRowCache,
      "real_bass",
      dtaSong.rank.real_bass,
    );
    if (!songRowCache.yearRecorded) {
      // On disc songs do not all have year recorded so copy it from year released.
      songRowCache.yearRecorded = songRowCache.yearReleased;
    }
    cacheSongs.push(songRowCache);
  });
  return cacheSongs;
};

const DTAToCacheFormatConverter = {
  readOnDiscRb3Songs,
};

export default DTAToCacheFormatConverter;
