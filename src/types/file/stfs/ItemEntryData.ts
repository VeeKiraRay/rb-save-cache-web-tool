export default interface ItemEntryData {
  name: string;
  entryId: number;
  folderPointer: number;
  isFolder: boolean;
  isDeleted: boolean;
  unknownFlag: boolean;
  size: number;
  blockCount: number;
  startBlock: number;
  created: Date;
  accessed: Date;
  directoryOffset: number;
}
