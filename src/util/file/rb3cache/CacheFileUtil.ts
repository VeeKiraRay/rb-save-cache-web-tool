import ByteReader from "../common/ByteReader";

const sZAEregex = /^sZAE\/\d{3}$/;
const latin1Regex = /^[\x20-\x7E\xA0-\xFF]+$/;

const validateCacheFile = (buffer: ArrayBuffer, isWii: boolean): boolean => {
  const bytes = new Uint8Array(buffer);
  const offsetState = { offset: 0 };
  if (isWii) {
    // Skip Wii VFF format header
    ByteReader.advanceOffset(offsetState, 21024);
  }
  let validBlocks = 0;
  let invalidBlock = 0;
  let foundRb3con = false;
  let foundSzaePattern = false;

  while (offsetState.offset <= buffer.byteLength) {
    // Skip unknown values
    ByteReader.advanceOffset(offsetState, 8);

    // Read 4-byte string length for
    const stringLength = ByteReader.readSigned32Number(bytes, offsetState);

    // Basic sanity checks string should be shortname like daylatedollarshort for Xbox or sZAE/001 style for Wii
    if (stringLength <= 0 || stringLength > 100) return false;
    // If we are going out of bound for the file
    if (offsetState.offset + stringLength > buffer.byteLength) return false;

    // Extract string bytes
    let string;
    try {
      string = ByteReader.readUTF8StringFromBytes(
        bytes,
        offsetState,
        stringLength,
      );
    } catch {
      return false;
    }

    // Validate printable ASCII + Latin‑1
    if (latin1Regex.test(string)) {
      validBlocks++;
    } else {
      invalidBlock++;
    }

    // Heuristic: look for _rb3con
    if (string.includes("_rb3con")) {
      foundRb3con = true;
    }
    if (sZAEregex.test(string)) {
      foundSzaePattern = true;
    }

    // Stop early if we have enough evidence
    if (validBlocks >= 5 || foundRb3con || foundSzaePattern) {
      return true;
    } else if (invalidBlock > 5) {
      return false;
    }
  }

  // Wii should have found sZAE pattern
  if (isWii) {
    return validBlocks >= 1 && foundSzaePattern;
  }
  // Xbox a valid song or a rb3con in some part of the string.
  return validBlocks >= 1 || foundRb3con;
};

const CacheFileUtil = {
  validateCacheFile,
};

export default CacheFileUtil;
