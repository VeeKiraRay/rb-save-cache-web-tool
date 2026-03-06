import { STFSPackage } from "./STFSPackage";

const getExtractedFile = (bytes: Uint8Array, filesToFind: string[]) => {
  try {
    const pkg = new STFSPackage(bytes);
    for (const file of pkg.files) {
      if (filesToFind.includes(file.name)) {
        const bytes = pkg.extractFile(file);
        return bytes;
      }
    }
  } catch (e) {
    console.error("failed to parse STFS: ", e);
  }
};

const getExtractedFiles = async (stfsFile: File, filesToFind: string[]) => {
  const buffer = await stfsFile.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const filesFound = [];
  try {
    const pkg = new STFSPackage(bytes);
    for (const file of pkg.files) {
      if (filesToFind.includes(file.name)) {
        filesFound.push(
          new Blob([pkg.extractFile(file).buffer as ArrayBuffer], {
            type: "application/octet-stream",
          }),
        );
      }
    }
  } catch {
    // Fail silently since there is no quarantee that the File is an STFS when looping through folders and subfolders
  }
  return filesFound;
};

// 1 MB covers single-song CON files (songs.dta at ~53 KB) and
// small multi-song packs (2–3 songs), avoiding a full-file fallback for those.
// Large packs with songs.dta deeper in the file still fall back to a full read.
// Tested: 128–512 KB ~50 s, 1024 KB ~40 s, 2048 KB ~50 s for 2000 files.
const HEADER_SLICE_BYTES = 1024 * 1024;

const getExtractedFilesSliced = async (
  stfsFile: File,
  filesToFind: string[],
) => {
  const sliceSize = Math.min(stfsFile.size, HEADER_SLICE_BYTES);
  const buffer = await stfsFile.slice(0, sliceSize).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Separate construction from extraction so invalid STFS files are silently
  // skipped while extraction failures (blocks beyond slice) trigger a fallback.
  let pkg: STFSPackage;
  try {
    pkg = new STFSPackage(bytes);
  } catch {
    return [];
  }

  const targetEntries = pkg.files.filter((f) => filesToFind.includes(f.name));
  if (targetEntries.length === 0) return [];

  const filesFound: Blob[] = [];
  for (const file of targetEntries) {
    // If the file's start block is beyond the truncated blockCount, its data
    // is outside the slice — fall back to the full read immediately.
    if (file.startBlock >= pkg.descriptor.blockCount) {
      return getExtractedFiles(stfsFile, filesToFind);
    }
    try {
      const extracted = pkg.extractFile(file);
      // A size mismatch means only partial data was read from within the slice.
      if (extracted.byteLength < file.size) {
        return getExtractedFiles(stfsFile, filesToFind);
      }
      filesFound.push(
        new Blob([extracted.buffer as ArrayBuffer], {
          type: "application/octet-stream",
        }),
      );
    } catch {
      return getExtractedFiles(stfsFile, filesToFind);
    }
  }

  return filesFound;
};

const STFSResder = {
  getExtractedFile,
  getExtractedFiles,
  getExtractedFilesSliced,
};

export default STFSResder;
