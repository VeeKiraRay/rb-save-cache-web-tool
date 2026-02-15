import type LoadMetaEntry from "./LoadMetaEntry";

export default interface ResultMetadata {
  files: LoadMetaEntry[];
  totalRows?: number;
}
