import type ReadResult from "@/types/file/ReadResult";
import type SongRowSave from "@/types/file/SongRowSave";
import CommonFileUtil from "@/util/file/common/CommonFileUtil";
import SaveFileUtil from "./SaveFileUtil";
import SaveFileCryptUtil from "./SaveFileCryptUtil";

const parseSong = (bytes: Uint8Array): SongRowSave => {
  return {
    songID: CommonFileUtil.unsigned32Number(bytes, 0),
    lighterRating: bytes[6],
    playCount: CommonFileUtil.signed32Number(bytes, 11),
    drumsTopScore: CommonFileUtil.signed32Number(bytes, 63),
    drumsTopScoreDifficulty: bytes[67],
    drumsStarsEasy: bytes[68],
    drumsPercentEasy: bytes[69],
    drumsStarsMedium: bytes[76],
    drumsPercentMedium: bytes[77],
    drumsStarsHard: bytes[84],
    drumsPercentHard: bytes[85],
    drumsStarsExpert: bytes[92],
    drumsPercentExpert: bytes[93],

    bassTopScore: CommonFileUtil.signed32Number(bytes, 100),
    bassTopScoreDifficulty: bytes[104],
    bassStarsEasy: bytes[105],
    bassPercentEasy: bytes[106],
    bassStarsMedium: bytes[113],
    bassPercentMedium: bytes[114],
    bassStarsHard: bytes[121],
    bassPercentHard: bytes[122],
    bassStarsExpert: bytes[129],
    bassPercentExpert: bytes[130],

    guitarTopScore: CommonFileUtil.signed32Number(bytes, 137),
    guitarTopScoreDifficulty: bytes[141],
    guitarStarsEasy: bytes[142],
    guitarPercentEasy: bytes[143],
    guitarStarsMedium: bytes[150],
    guitarPercentMedium: bytes[151],
    guitarStarsHard: bytes[158],
    guitarPercentHard: bytes[159],
    guitarStarsExpert: bytes[166],
    guitarPercentExpert: bytes[167],

    vocalsTopScore: CommonFileUtil.signed32Number(bytes, 174),
    vocalsTopScoreDifficulty: bytes[178],
    vocalsStarsEasy: bytes[179],
    vocalsPercentEasy: bytes[180],
    vocalsStarsMedium: bytes[187],
    vocalsPercentMedium: bytes[188],
    vocalsStarsHard: bytes[195],
    vocalsPercentHard: bytes[196],
    vocalsStarsExpert: bytes[203],
    vocalsPercentExpert: bytes[204],

    harmoniesTopScore: CommonFileUtil.signed32Number(bytes, 211),
    harmoniesTopScoreDifficulty: bytes[215],
    harmoniesStarsEasy: bytes[216],
    harmoniesPercentEasy: bytes[217],
    harmoniesStarsMedium: bytes[224],
    harmoniesPercentMedium: bytes[225],
    harmoniesStarsHard: bytes[232],
    harmoniesPercentHard: bytes[233],
    harmoniesStarsExpert: bytes[240],
    harmoniesPercentExpert: bytes[241],

    keysTopScore: CommonFileUtil.signed32Number(bytes, 248),
    keysTopScoreDifficulty: bytes[252],
    keysStarsEasy: bytes[253],
    keysPercentEasy: bytes[254],
    keysStarsMedium: bytes[261],
    keysPercentMedium: bytes[262],
    keysStarsHard: bytes[269],
    keysPercentHard: bytes[270],
    keysStarsExpert: bytes[277],
    keysPercentExpert: bytes[278],

    proDrumsTopScore: CommonFileUtil.signed32Number(bytes, 285),
    proDrumsTopScoreDifficulty: bytes[289],
    proDrumsStarsEasy: bytes[290],
    proDrumsPercentEasy: bytes[291],
    proDrumsStarsMedium: bytes[298],
    proDrumsPercentMedium: bytes[299],
    proDrumsStarsHard: bytes[306],
    proDrumsPercentHard: bytes[307],
    proDrumsStarsExpert: bytes[314],
    proDrumsPercentExpert: bytes[315],

    proGuitarTopScore: CommonFileUtil.signed32Number(bytes, 322),
    proGuitarTopScoreDifficulty: bytes[326],
    proGuitarStarsEasy: bytes[327],
    proGuitarPercentEasy: bytes[328],
    proGuitarStarsMedium: bytes[335],
    proGuitarPercentMedium: bytes[336],
    proGuitarStarsHard: bytes[343],
    proGuitarPercentHard: bytes[344],
    proGuitarStarsExpert: bytes[351],
    proGuitarPercentExpert: bytes[352],

    proBassTopScore: CommonFileUtil.signed32Number(bytes, 359),
    proBassTopScoreDifficulty: bytes[363],
    proBassStarsEasy: bytes[364],
    proBassPercentEasy: bytes[365],
    proBassStarsMedium: bytes[372],
    proBassPercentMedium: bytes[373],
    proBassStarsHard: bytes[380],
    proBassPercentHard: bytes[381],
    proBassStarsExpert: bytes[388],
    proBassPercentExpert: bytes[389],

    proKeysTopScore: CommonFileUtil.signed32Number(bytes, 396),
    proKeysTopScoreDifficulty: bytes[400],
    proKeysStarsEasy: bytes[401],
    proKeysPercentEasy: bytes[402],
    proKeysStarsMedium: bytes[409],
    proKeysPercentMedium: bytes[410],
    proKeysStarsHard: bytes[417],
    proKeysPercentHard: bytes[418],
    proKeysStarsExpert: bytes[425],
    proKeysPercentExpert: bytes[426],

    bandTopScore: CommonFileUtil.signed32Number(bytes, 433),
    bandTopScoreDifficulty: bytes[437],
    bandStarsEasy: bytes[438],
    bandPercentEasy: bytes[439],
    bandStarsMedium: bytes[446],
    bandPercentMedium: bytes[447],
    bandStarsHard: bytes[454],
    bandPercentHard: bytes[455],
    bandStarsExpert: bytes[462],
    bandPercentExpert: bytes[463],
  };
};

