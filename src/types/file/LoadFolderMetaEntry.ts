export default interface LoadFolderMetaEntry {
  name: string;
  fileType: string;
  filesFound: number;
  rowCount?: number;
  error?: string;
}
