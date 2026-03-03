import type ReadResult from "@/types/file/ReadResult";
import type SongRowCache from "@/types/file/SongRowCache";
import DTAToCacheFormatConverter from "../rb3cache/DTAToCacheFormatConverter";
import type FolderData from "@/types/file/FolderData";
import STFSReader from "../stfs/STFSReader";

const songMetadataFile = "songs.dta";

const getDTAFiles = (selectedFolderFiles: FileList) => {
  return Array.from(selectedFolderFiles).filter(
    (file) => file.name.toLowerCase() === songMetadataFile,
  );
};

const getDTAFromConFiles = async (
  selectedFolderFiles: FileList,
  onProgress?: (current: number, total: number) => void,
) => {
  const filesFromCons: File[] = [];
  const files = Array.from(selectedFolderFiles);
  onProgress?.(0, files.length);
  for (let i = 0; i < files.length; i++) {
    const extracted = await STFSReader.getExtractedFiles(files[i], [
      songMetadataFile,
    ]);
    filesFromCons.push(
      ...extracted.map((blob) => new File([blob], songMetadataFile)),
    );
    onProgress?.(i + 1, files.length);
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
  onProgress?: (current: number, total: number) => void,
): Promise<ReadResult<SongRowCache> | undefined> => {
  if (!folderData) {
    return undefined;
  }

  let dtaFiles = getDTAFiles(folderData.files);
  const hasDTAFiles = dtaFiles.length > 0;
  if (!hasDTAFiles) {
    dtaFiles = await getDTAFromConFiles(folderData.files, onProgress);
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
