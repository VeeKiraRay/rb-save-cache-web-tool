/* File reading */
import ByteReader from "@/util/file/common/ByteReader";
import CommonFileUtil from "@/util/file/common/CommonFileUtil";

/* Conversion helpers */
import InstrumentDifficulty, {
  type InstrumentName,
} from "./data/InstrumentDifficulty";
import Helper from "@/util/Helper";
import SongGenre from "./data/SongGenre";
import SongSource from "./data/SongSource";

/* Types */
import type ReadResult from "@/types/file/ReadResult";
import type OffsetState from "@/types/file/OffsetState";
import type SongRowCache from "@/types/file/SongRowCache";
import DTAToCacheFormatConverter from "./DTAToCacheFormatConverter";
import Rating from "./data/Rating";
import TonicNote from "./data/TonicNote";
import Tonality from "./data/Tonality";
import CacheFileUtil from "./CacheFileUtil";

const calculateOffsetToSongData = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): void => {
  ByteReader.advanceOffset(offsetState, 4); // Skip first 4 unknown bytes

  // Read number of cache packages (signed 32-bit little-endian)
  const cachePackages = ByteReader.readSigned32Number(bytes, offsetState);

  // Skip through all package entries
  for (let i = 0; i < cachePackages; i++) {
    // Read length of package name
    const nameLength = ByteReader.readSigned32Number(bytes, offsetState);

    // Skip the package name bytes
    ByteReader.advanceOffset(offsetState, nameLength);

    // Read how many IDs this package has
    const idCount = ByteReader.readSigned32Number(bytes, offsetState);

    // Skip IDs: each is 2 bytes + 2 bytes separator (0F 00) = 4 bytes per ID
    ByteReader.advanceOffset(offsetState, idCount * 4);
  }
};

const advanceOffsetToSkipFromRepeatingByteAmountBased = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): void => {
  const itemCount = ByteReader.readSigned32Number(bytes, offsetState);
  for (let i = 0; i < itemCount; i++) {
    ByteReader.advanceOffset(
      offsetState,
      ByteReader.readSigned32Number(bytes, offsetState),
    );
  }
};

const advanceOffsetToSkipFromRepeatingByteArrayAmountBased = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): void => {
  const itemCount = ByteReader.readSigned32Number(bytes, offsetState);
  for (let i = 0; i < itemCount; i++) {
    // Has 4 byte identifier before length we don't care about
    ByteReader.advanceOffset(offsetState, 4);
    ByteReader.advanceOffset(
      offsetState,
      ByteReader.readSigned32Number(bytes, offsetState) * 4,
    );
  }
};

const advanceOffsetToSkipFromLengthBased = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return ByteReader.advanceOffset(
    offsetState,
    ByteReader.readSigned32Number(bytes, offsetState) * 4,
  );
};

const parseInstrumentDifficulties = (
  bytes: Uint8Array,
  songMetadata: Partial<SongRowCache>,
  offsetState: OffsetState,
): void => {
  const itemCount = ByteReader.readSigned32Number(bytes, offsetState);
  for (let i = 0; i < itemCount; i++) {
    const instrumentNameLength = ByteReader.readSigned32Number(
      bytes,
      offsetState,
    );
    const instrumentName = ByteReader.readUTF8StringFromBytes(
      bytes,
      offsetState,
      instrumentNameLength,
    );
    const instrumentDifficulty = ByteReader.readUnsigned16NumberFromFloat(
      bytes,
      offsetState,
    );
    InstrumentDifficulty.convertInstrumentDifficulty(
      songMetadata,
      instrumentName as InstrumentName,
      instrumentDifficulty,
    );
  }
};

