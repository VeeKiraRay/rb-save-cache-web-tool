import type FileMeta from "@/types/file/FileMeta";

const readFileMetaData = (file: File): FileMeta => {
  return {
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
  };
};

const unsigned32Number = (bytes: Uint8Array, offset: number): number => {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
};

const signed32Number = (bytes: Uint8Array, offset: number): number => {
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

const unsigned16Number = (bytes: Uint8Array, offset: number): number => {
  return bytes[offset] | (bytes[offset + 1] << 8);
};

const toFloat32 = (bytes: Uint8Array, offset: number): number => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getFloat32(offset, true);
};

const signed32NumberFromFloat = (bytes: Uint8Array, offset: number): number => {
  return Math.trunc(toFloat32(bytes, offset));
};

const unsigned16NumberFromFloat = (
  bytes: Uint8Array,
  offset: number,
): number => {
  return Math.trunc(toFloat32(bytes, offset)) & 0xffff;
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

const CommonFileUtil = {
  readFileMetaData,
  signed32Number,
  signed32NumberFromFloat,
  unsigned32Number,
  unsigned16Number,
  unsigned16NumberFromFloat,
  unsigned8Number,
  utf8StringFromBytes,
  latin1StringFromBytes,
};

export default CommonFileUtil;
