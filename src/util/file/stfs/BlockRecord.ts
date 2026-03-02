import STFSConstants from "@/constants/STFSConstants";
import type HashFlag from "@/types/file/stfs/enums/HashFlag";
import HashStatus from "@/types/file/stfs/enums/HashStatus";
import type TreeLevel from "@/types/file/stfs/enums/TreeLevel";

class BlockRecord {
  private _flags: Uint8Array; // 4 bytes
  private _thisBlock: Uint8Array; // 3 bytes
  private _level: number; // 1 byte

  constructor(flagsOrStatus?: number | HashStatus, nextBlock?: number) {
    this._thisBlock = new Uint8Array(3);
    this._level = 0;

    if (flagsOrStatus === undefined) {
      this._flags = new Uint8Array([0, 0, 0, 0]);
    } else if (nextBlock !== undefined) {
      // BlockRecord(HashStatus, uint nextBlock)
      this._flags = new Uint8Array(4);
      this.flags = ((flagsOrStatus as number) << 30) | (nextBlock & 0xffffff);
    } else {
      // BlockRecord(uint flagsIn)
      this._flags = new Uint8Array(4);
      this.flags = flagsOrStatus as number;
    }
  }

  // ─── ThisBlock (24-bit block index) ──────────────────────────────────

  get thisBlock(): number {
    return (
      (this._thisBlock[0] << 16) |
      (this._thisBlock[1] << 8) |
      this._thisBlock[2]
    );
  }

  set thisBlock(value: number) {
    this._thisBlock[0] = (value >> 16) & 0xff;
    this._thisBlock[1] = (value >> 8) & 0xff;
    this._thisBlock[2] = value & 0xff;
  }

  // ─── Level ───────────────────────────────────────────────────────────

  get thisLevel(): TreeLevel {
    return this._level as TreeLevel;
  }

  set thisLevel(value: TreeLevel) {
    this._level = value;
  }

  // ─── Indicator / Flags (32-bit) ──────────────────────────────────────

  get indicator(): number {
    return this._flags[0] >> 6;
  }

  set indicator(value: number) {
    this._flags[0] = (value & 3) << 6;
  }

  get flags(): number {
    return (
      ((this._flags[0] << 24) |
        (this._flags[1] << 16) |
        (this._flags[2] << 8) |
        this._flags[3]) >>>
      0
    );
  }

  set flags(value: number) {
    this._flags[0] = (value >>> 24) & 0xff;
    this._flags[1] = (value >>> 16) & 0xff;
    this._flags[2] = (value >>> 8) & 0xff;
    this._flags[3] = value & 0xff;
  }

  // ─── Data-block properties ───────────────────────────────────────────

  get status(): HashStatus {
    return (this._flags[0] >> 6) as HashStatus;
  }

  set status(value: HashStatus) {
    this._flags[0] = value << 6;
  }

  get nextBlock(): number {
    return (
      ((this._flags[1] << 16) | (this._flags[2] << 8) | this._flags[3]) >>> 0
    );
  }

  set nextBlock(value: number) {
    this.flags = ((this._flags[0] << 24) | (value & 0xffffff)) >>> 0;
  }

  markOld(): void {
    this.status = HashStatus.Old;
    this.nextBlock = STFSConstants.STFSEnd;
  }

  // ─── Table-level properties ──────────────────────────────────────────

  get index(): number {
    return this.indicator & 1;
  }

  get allocationFlag(): HashFlag {
    return this.indicator as HashFlag;
  }

  get blocksFree(): number {
    return (this.flags >>> 15) & 0x7fff;
  }

  set blocksFree(value: number) {
    if (value < 0) value = 0;
    this.flags = ((this.indicator << 30) | (value << 15)) >>> 0;
  }
}

export default BlockRecord;