/*
 *  Missing / possibly in unknown bytes (from magma attributes). Not all necessary in cache data.
 *  - hopo threshold - 90 / 130 / 170 (default) / 250
 *  - animation speed - 16 / 24 / 32 (default) / 48 / 64 (found?)
 *  - band fail sfx - electronic / heavy / rock / vintage - all have (keys) variant
 *  - vocal guide pitch - "-3.0" default?
 *  - sub genre - depends on main genre (not found with search)
 *  - language - english / french / german / italian / japanese / spanish (not found with plaion text search)
 *  - mute volumes vocals
 *  - mute volume
 *  - version?
 */
const readCacheFile = (
  file: File | null,
): Promise<ReadResult<SongRowCache> | undefined> => {
  if (!file) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as ArrayBuffer;
      const isWii = file.name.split(".").pop() === "vff";
      if (!CacheFileUtil.validateCacheFile(result, isWii)) {
        return resolve({
          songData: [],
          error:
            "File wasn't the expected format. STFS packages not yet supported.",
          fileMetaData: CommonFileUtil.readFileMetaData(file),
        });
      }
      const bytes = new Uint8Array(result);

      const offsetState = { offset: 0 };

      if (isWii) {
        // Skip Wii VFF format header
        ByteReader.advanceOffset(offsetState, 21024);
      }

      calculateOffsetToSongData(bytes, offsetState);
      const songCount = ByteReader.readSigned32Number(bytes, offsetState);

      const songData = DTAToCacheFormatConverter.readOnDiscRb3Songs();

      for (let i = 0; i < songCount; i++) {
        const songMetaData: Partial<SongRowCache> = {};

        songMetaData.songID = ByteReader.readSigned32Number(bytes, offsetState);
        // Unknown
        ByteReader.advanceOffset(offsetState, 8);

        songMetaData.gameVersion = ByteReader.readUnsigned16Number(
          bytes,
          offsetState,
        );
        // Duplicate id and unknown 1 byte
        ByteReader.advanceOffset(offsetState, 5);

        const sourceLength = ByteReader.readSigned32Number(bytes, offsetState);
        songMetaData.source = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          sourceLength,
        );

        songMetaData.previewStart = Helper.convertMilliSecondsToReadableTime(
          ByteReader.readSigned32NumberFromFloat(bytes, offsetState),
        );

        songMetaData.previewEnd = Helper.convertMilliSecondsToReadableTime(
          ByteReader.readSigned32NumberFromFloat(bytes, offsetState),
        );

        const shortNameLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.shortName = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          shortNameLength,
        );
        // Unknown
        ByteReader.advanceOffset(offsetState, 8);
        // Shortname duplicate
        ByteReader.advanceOffset(offsetState, 4 + shortNameLength);

        const filePathLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.filePath = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          filePathLength,
        );
        // Unknown
        ByteReader.advanceOffset(offsetState, 4);

        songMetaData.vocalParts = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );

        // Unknown
        ByteReader.advanceOffset(offsetState, 12);
        // Pans
        advanceOffsetToSkipFromLengthBased(bytes, offsetState);
        // Vols
        advanceOffsetToSkipFromLengthBased(bytes, offsetState);
        // Cores
        advanceOffsetToSkipFromLengthBased(bytes, offsetState);
        // Unknown and length based
        advanceOffsetToSkipFromLengthBased(bytes, offsetState);

        // drum_solo
        advanceOffsetToSkipFromRepeatingByteAmountBased(bytes, offsetState);
        // drum_freestyle
        advanceOffsetToSkipFromRepeatingByteAmountBased(bytes, offsetState);
        // instrument stuff
        advanceOffsetToSkipFromRepeatingByteArrayAmountBased(
          bytes,
          offsetState,
        );

        // unknown
        ByteReader.advanceOffset(offsetState, 4);

        const songNameLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.songName = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          songNameLength,
        );

        const artistLength = ByteReader.readSigned32Number(bytes, offsetState);
        songMetaData.artist = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          artistLength,
        );

        // Album
        const albumLength = ByteReader.readSigned32Number(bytes, offsetState);
        if (albumLength === 0) {
          // skip empty padding values if no album data
          ByteReader.advanceOffset(offsetState, 4);
        } else {
          songMetaData.albumName = ByteReader.readUTF8StringFromBytes(
            bytes,
            offsetState,
            albumLength,
          );
          songMetaData.trackNumber = ByteReader.readSigned32Number(
            bytes,
            offsetState,
          );
        }
        // Skip unknown
        ByteReader.advanceOffset(offsetState, 3);

        songMetaData.yearRecorded =
          1900 + ByteReader.readSigned32Number(bytes, offsetState);

        // Skip unknown
        ByteReader.advanceOffset(offsetState, 2);

        songMetaData.yearReleased =
          1900 + ByteReader.readUnsigned8Number(bytes, offsetState);

        const genreLength = ByteReader.readSigned32Number(bytes, offsetState);
        songMetaData.genre = SongGenre.parseGenre(
          ByteReader.readUTF8StringFromBytes(bytes, offsetState, genreLength),
        );
        // Skip unknown
        ByteReader.advanceOffset(offsetState, 8);

        parseInstrumentDifficulties(bytes, songMetaData, offsetState);

        const ratingValue = ByteReader.readSigned32Number(bytes, offsetState);
        songMetaData.rating = Rating.convertRating(
          ratingValue < 5 && ratingValue > 0 ? ratingValue : 4,
        );

        // Skip unknown
        ByteReader.advanceOffset(offsetState, 2);

        songMetaData.scrollSpeed = ByteReader.readUnsigned16NumberFromFloat(
          bytes,
          offsetState,
        );

        // Skip unknown
        ByteReader.advanceOffset(offsetState, 4);

        const vocalPercussionLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.vocalPercussionBank = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          vocalPercussionLength,
        );

        const drumBankLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.drumBank = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          drumBankLength,
        );

        songMetaData.tonicNote = TonicNote.parseTonicNote(
          ByteReader.readSigned32Number(bytes, offsetState),
        );

        // Skip unknown
        ByteReader.advanceOffset(offsetState, 4);

        songMetaData.songTonality = Tonality.parseTonality(
          ByteReader.readSigned32Number(bytes, offsetState),
        );

        songMetaData.songLength = Helper.convertMilliSecondsToReadableTime(
          ByteReader.readSigned32Number(bytes, offsetState),
        );

        // TODO 3 different values detected. 1, 256, 257.
        // The 1 and 257 are clear false and true values but what does 256 mean?
        // For example RB1 DLC A7X - Afterlife is 256, couple of customs as well that seem to be original versions
        songMetaData.isMaster =
          ByteReader.readUnsigned16Number(bytes, offsetState) === 1
            ? false
            : true;

        // Skip unknown (6 for wii)
        // TODO Xbox second byte here is possibly animation speed 32 default 64 fast?
        ByteReader.advanceOffset(offsetState, isWii ? 6 : 5);

        const vocalGenderLength = ByteReader.readSigned32Number(
          bytes,
          offsetState,
        );
        songMetaData.vocalGender = ByteReader.readUTF8StringFromBytes(
          bytes,
          offsetState,
          vocalGenderLength,
        )
          .toLowerCase()
          .includes("female")
          ? "Female"
          : "Male";

        // Skip guitar tuning
        ByteReader.advanceOffset(offsetState, 24);
        // Skip bass tuning
        ByteReader.advanceOffset(offsetState, 16);
        // Skip unknown
        ByteReader.advanceOffset(offsetState, 1);

        advanceOffsetToSkipFromRepeatingByteAmountBased(bytes, offsetState);

        // Conversion
        songMetaData.source = SongSource.parseSource(songMetaData);
        songData.push(songMetaData as SongRowCache);
      }

      return resolve({
        songData,
        fileMetaData: CommonFileUtil.readFileMetaData(file),
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

const CacheFileParser = {
  readCacheFile,
};

export default CacheFileParser;
