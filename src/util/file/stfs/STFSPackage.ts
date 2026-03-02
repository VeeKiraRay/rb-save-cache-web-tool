/**
 * STFS Package Reader (read-only)
 * Translated from Nautilus STFSPackage.cs (MIT License)
 *
 * Supports opening STFS packages (CON, LIVE, PIRS), listing
 * their file/folder directory, and extracting individual files.
 */

import PackageMagic from "@/types/file/stfs/enums/PackageMagic";
import { STFSDescriptor } from "./STFSDescriptor";
import BlockRecord from "./BlockRecord";
import PackageType from "@/types/file/stfs/enums/PackageType";
import Languages from "@/types/file/stfs/enums/Languages";
import TreeLevel from "@/types/file/stfs/enums/TreeLevel";
import STFSType from "@/types/file/stfs/enums/STFSType";
import STFSConstants from "@/constants/STFSConstants";
import type HeaderData from "@/types/file/stfs/HeaderData";
import type FileEntry from "@/types/file/stfs/FileEntry";
import type FolderEntry from "@/types/file/stfs/FolderEntry";
import STFSUtil from "./STFSUtil";
import ByteReader from "../common/ByteReader";
import type ItemEntryData from "@/types/file/stfs/ItemEntryData";
import CommonFileUtil from "../common/CommonFileUtil";

// ─── Parse a single 0x40-byte directory entry ────────────────────────────────

// ─── STFSPackage ─────────────────────────────────────────────────────────────

export class STFSPackage {
  private readonly _bytes: Uint8Array;
  /** STFS descriptor (layout calculations) */
  readonly descriptor: STFSDescriptor;

  /** Parsed header metadata */
  readonly header: HeaderData;

  /** All file entries in the package */
  readonly files: FileEntry[];

  /** All folder entries in the package */
  readonly folders: FolderEntry[];

  /** Block records for the file-directory itself */
  private readonly _directoryBlocks: BlockRecord[];

  /** Whether the parse completed successfully */
  readonly parseSuccess: boolean;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
    this.files = [];
    this.folders = [];
    this._directoryBlocks = [];
    this.parseSuccess = false;

    const offsetState = { offset: 0 };

    // ── 1. Read & validate magic ──────────────────────────────────────
    const magicValue = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
    let magic: PackageMagic;
    if (
      magicValue === PackageMagic.CON ||
      magicValue === PackageMagic.LIVE ||
      magicValue === PackageMagic.PIRS
    ) {
      magic = magicValue;
    } else {
      throw new Error(
        `Invalid STFS package: unrecognized magic 0x${magicValue.toString(16)}`,
      );
    }

    // ── 2. Read header metadata ───────────────────────────────────────
    this.header = STFSUtil.readHeader(bytes, magic);

    // ── 3. Reject game/installed types that aren't real STFS ──────────
    const unsupported: PackageType[] = [
      PackageType.HDDInstalledGame,
      PackageType.OriginalXboxGame,
      PackageType.GamesOnDemand,
      PackageType.SocialTitle,
    ];
    if (unsupported.includes(this.header.packageType)) {
      throw new Error(
        "This package type (installed game / GoD) is not supported for STFS parsing",
      );
    }

    // ── 4. Parse the STFS descriptor ──────────────────────────────────
    this.descriptor = new STFSDescriptor(bytes);

    // ── 5. Walk the directory block chain ─────────────────────────────
    this._directoryBlocks = this._getBlocks(
      this.descriptor.directoryBlockCount,
      this.descriptor.directoryBlock,
    );

    // ── 6. Read directory entries (0x40 bytes each, 64 per block) ─────
    let entryId = 0;
    for (const block of this._directoryBlocks) {
      const blockOffset = this._generateDataOffset(block.thisBlock);

      for (let i = 0; i < 0x40; i++) {
        const entryOffset = blockOffset + 0x40 * i;
        offsetState.offset = entryOffset;

        // Quick check: if first byte is 0, skip
        if (ByteReader.readUnsigned8Number(bytes, offsetState) === 0) continue;

        offsetState.offset = entryOffset;
        const entryData = ByteReader.readBytes(bytes, offsetState, 0x40);
        const entry = STFSUtil.parseDirectoryEntry(
          entryData,
          entryOffset,
          entryId,
        );

        if (entry === null) continue;

        if (entry.isFolder) {
          this.folders.push(entry as FolderEntry);
        } else {
          this.files.push(entry as FileEntry);
        }
        entryId++;
      }
    }

