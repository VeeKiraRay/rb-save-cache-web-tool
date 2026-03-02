export default interface ReadResult<T> {
  songData: T[];
  fileMetaData?: { name: string; size: number; lastModified: number };
  folderMetaData?: { name: string; fileType: string; filesFound: number };
  error?: string;
}
