import type PackageMagic from "./enums/PackageMagic";
import type PackageType from "./enums/PackageType";
import type TransferLock from "./enums/TransferLock";

export default interface HeaderData {
  magic: PackageMagic;
  packageType: PackageType;
  metaDataVersion: number;
  contentSize: number;
  mediaId: number;
  version: number;
  versionBase: number;
  titleId: number;
  platform: number;
  executableType: number;
  discNumber: number;
  discInSet: number;
  saveGameId: number;
  saveConsoleId: number;
  profileId: number;
  dataFileCount: number;
  dataFileSize: number;
  seriesId: Uint8Array;
  seasonId: Uint8Array;
  seasonNumber: number;
  episodeNumber: number;
  deviceId: Uint8Array;
  titles: string[]; // 9 language slots
  descriptions: string[]; // 9 language slots
  publisher: string;
  titlePackage: string;
  idTransfer: TransferLock;
  packageImageBinary: Uint8Array;
  contentImageBinary: Uint8Array;
}
