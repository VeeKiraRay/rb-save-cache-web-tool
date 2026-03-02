import type PackageMagic from "@/types/file/stfs/enums/PackageMagic";
import type PackageType from "@/types/file/stfs/enums/PackageType";
import type TransferLock from "@/types/file/stfs/enums/TransferLock";
import type HeaderData from "@/types/file/stfs/HeaderData";
import type ItemEntryData from "@/types/file/stfs/ItemEntryData";
import ByteReader from "../common/ByteReader";

const fatTimeToDate = (fatTime: number): Date => {
  // FAT timestamp packing: date in upper 16 bits, time in lower 16 bits
  const time = fatTime & 0xffff;
  const date = (fatTime >>> 16) & 0xffff;

  const seconds = (time & 0x1f) * 2;
  const minutes = (time >> 5) & 0x3f;
  const hours = (time >> 11) & 0x1f;
  const day = date & 0x1f;
  const month = ((date >> 5) & 0x0f) - 1;
  const year = ((date >> 9) & 0x7f) + 1980;

  return new Date(year, month, day, hours, minutes, seconds);
};

function readHeader(bytes: Uint8Array, magic: PackageMagic): HeaderData {
  // Licenses at 0x22C (skip for read-only, but advance past them)
  const offsetState = { offset: 0x344 };

  const packageType = ByteReader.readUnsigned32NumberBE(
    bytes,
    offsetState,
  ) as PackageType;
  const metaDataVersion = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const contentSize = ByteReader.readSigned64NumberBE(bytes, offsetState);
  const mediaId = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const version = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const versionBase = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const titleId = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const platform = ByteReader.readUnsigned8Number(bytes, offsetState);
  const executableType = ByteReader.readUnsigned8Number(bytes, offsetState);
  const discNumber = ByteReader.readUnsigned8Number(bytes, offsetState);
  const discInSet = ByteReader.readUnsigned8Number(bytes, offsetState);
  const saveGameId = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const saveConsoleId = ByteReader.readUnsigned40NumberBE(bytes, offsetState);
  const profileId = ByteReader.readSigned64NumberBE(bytes, offsetState);

  offsetState.offset = 0x39d;
  const dataFileCount = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
  const dataFileSize = ByteReader.readSigned64NumberBE(bytes, offsetState);
  /* reserved */ ByteReader.readSigned64NumberBE(bytes, offsetState);
  const seriesId = ByteReader.readBytes(bytes, offsetState, 0x10);
  const seasonId = ByteReader.readBytes(bytes, offsetState, 0x10);
  const seasonNumber = ByteReader.readUnsigned16NumberBE(bytes, offsetState);
  const episodeNumber = ByteReader.readUnsigned16NumberBE(bytes, offsetState);

  /* Skip padding */
  ByteReader.advanceOffset(offsetState, 0x28);
  const deviceId = ByteReader.readBytes(bytes, offsetState, 0x14);

  const titles: string[] = [];
  for (let i = 0; i < 9; i++) {
    titles.push(ByteReader.readUnicodeStringBE(bytes, offsetState, 0x80));
  }
  const descriptions: string[] = [];
  for (let i = 0; i < 9; i++) {
    descriptions.push(ByteReader.readUnicodeStringBE(bytes, offsetState, 0x80));
  }
  const publisher = ByteReader.readUnicodeStringBE(bytes, offsetState, 0x40);
  const titlePackage = ByteReader.readUnicodeStringBE(bytes, offsetState, 0x40);
  const idTransferByte = ByteReader.readUnsigned8Number(bytes, offsetState);
  const idTransfer = ((idTransferByte >> 6) & 3) as TransferLock;

  const pkgImgSize = ByteReader.readSigned32NumberBE(bytes, offsetState);
  const cntImgSize = ByteReader.readSigned32NumberBE(bytes, offsetState);

  offsetState.offset = 0x171a;
  const packageImageBinary = ByteReader.readBytes(
    bytes,
    offsetState,
    Math.min(pkgImgSize, 0x4000),
  );

  offsetState.offset = 0x571a;
  const contentImageBinary = ByteReader.readBytes(
    bytes,
    offsetState,
    Math.min(cntImgSize, 0x4000),
  );

  return {
    magic,
    packageType,
    metaDataVersion,
    contentSize,
    mediaId,
    version,
    versionBase,
    titleId,
    platform,
    executableType,
    discNumber,
    discInSet,
    saveGameId,
    saveConsoleId,
    profileId,
    dataFileCount,
    dataFileSize,
    seriesId,
    seasonId,
    seasonNumber,
    episodeNumber,
    deviceId,
    titles,
    descriptions,
    publisher,
    titlePackage,
    idTransfer,
    packageImageBinary,
    contentImageBinary,
  };
}

const parseDirectoryEntry = (
  bytes: Uint8Array,
  directoryOffset: number,
  entryId: number,
): ItemEntryData | null => {
  const offsetState = { offset: 0x28 };
  const flag = ByteReader.readUnsigned8Number(bytes, offsetState);
  const nameLength = flag & 0x3f;
  const isFolder = ((flag >> 7) & 1) === 1;
  const unknownFlag = ((flag >> 6) & 1) === 1;

  if (nameLength === 0 || nameLength > 0x28) return null; // deleted or invalid

  offsetState.offset = 0;
  const name = ByteReader.readAsciiStringFromBytes(
    bytes,
    offsetState,
    nameLength,
  );

  offsetState.offset = 0x29;
  const blockCount = ByteReader.readUnsigned24NumberLE(bytes, offsetState);
  ByteReader.advanceOffset(offsetState, 3); // skip the duplicate copy at +0x2C
  const startBlock = ByteReader.readUnsigned24NumberLE(bytes, offsetState);
  const folderPointer = ByteReader.readUnsigned16NumberBE(bytes, offsetState);
  const size = ByteReader.readSigned32NumberBE(bytes, offsetState);
  const created = fatTimeToDate(
    ByteReader.readSigned32NumberBE(bytes, offsetState),
  );
  const accessed = fatTimeToDate(
    ByteReader.readSigned32NumberBE(bytes, offsetState),
  );

  return {
    name,
    entryId,
    folderPointer,
    isFolder,
    isDeleted: false,
    unknownFlag,
    size,
    blockCount,
    startBlock,
    created,
    accessed,
    directoryOffset,
  };
};

const STFSUtil = {
  readHeader,
  parseDirectoryEntry,
};

export default STFSUtil;
