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

const STFSResder = {
  getExtractedFile,
};

export default STFSResder;
