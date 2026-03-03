import SaveFileParser from "./rb3save/SaveFileParser";
import CacheFileParser from "./rb3cache/CacheFileParser";
import type SongRowSave from "@/types/file/SongRowSave";
import type SongRowCache from "@/types/file/SongRowCache";
import type ReadResult from "@/types/file/ReadResult";
import type LoadResult from "@/types/file/LoadResult";
import type ResultMetadata from "@/types/file/ResultMetadata";
import type LoadError from "@/types/file/LoadError";
import type SongRowCombined from "@/types/file/SongRowCombined";
import DefaultValues from "./common/DefaultValues";
import SongParser from "./rb3songs/SongParser";
import type FolderData from "@/types/file/FolderData";

const mergeArraysById = (
  primaryData: SongRowCombined[],
  secondaryData: SongRowCombined[],
): SongRowCombined[] => {
  const dataToBeCombined = new Map(
    secondaryData.map((match) => [match.songID, match]),
  );
  return primaryData.map((base) => {
    const match = dataToBeCombined.get(base.songID);
    return match ? { ...base, ...match } : base;
  });
};

const handleFileLoad = async (
  file1: File | null,
  file2: File | null,
  folder: FolderData | null,
  onProgress?: (current: number, total: number) => void,
): Promise<LoadResult | LoadError> => {
  try {
    const [result1, result2, folderResult] = (await Promise.all([
      SaveFileParser.readSaveFile(file1),
      CacheFileParser.readCacheFile(file2),
      SongParser.readSongs(folder, onProgress),
    ])) as [
      ReadResult<SongRowSave> | null,
      ReadResult<SongRowCache> | null,
      ReadResult<SongRowCache> | null,
    ];

    let saveDataRows: SongRowCombined[] = [];
    let cacheDataRows: SongRowCombined[] = [];
    const meta: ResultMetadata = { files: [] };

    if (result1) {
      saveDataRows = result1.songData ?? [];
    }

    const songMetadataResult = result2 ? result2 : folderResult;

    if (songMetadataResult) {
      cacheDataRows = songMetadataResult.songData ?? [];
      if (saveDataRows.length > 0 && cacheDataRows.length > 0) {
        const originalSaveDataRows = saveDataRows;
        const originalCacheDataRows = cacheDataRows;
        saveDataRows = mergeArraysById(
          originalSaveDataRows,
          originalCacheDataRows,
        );
        cacheDataRows = mergeArraysById(
          originalCacheDataRows,
          originalSaveDataRows,
        );
      }
    }

    [result1, songMetadataResult].forEach((r) => {
      if (r && r.fileMetaData) {
        meta.files.push({
          name: r.fileMetaData.name,
          size: r.fileMetaData.size,
          lastModified: new Date(r.fileMetaData.lastModified).toLocaleString(),
          rowCount: r.songData?.length,
          error: r.error,
        });
      } else if (r && r.folderMetaData) {
        meta.folder = {
          name: r.folderMetaData.name,
          fileType: r.folderMetaData.fileType,
          filesFound: r.folderMetaData.filesFound,
          rowCount: r.songData?.length,
          error: r.error,
        };
      }
    });

    meta.totalRows = saveDataRows.length;
    return {
      saveDataRows: DefaultValues.setDefaultValuesForAllSongRows(saveDataRows),
      cacheDataRows:
        DefaultValues.setDefaultValuesForAllSongRows(cacheDataRows),
      meta,
    };
  } catch (err: unknown) {
    return {
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
};

export default handleFileLoad;
