import type { ConsoleType } from "@/types/ConsoleType";
import STFSResder from "../stfs/STFSReader";

/* Console is determined by save file length */
const getConsoleType = (bytes: Uint8Array): ConsoleType => {
  if (bytes.length === 0xc00000) {
    return "Wii";
  } else if (bytes.length === 0x43a929) {
    return "Xbox";
  } else if (bytes.length === 0x43a99d) {
    return "PS3";
  } else {
    return "Unknown";
  }
};

/* Wii save file has a smaller song limit but can hold multiple profiles */
const getStartOffset = (consoleType: string, wiiProfileIndex: number) => {
  if (consoleType === "Wii") {
    // TODO wiiProfileIndex change needs to be build somehow
    switch (wiiProfileIndex) {
      case 0:
        return 0x540000;
      case 1:
        return 0x6c0000;
      case 2:
        return 0x840000;
      case 3:
        return 0x9c0000;
      default:
        return 0x540000;
    }
  } else if (consoleType === "Xbox") {
    return 0x2c7123;
  } else if (consoleType === "PS3") {
    return 0x2c7197;
  } else {
    return 0;
  }
};

const getFileDetails = (bytes: Uint8Array, wiiProfileIndex: number = 0) => {
  let consoleType = getConsoleType(bytes);
  let extractedBytes = undefined;
  if (consoleType === "Unknown") {
    extractedBytes = STFSResder.getExtractedFile(bytes, ["save.dat"]);
    if (extractedBytes) {
      // Just for safety the extracted bytes should still be the exact size
      consoleType = getConsoleType(extractedBytes);
    }
  }

  return {
    consoleType,
    extractedBytes,
    offset: getStartOffset(consoleType, wiiProfileIndex),
  };
};

const SaveFileUtil = {
  getFileDetails,
};

export default SaveFileUtil;
