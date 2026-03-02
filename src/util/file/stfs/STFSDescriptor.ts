import TreeLevel from "@/types/file/stfs/enums/TreeLevel";
import STFSType from "@/types/file/stfs/enums/STFSType";
import STFSConstants from "@/constants/STFSConstants";
import BlockRecord from "./BlockRecord";
import ByteReader from "../common/ByteReader";

export class STFSDescriptor {
  /** 5-byte raw descriptor struct read from file */
  xStruct: Uint8Array;

  /** Space between hash tables at each level */
  readonly spaceBetween: [number, number, number] = [0, 0, 0];

  /** Base byte used for offset calculations */
  private readonly _baseByte: number;

  /** Total block count */
  blockCount: number;

  /** The top-level record (holds allocation index and old-block count) */
  topRecord: BlockRecord = new BlockRecord();

  /** 0 = Type0, 1 = Type1 */
  shift: number = 0;

  /** The STFS type of this descriptor */
  get stfsType(): STFSType {
    return this.shift as STFSType;
  }

  get baseBlock(): number {
    return this._baseByte << 0xc;
  }

  get directoryBlockCount(): number {
    return (this.xStruct[1] << 8) | this.xStruct[0]; // little-endian 10-bit
  }

  get directoryBlock(): number {
    return (this.xStruct[4] << 16) | (this.xStruct[3] << 8) | this.xStruct[2]; // LE 24-bit
  }

  get oldBlockCount(): number {
    return this.topRecord.blocksFree;
  }

  constructor(bytes: Uint8Array) {
    // Read the "block info" at 0x340 to derive baseByte
    const offsetState = { offset: 0x340 };
    const blockInfo = ByteReader.readSigned32NumberBE(bytes, offsetState);
    this._baseByte = ((blockInfo + 0xfff) & 0xf000) >> 0xc;

    // Validate struct marker at 0x379
    offsetState.offset = 0x379;
    if (ByteReader.readUnsigned8Number(bytes, offsetState) !== 0x24)
      throw new Error("Invalid STFS format: bad struct size");
    if (ByteReader.readUnsigned8Number(bytes, offsetState) !== 0x00)
      throw new Error("Invalid STFS format: bad reserved byte");

    // Read the shift/type index byte
    const idx = ByteReader.readUnsigned8Number(bytes, offsetState) & 3;

    // Read the 5-byte descriptor struct
    this.xStruct = new Uint8Array(ByteReader.readBytes(bytes, offsetState, 5));

    // Read block counts at 0x395
    offsetState.offset = 0x395;

    this.blockCount = ByteReader.readUnsigned32NumberBE(bytes, offsetState);
    const oldBlocks = ByteReader.readUnsigned32NumberBE(bytes, offsetState);

    // Determine STFS type from baseByte and idx
    switch (this._baseByte) {
      case 0xb:
        if (idx === 1) {
          this._setStructure(STFSType.Type0);
        } else {
          throw new Error(
            "Invalid STFS format: unexpected idx for baseByte 0xB",
          );
        }
        break;
      case 0xa:
        if (idx === 0 || idx === 2) {
          this._setStructure(STFSType.Type1);
        } else {
          throw new Error(
            "Invalid STFS format: unexpected idx for baseByte 0xA",
          );
        }
        break;
      default:
        throw new Error(
          `Invalid STFS format: unknown baseByte 0x${this._baseByte.toString(16)}`,
        );
    }

    if (this.blockCount > this.spaceBetween[2]) {
      throw new Error("Block count exceeds STFS maximum");
    }

    // Build the top record from idx and old block count
    this.topRecord = new BlockRecord(
      (((idx >> 1) & 1) << 30) | (oldBlocks << 15),
    );

    // Adjust real block count based on file length
    for (let i = this.blockCount - 1; ; i--) {
      this.blockCount = i + 1;
      if (this.generateDataOffset(i) < bytes.length) break;
      if (i === 0) break;
    }
  }

  private _setStructure(type: STFSType): void {
    switch (type) {
      case STFSType.Type0:
        this.spaceBetween[0] = 0xab;
        this.spaceBetween[1] = 0x718f;
        this.spaceBetween[2] = 0xfe7da;
        this.shift = 0;
        break;
      case STFSType.Type1:
        this.spaceBetween[0] = 0xac;
        this.spaceBetween[1] = 0x723a;
        this.spaceBetween[2] = 0xfd00b;
        this.shift = 1;
        break;
    }
  }

  // ─── Block / offset calculations ─────────────────────────────────────

  /** Convert a logical block index to its "data block" index (accounting for hash tables) */
  generateDataBlock(block: number): number {
    if (block >= 0x4af768) return STFSConstants.STFSEnd;

    const BL = STFSConstants.BlockLevel;
    let num = ((Math.floor(block / BL[0]) + 1) << this.shift) + block;
    if (block < BL[0]) return num;

    num += (Math.floor(block / BL[1]) + 1) << this.shift;
    if (block < BL[1]) return num;

    return num + (1 << this.shift);
  }

  /** Get the hash-table block index for a given block and tree level */
  generateHashBlock(block: number, tree: TreeLevel): number {
    if (block >= 0x4af768) return STFSConstants.STFSEnd;

    const BL = STFSConstants.BlockLevel;
    const SB = this.spaceBetween;

    switch (tree) {
      case TreeLevel.L0: {
        let num = Math.floor(block / BL[0]) * SB[0];
        if (block < BL[0]) return num;
        num += (Math.floor(block / BL[1]) + 1) << this.shift;
        if (block >= BL[1]) num += 1 << this.shift;
        return num;
      }
      case TreeLevel.L1: {
        if (block < BL[1]) return SB[0];
        return SB[1] * Math.floor(block / BL[1]) + (1 << this.shift);
      }
      case TreeLevel.L2:
        return SB[1];
      default:
        return STFSConstants.STFSEnd;
    }
  }

  /** Get the byte offset within the file for a hash entry */
  generateHashOffset(block: number, tree: TreeLevel): number {
    if (block >= 0x4af768) return STFSConstants.STFSEnd;

    const BL = STFSConstants.BlockLevel;
    const hashBlock = this.generateHashBlock(block, tree);
    let offset = this.blockToOffset(hashBlock);

    switch (tree) {
      case TreeLevel.L0:
        offset += 0x18 * (block % BL[0]);
        break;
      case TreeLevel.L1:
        offset += 0x18 * (Math.floor(block / BL[0]) % BL[0]);
        break;
      case TreeLevel.L2:
        offset += 0x18 * (Math.floor(block / BL[1]) % BL[0]);
        break;
    }
    return offset;
  }

  /** Get the byte offset of a data block in the file */
  generateDataOffset(block: number): number {
    if (block >= 0x4af768) return STFSConstants.STFSEnd;
    return this.blockToOffset(this.generateDataBlock(block));
  }

  /** Convert a raw block index to a byte offset */
  blockToOffset(block: number): number {
    return block * 0x1000 + this.baseBlock;
  }

  /** Get the base offset for a hash table at a given tree level */
  generateBaseOffset(block: number, tree: TreeLevel): number {
    return this.blockToOffset(this.generateHashBlock(block, tree));
  }
}
