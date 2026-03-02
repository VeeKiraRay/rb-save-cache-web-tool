import type ReadResult from "@/types/file/ReadResult";
import type SongRowCache from "@/types/file/SongRowCache";
import DTAToCacheFormatConverter from "../rb3cache/DTAToCacheFormatConverter";
import type FolderData from "@/types/file/FolderData";

const getDTAFiles = (selectedFolderFiles: FileList) => {
  return Array.from(selectedFolderFiles).filter(
    (file) => file.name.toLowerCase() === "songs.dta",
  );
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
): Promise<ReadResult<SongRowCache> | undefined> => {
  if (!folderData) {
    return undefined;
  }

  const dtaFiles = getDTAFiles(folderData.files);
  const hasDTAFiles = dtaFiles.length > 0;
  const rb3conParsing = !hasDTAFiles && false; // TODO
  const metadata = createMetadata(folderData.folderName, true, dtaFiles.length);
  if (!hasDTAFiles && !rb3conParsing) {
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
