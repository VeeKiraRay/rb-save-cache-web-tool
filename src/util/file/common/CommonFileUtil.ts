import type FileMeta from "@/types/file/FileMeta";

const readFileMetaData = (file: File): FileMeta => {
  return {
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
  };
};

const unsigned32NumberLE = (bytes: Uint8Array, offset: number): number => {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
};

const signed32NumberLE = (bytes: Uint8Array, offset: number): number => {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
};

const unsigned8Number = (bytes: Uint8Array, offset: number): number => {
  return bytes[offset];
};

const unsigned16NumberLE = (bytes: Uint8Array, offset: number): number => {
  return bytes[offset] | (bytes[offset + 1] << 8);
};

const toFloat32LE = (bytes: Uint8Array, offset: number): number => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getFloat32(offset, true);
};

const signed32NumberFromFloatLE = (
  bytes: Uint8Array,
  offset: number,
): number => {
  return Math.trunc(toFloat32LE(bytes, offset));
};

const unsigned16NumberFromFloatLE = (
  bytes: Uint8Array,
  offset: number,
): number => {
  return Math.trunc(toFloat32LE(bytes, offset)) & 0xffff;
};

const utf8StringFromBytes = (
  bytes: Uint8Array,
  offset: number,
  byteCount: number,
): string => {
  return new TextDecoder("utf-8").decode(
    bytes.slice(offset, offset + byteCount),
  );
};

const latin1StringFromBytes = (
  bytes: Uint8Array,
  offset: number,
  byteCount: number,
): string => {
  return new TextDecoder("latin1").decode(
    bytes.slice(offset, offset + byteCount),
  );
};

const unsigned32NumberBE = (bytes: Uint8Array, offset: number): number => {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
};

const signed32NumberBE = (bytes: Uint8Array, offset: number): number => {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  );
};

const unsigned16NumberBE = (bytes: Uint8Array, offset: number): number => {
  return (bytes[offset] << 8) | bytes[offset + 1];
};

const toFloat32BE = (bytes: Uint8Array, offset: number): number => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getFloat32(offset, false);
};

const signed32NumberFromFloatBE = (
  bytes: Uint8Array,
  offset: number,
): number => {
  return Math.trunc(toFloat32BE(bytes, offset));
};

const unsigned16NumberFromFloatBE = (
  bytes: Uint8Array,
  offset: number,
): number => {
  return Math.trunc(toFloat32BE(bytes, offset)) & 0xffff;
};

const unsigned24NumberBE = (bytes: Uint8Array, offset: number): number => {
  const b0 = bytes[offset];
  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];
  return (b0 << 16) | (b1 << 8) | b2;
};

const unsigned24NumberLE = (bytes: Uint8Array, offset: number): number => {
  const b0 = bytes[offset];
  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];
  return b0 | (b1 << 8) | (b2 << 16);
};

/** Read a signed 64-bit integer as a JS number (big-endian).
 *  Note: precision loss beyond 2^53-1 */
const signed64NumberBE = (bytes: Uint8Array, offset: number): number => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const hi = view.getInt32(offset, false);
  const lo = view.getUint32(offset + 4, false);
  return hi * 0x100000000 + lo;
};

/** Read an unsigned 40-bit integer (5 bytes, big-endian) */
const unsigned40NumberBE = (bytes: Uint8Array, offset: number): number => {
  const b0 = bytes[offset];
  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];
  const b3 = bytes[offset + 3];
  const b4 = bytes[offset + 4];
  return (b0 * 0x100000000 + ((b1 << 24) | (b2 << 16) | (b3 << 8) | b4)) >>> 0;
};

/** Read an ASCII string of `length` bytes */
const asciiStringFromBytes = (
  bytes: Uint8Array,
  offset: number,
  length: number,
): string => {
  const byteArray = bytes.slice(offset, offset + length);
  return Array.from(byteArray)
    .map((b) => String.fromCharCode(b))
    .join("");
};

/** Read a UTF-16BE (Unicode big-endian) string of `charCount` characters.
 *  This matches the Xbox/STFS header format. */
const unicodeStringBE = (
  bytes: Uint8Array,
  offset: number,
  charCount: number,
): string => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let result = "";
  for (let i = 0; i < charCount; i++) {
    const code = view.getUint16(offset + i * 2, false);
    result += String.fromCharCode(code);
  }
  return result.replace(/\0/g, "");
};

/** Read a UTF-16LE (Unicode little-endian) string of `charCount` characters. */
const unicodeStringLE = (
  bytes: Uint8Array,
  offset: number,
  charCount: number,
): string => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let result = "";
  for (let i = 0; i < charCount; i++) {
    const code = view.getUint16(offset + i * 2, true);
    result += String.fromCharCode(code);
  }
  return result.replace(/\0/g, "");
};

const mergeUint8Arrays = (chunks: Uint8Array[]): Uint8Array => {
  const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  for (const arr of chunks) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
};

const CommonFileUtil = {
  readFileMetaData,
  signed32NumberLE,
  signed32NumberBE,
  signed32NumberFromFloatLE,
  signed32NumberFromFloatBE,
  unsigned32NumberLE,
  unsigned32NumberBE,
  unsigned16NumberLE,
  unsigned16NumberBE,
  unsigned16NumberFromFloatLE,
  unsigned16NumberFromFloatBE,
  unsigned24NumberLE,
  unsigned24NumberBE,
  signed64NumberBE,
  unsigned40NumberBE,
  unsigned8Number,
  utf8StringFromBytes,
  latin1StringFromBytes,
  asciiStringFromBytes,
  unicodeStringLE,
  unicodeStringBE,
  mergeUint8Arrays,
};

export default CommonFileUtil;
