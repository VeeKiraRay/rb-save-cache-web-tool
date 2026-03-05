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
import { OFFICIAL_SONG_IDS } from "@/assets/static/OfficialSongIds";
import type { DtaMeta } from "@/types/file/dta/DtaSong";

const readAsRawString = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  return new TextDecoder("utf-8").decode(buffer);
};

const readOnDiscRb3Songs = () => {
  return convertDTAToCacheFormat(DTAParser.parseDTAToMap(rb3_disc_songs_dta));
};

const readFiles = async (dtaFiles: File[]) => {
  const dtaMaps = await Promise.all(
    dtaFiles.map(async (file) => {
      const rawUTF8 = await readAsRawString(file);
      return DTAParser.parseDTAToMap(rawUTF8);
    }),
  );
  const combined = Object.assign(
    {},
    DTAParser.parseDTAToMap(rb3_disc_songs_dta),
    ...dtaMaps,
  );
  return convertDTAToCacheFormat(combined);
};

const convertOptionalBoolean = (numberValue?: number) => {
  return numberValue == null ? undefined : numberValue === 1;
};

const convertDTAToCacheFormat = (
  dtaMap: Record<string, Record<string, DtaValue>>,
): SongRowCache[] => {
  const cacheSongs = [];
  Object.keys(dtaMap).forEach((technicalName) => {
    const { props, meta } = dtaMap[technicalName];
    const dtaSong = props as unknown as DtaSong;
    const dtaMeta = meta as unknown as DtaMeta;
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

    if (!songRowCache.songID) {
      /* Older official songs are missing ID in the songs.dta. 
          Lookup table has been generated with a cache file. */
      /* ID is necessary to match with save file data */
      songRowCache.songID = OFFICIAL_SONG_IDS[technicalName];
    }

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

    /* DTA only details not available in cache files */
    songRowCache.bandFailCue = dtaSong.band_fail_cue;
    songRowCache.guidePitchVolume = dtaSong.guide_pitch_volume;

    /* Only available for customs */
    songRowCache.author = dtaSong.author;
    songRowCache.encoding = dtaSong.encoding;
    songRowCache.subgenre = SongGenre.parseGenre(dtaSong.sub_genre);

    if (dtaMeta) {
      songRowCache.magmaVersion = dtaMeta.createdUsingMagma;
      songRowCache.languages = dtaMeta.languages;
      songRowCache.doubleBass = convertOptionalBoolean(dtaMeta.bass2x);
      songRowCache.catEMH = convertOptionalBoolean(dtaMeta.caTemh);
      songRowCache.convert = convertOptionalBoolean(dtaMeta.convert);
      songRowCache.diyStems = convertOptionalBoolean(dtaMeta.diyStems);
      songRowCache.expertOnly = convertOptionalBoolean(dtaMeta.expertOnly);
      songRowCache.karaoke = convertOptionalBoolean(dtaMeta.karaoke);
      songRowCache.multitrack = convertOptionalBoolean(dtaMeta.multitrack);
      songRowCache.partialMultitrack = convertOptionalBoolean(
        dtaMeta.partialMultitrack,
      );
      songRowCache.rhythmBass = convertOptionalBoolean(dtaMeta.rhythmBass);
      songRowCache.rhythmKeys = convertOptionalBoolean(dtaMeta.rhythmKeys);
      songRowCache.unpitchedVocals = convertOptionalBoolean(
        dtaMeta.unpitchedVocals,
      );
    }

    cacheSongs.push(songRowCache);
  });
  return cacheSongs;
};

const DTAToCacheFormatConverter = {
  readOnDiscRb3Songs,
  readFiles,
};

export default DTAToCacheFormatConverter;
