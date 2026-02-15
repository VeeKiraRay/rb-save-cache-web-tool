import CommonFileUtil from "./CommonFileUtil";
import type OffsetState from "@/types/file/OffsetState";

const readSigned32Number = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32Number(bytes, advanceOffset(offsetState, 4));
};

const readSigned32NumberFromFloat = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32NumberFromFloat(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned32Number = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned32Number(bytes, advanceOffset(offsetState, 4));
};

const readUnsigned16NumberFromFloat = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16NumberFromFloat(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned16Number = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16Number(bytes, advanceOffset(offsetState, 2));
};

const readUnsigned8Number = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned8Number(bytes, advanceOffset(offsetState, 1));
};

const readUTF8StringFromBytes = (
  bytes: Uint8Array,
  offsetState: OffsetState,
  byteCount: number,
): string => {
  return CommonFileUtil.utf8StringFromBytes(
    bytes,
    advanceOffset(offsetState, byteCount),
    byteCount,
  );
};

/* Adcance offset but return the current offset
 *  so read function can be one liners
 */
const advanceOffset = (
  offsetState: OffsetState,
  offsetIncrement: number,
): number => {
  const currentOffset = offsetState.offset;
  offsetState.offset += offsetIncrement;
  return currentOffset;
};

/**
 * The cache file song data is not a constant size like
 * with the save file song data so we need to constantly
 * calculate the offset and keep track of it.
 */
const ByteReader = {
  advanceOffset,
  readSigned32Number,
  readSigned32NumberFromFloat,
  readUnsigned32Number,
  readUnsigned16NumberFromFloat,
  readUnsigned16Number,
  readUnsigned8Number,
  readUTF8StringFromBytes,
};

export default ByteReader;