/* To fail fast and not parse corrupted data check that values with
 *    finite options are valid
 */
const validateSongData = (_parsedSong: SongRowSave) => {
  // TODO log some values to build validation.
  return false;
};

const readSaveFile = (file: File | null): Promise<ReadResult<SongRowSave>> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve({ songData: [] });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileMetaData = CommonFileUtil.readFileMetaData(file);
        const songData: SongRowSave[] = [];
        const result = reader.result as ArrayBuffer;
        const data = new Uint8Array(result);

        let error = "";
        const offset = SaveFileUtil.getStartOffset(data, 0);
        if (offset === 0) {
          error =
            "File wasn't the expected format. STFS packages not yet supported. Please input save.dat (Xbox / PS3) or band3.dat (Wii).";
        } else if (data[offset - 1] != 0x00) {
          error =
            "File seems correct, but initial offset wasn't right. Report this to dev.";
        }
        if (error) {
          resolve({
            songData: [],
            error,
            fileMetaData: CommonFileUtil.readFileMetaData(file),
          });
          return;
        }

        const consoleType = SaveFileUtil.getConsoleType(data);

        let decryptedSongData;
        let songCountAsInteger;
        if (consoleType === "Wii") {
          // Wii size of save file portion 999 songs // 0x1d6 * 1000 = 0x72bf0
          decryptedSongData = data.slice(offset, offset + 0x72bf0);
          songCountAsInteger = 999;
        } else {
          const seedAndSongCount = data.slice(offset, offset + 8);
          const decryptedSongCount =
            SaveFileCryptUtil.streamDecrypt(seedAndSongCount);
          songCountAsInteger = CommonFileUtil.signed32Number(
            decryptedSongCount,
            0,
          );

          if (songCountAsInteger > 3000) {
            error = "Song count was over 3000 which should not be possible.";
          } else if (songCountAsInteger === 0) {
            error = "Song count was 0. No song data was found in save file.";
          }
          if (error) {
            // Exit early if error
            resolve({ songData, error, fileMetaData });
          }

          const cryptedDataLength = 476 + (songCountAsInteger - 1) * 474;

          decryptedSongData = SaveFileCryptUtil.streamDecrypt(
            data.slice(offset, offset + cryptedDataLength),
          );
        }

        if (songCountAsInteger > 0) {
          if (consoleType !== "Wii") {
            // Remove song count (only in first song) as it has already been calculated
            decryptedSongData = decryptedSongData.slice(4);
          }
          const songSize = 470;
          for (let i = 0; i < songCountAsInteger; i++) {
            const initialIndex = i * songSize;

            if (consoleType !== "Wii") {
              // Remove duplicate id that is in every song with other than Wii
              decryptedSongData = decryptedSongData.slice(4);
            }
            const parsedSong = parseSong(
              decryptedSongData.slice(initialIndex, initialIndex + songSize),
            );
            if (parsedSong.songID === 0) {
              // Wii doesn't have a song count and just in case stop parsing if the read song count is incorrect.
              break;
            } else if (validateSongData(parsedSong)) {
              const errorMsg = "Invalid song data detected will stop parsing";
              if (error) {
                error += ` ${errorMsg}`;
              } else {
                error = errorMsg;
              }
              break;
            }
            songData.push(parsedSong);
          }
        }

        resolve({
          songData,
          error,
          fileMetaData,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

const SaveFileParser = {
  readSaveFile,
};

export default SaveFileParser;