    this.parseSuccess = true;
  }

  // ─── Public API ──────────────────────────────────────────────────────

  /**
   * Get the display title for a given language (defaults to English).
   */
  getDisplayTitle(lang: Languages = Languages.English): string {
    return this.header.titles[lang] ?? this.header.titles[0] ?? "";
  }

  /**
   * Get the description for a given language (defaults to English).
   */
  getDescription(lang: Languages = Languages.English): string {
    return this.header.descriptions[lang] ?? this.header.descriptions[0] ?? "";
  }

  /**
   * List files in a specific folder (by folder entry ID).
   * Pass `0xFFFF` for root-level files.
   */
  getFilesInFolder(folderPointer: number = 0xffff): FileEntry[] {
    return this.files.filter((f) => f.folderPointer === folderPointer);
  }

  /**
   * List subfolders of a folder (by folder entry ID).
   * Pass `0xFFFF` for root-level folders.
   */
  getSubFolders(folderPointer: number = 0xffff): FolderEntry[] {
    return this.folders.filter((f) => f.folderPointer === folderPointer);
  }

  /**
   * Find a file by its full path (e.g. "songs/mysong/mysong.dta").
   * Path separator: `/`
   */
  findFile(path: string): FileEntry | undefined {
    const normalised = path.replace(/\\/g, "/").replace(/^\//, "");
    const parts = normalised.split("/");
    const fileName = parts.pop()!;

    // Walk the folder tree
    let currentPointer = 0xffff; // root
    for (const folderName of parts) {
      const folder = this.folders.find(
        (f) =>
          f.folderPointer === currentPointer &&
          f.name.toLowerCase() === folderName.toLowerCase(),
      );
      if (!folder) return undefined;
      currentPointer = folder.entryId;
    }

    return this.files.find(
      (f) =>
        f.folderPointer === currentPointer &&
        f.name.toLowerCase() === fileName.toLowerCase(),
    );
  }

  /**
   * Get the full path of a file or folder entry.
   */
  getEntryPath(entry: ItemEntryData): string {
    const parts: string[] = [entry.name];
    let currentPointer = entry.folderPointer;

    while (currentPointer !== 0xffff) {
      const parent = this.folders.find((f) => f.entryId === currentPointer);
      if (!parent) break;
      parts.unshift(parent.name);
      currentPointer = parent.folderPointer;
    }

    return parts.join("/");
  }

  /**
   * Extract a file's raw bytes from the package.
   * Returns Uint8Array Buffer containing the complete file data.
   */
  extractFile(file: FileEntry): Uint8Array {
    const blocks = this._getBlocks(file.blockCount, file.startBlock);
    const chunks: Uint8Array[] = [];
    const offsetState = { offset: 0 };

    for (let i = 0; i < blocks.length; i++) {
      const offset = this._generateDataOffset(blocks[i].thisBlock);
      offsetState.offset = offset;

      if (i < blocks.length - 1) {
        // Full block
        chunks.push(ByteReader.readBytes(this._bytes, offsetState, 0x1000));
      } else {
        // Last block: only read remaining bytes
        const remaining = ((file.size - 1) % 0x1000) + 1;
        chunks.push(ByteReader.readBytes(this._bytes, offsetState, remaining));
      }
    }

    return CommonFileUtil.mergeUint8Arrays(chunks);
  }

  /**
   * Extract the first N bytes of a file.
   * Useful for reading headers without loading the entire file.
   */
  extractBytes(file: FileEntry, maxBytes: number): Uint8Array {
    const blocks = this._getBlocks(file.blockCount, file.startBlock);
    const chunks: Uint8Array[] = [];
    let bytesRead = 0;
    const offsetState = { offset: 0 };

    for (let i = 0; i < blocks.length && bytesRead < maxBytes; i++) {
      const offset = this._generateDataOffset(blocks[i].thisBlock);
      offsetState.offset = offset;

      let toRead: number;
      if (i < blocks.length - 1) {
        toRead = Math.min(0x1000, maxBytes - bytesRead);
      } else {
        const remaining = ((file.size - 1) % 0x1000) + 1;
        toRead = Math.min(remaining, maxBytes - bytesRead);
      }
      chunks.push(ByteReader.readBytes(this._bytes, offsetState, toRead));
      bytesRead += toRead;
    }

    return CommonFileUtil.mergeUint8Arrays(chunks);
  }

  /**
   * Extract a file by its path string.
   * Convenience wrapper around findFile + extractFile.
   */
  extractByPath(path: string): Uint8Array | null {
    const file = this.findFile(path);
    if (!file) return null;
    return this.extractFile(file);
  }

  // ─── Internal helpers ────────────────────────────────────────────────

  /** Follow the block chain starting at `startBlock` for `count` blocks */
  private _getBlocks(count: number, startBlock: number): BlockRecord[] {
    const result: BlockRecord[] = [];
    let record = this._getRecord(startBlock, TreeLevel.L0);

    for (let i = 0; i < count; i++) {
      // Check for duplicates (cycle detection)
      if (result.some((r) => r.thisBlock === record.thisBlock)) break;
      result.push(record);

      if (record.nextBlock === STFSConstants.STFSEnd) break;
      if (record.nextBlock >= this.descriptor.blockCount) {
        throw new Error(
          `Invalid block pointer: 0x${record.nextBlock.toString(16)}`,
        );
      }

      record = this._getRecord(record.nextBlock, TreeLevel.L0);
    }

    return result;
  }

  /** Read a BlockRecord from the hash table for a given block and level */
  private _getRecord(block: number, level: TreeLevel): BlockRecord {
    if (level === TreeLevel.LT) return this.descriptor.topRecord;

    const desc = this.descriptor;
    const canSwitch = desc.stfsType === STFSType.Type1;
    let current = desc.topRecord;
    const offsetState = { offset: 0 };

    // L2 level
    if (desc.blockCount > STFSConstants.BlockLevel[1]) {
      let pos = desc.generateHashOffset(block, TreeLevel.L2) + 0x14;
      if (canSwitch) pos += current.index << 0xc;
      offsetState.offset = pos;
      current = new BlockRecord(
        ByteReader.readUnsigned32NumberBE(this._bytes, offsetState),
      );
      if (level === TreeLevel.L2) {
        current.thisBlock = block;
        current.thisLevel = TreeLevel.L2;
        return current;
      }
    } else if (level === TreeLevel.L2) {
      return desc.topRecord;
    }

    // L1 level
    if (desc.blockCount > STFSConstants.BlockLevel[0]) {
      let pos = desc.generateHashOffset(block, TreeLevel.L1) + 0x14;
      if (canSwitch) pos += current.index << 0xc;
      offsetState.offset = pos;
      current = new BlockRecord(
        ByteReader.readUnsigned32NumberBE(this._bytes, offsetState),
      );
      if (level === TreeLevel.L1) {
        current.thisBlock = block;
        current.thisLevel = TreeLevel.L1;
        return current;
      }
    } else if (level === TreeLevel.L1) {
      return desc.topRecord;
    }

    // L0 level
    let pos = desc.generateHashOffset(block, TreeLevel.L0) + 0x14;
    if (canSwitch) pos += current.index << 0xc;
    offsetState.offset = pos;
    current = new BlockRecord(
      ByteReader.readUnsigned32NumberBE(this._bytes, offsetState),
    );
    current.thisBlock = block;
    current.thisLevel = TreeLevel.L0;
    return current;
  }

  /** Wrapper for data offset generation (applies Type1 index shift) */
  private _generateDataOffset(block: number): number {
    return this.descriptor.generateDataOffset(block);
  }
}
