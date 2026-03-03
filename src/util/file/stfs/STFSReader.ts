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

const STFSResder = {
  getExtractedFile,
  getExtractedFiles,
};

export default STFSResder;
