import type { ConsoleType } from "@/types/ConsoleType";

/* Console is determined by save file length */
const getConsoleType = (data: Uint8Array): ConsoleType => {
  if (data.length === 0xc00000) {
    return "Wii";
  } else if (data.length === 0x43a929) {
    return "Xbox";
  } else if (data.length === 0x43a99d) {
    return "PS3";
  } else {
    // TODO xbox CON file check here?
    return "Unknown";
  }
};

/* Wii save file has a smaller song limit but can hold multiple profiles */
const getStartOffset = (data: Uint8Array, wiiProfileIndex: number = 0) => {
  const consoleType = getConsoleType(data);
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

const SaveFileUtil = {
  getConsoleType,
  getStartOffset,
};

export default SaveFileUtil;
