export default interface LoadFileMetaEntry {
  name: string;
  size: number;
  lastModified: string;
  rowCount?: number;
  error?: string;
}
