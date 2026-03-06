import type ReadResult from "@/types/file/ReadResult";
import type SongRowCache from "@/types/file/SongRowCache";
import DTAToCacheFormatConverter from "../rb3cache/DTAToCacheFormatConverter";
import type FolderData from "@/types/file/FolderData";
import STFSReader from "../stfs/STFSReader";

const songMetadataFile = "songs.dta";

type ProgressCallback = (
  current: number,
  total: number,
  label: string,
) => void;

const getDTAFiles = async (
  selectedFolderFiles: FileList,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
) => {
  const allFiles = Array.from(selectedFolderFiles);
  const label = "Scanning songs.dta files…";
  const dtaFiles: File[] = [];
  onProgress?.(0, allFiles.length, label);
  for (let i = 0; i < allFiles.length; i++) {
    signal?.throwIfAborted();
    if (allFiles[i].name.toLowerCase() === songMetadataFile) {
      dtaFiles.push(allFiles[i]);
    }
    onProgress?.(i + 1, allFiles.length, label);
  }
  return dtaFiles;
};

const getDTAFromConFiles = async (
  selectedFolderFiles: FileList,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
) => {
  const filesFromCons: File[] = [];
  const files = Array.from(selectedFolderFiles);
  const label = "Scanning rb3con files…";
  onProgress?.(0, files.length, label);
  for (let i = 0; i < files.length; i++) {
    signal?.throwIfAborted();
    const extracted = await STFSReader.getExtractedFilesSliced(files[i], [
      songMetadataFile,
    ]);
    filesFromCons.push(
      ...extracted.map((blob) => new File([blob], songMetadataFile)),
    );
    onProgress?.(i + 1, files.length, label);
  }
  return filesFromCons;
};

const createMetadata = (
  folderName: string,
  dtaMode: boolean,
  filesFound: number,
) => {
  const fileType = dtaMode ? "songs.dta" : "rb3con";
  return { name: folderName, fileType, filesFound };
};

const readSongs = async (
  folderData: FolderData | null,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<ReadResult<SongRowCache> | undefined> => {
  if (!folderData) {
    return undefined;
  }

  let dtaFiles = await getDTAFiles(folderData.files, onProgress, signal);
  const hasDTAFiles = dtaFiles.length > 0;
  if (!hasDTAFiles) {
    dtaFiles = await getDTAFromConFiles(folderData.files, onProgress, signal);
  }

  const metadata = createMetadata(
    folderData.folderName,
    hasDTAFiles,
    dtaFiles.length,
  );
  if (dtaFiles.length === 0) {
    return {
      songData: [],
      error: "Could not find suitable files to parse.",
      folderMetaData: metadata,
    };
  }

  const songData = await DTAToCacheFormatConverter.readFiles(dtaFiles);
  return {
    songData,
    folderMetaData: metadata,
  };
};

const SongParser = {
  readSongs,
};

export default SongParser;
