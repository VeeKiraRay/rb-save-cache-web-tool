import type LoadFileMetaEntry from "./LoadFileMetaEntry";
import type LoadFolderMetaEntry from "./LoadFolderMetaEntry";

export default interface ResultMetadata {
  files: LoadFileMetaEntry[];
  folder?: LoadFolderMetaEntry;
  totalRows?: number;
}
