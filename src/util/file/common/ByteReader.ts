import CommonFileUtil from "./CommonFileUtil";
import type OffsetState from "@/types/file/OffsetState";

const readSigned32NumberLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32NumberLE(bytes, advanceOffset(offsetState, 4));
};

const readSigned32NumberFromFloatLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32NumberFromFloatLE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned32NumberLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned32NumberLE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned16NumberFromFloatLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16NumberFromFloatLE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned16NumberLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16NumberLE(
    bytes,
    advanceOffset(offsetState, 2),
  );
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

const readSigned32NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32NumberBE(bytes, advanceOffset(offsetState, 4));
};

const readSigned32NumberFromFloatBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed32NumberFromFloatBE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned32NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned32NumberBE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned16NumberFromFloatBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16NumberFromFloatBE(
    bytes,
    advanceOffset(offsetState, 4),
  );
};

const readUnsigned16NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned16NumberBE(
    bytes,
    advanceOffset(offsetState, 2),
  );
};

const readUnsigned24NumberLE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned24NumberLE(
    bytes,
    advanceOffset(offsetState, 3),
  );
};

const readUnsigned24NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned24NumberBE(
    bytes,
    advanceOffset(offsetState, 3),
  );
};

const readSigned64NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.signed64NumberBE(bytes, advanceOffset(offsetState, 8));
};

const readUnsigned40NumberBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
): number => {
  return CommonFileUtil.unsigned40NumberBE(
    bytes,
    advanceOffset(offsetState, 5),
  );
};

const readAsciiStringFromBytes = (
  bytes: Uint8Array,
  offsetState: OffsetState,
  length: number,
): string => {
  return CommonFileUtil.asciiStringFromBytes(
    bytes,
    advanceOffset(offsetState, length),
    length,
  );
};

const readUnicodeStringBE = (
  bytes: Uint8Array,
  offsetState: OffsetState,
  charCount: number,
): string => {
  return CommonFileUtil.unicodeStringBE(
    bytes,
    advanceOffset(offsetState, charCount * 2),
    charCount,
  );
};

const readBytes = (
  bytes: Uint8Array,
  offsetState: OffsetState,
  byteCount: number,
) => {
  return bytes.slice(advanceOffset(offsetState, byteCount), offsetState.offset);
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
  readBytes,
  readSigned32NumberLE,
  readSigned32NumberBE,
  readSigned32NumberFromFloatLE,
  readSigned32NumberFromFloatBE,
  readUnsigned32NumberLE,
  readUnsigned32NumberBE,
  readUnsigned16NumberFromFloatLE,
  readUnsigned16NumberFromFloatBE,
  readUnsigned16NumberLE,
  readUnsigned16NumberBE,
  readUnsigned8Number,
  readUTF8StringFromBytes,
  readUnsigned24NumberLE,
  readUnsigned24NumberBE,
  readSigned64NumberBE,
  readUnsigned40NumberBE,
  readAsciiStringFromBytes,
  readUnicodeStringBE,
};

export default ByteReader;
