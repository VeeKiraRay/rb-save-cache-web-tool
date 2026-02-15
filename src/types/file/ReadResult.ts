export default interface ReadResult<T> {
  songData: T[];
  fileMetaData?: { name: string; size: number; lastModified: number };
  error?: string;
}
