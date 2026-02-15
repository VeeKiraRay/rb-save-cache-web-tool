import type SongRowCache from "@/types/file/SongRowCache";
import { DIFFICULTY_VALUE_NOT_SET } from "@/constants/Constants";
type DifficultyThresholds = {
  diff1: number;
  diff2: number;
  diff3: number;
  diff4: number;
  diff5: number;
  diff6: number;
};

const GUITAR_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 139,
  diff2: 176,
  diff3: 221,
  diff4: 267,
  diff5: 333,
  diff6: 409,
};

const BASS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 135,
  diff2: 181,
  diff3: 228,
  diff4: 293,
  diff5: 364,
  diff6: 436,
};

const DRUMS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 124,
  diff2: 151,
  diff3: 178,
  diff4: 242,
  diff5: 245,
  diff6: 448,
};

const VOCALS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 132,
  diff2: 175,
  diff3: 218,
  diff4: 279,
  diff5: 353,
  diff6: 427,
};

const KEYS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 153,
  diff2: 211,
  diff3: 269,
  diff4: 327,
  diff5: 385,
  diff6: 443,
};

const PRO_KEYS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 153,
  diff2: 211,
  diff3: 269,
  diff4: 327,
  diff5: 385,
  diff6: 443,
};

const PRO_BASS_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 150,
  diff2: 208,
  diff3: 267,
  diff4: 325,
  diff5: 384,
  diff6: 442,
};

const PRO_GUITAR_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 150,
  diff2: 208,
  diff3: 267,
  diff4: 325,
  diff5: 384,
  diff6: 442,
};

const BAND_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  diff1: 165,
  diff2: 215,
  diff3: 243,
  diff4: 267,
  diff5: 292,
  diff6: 345,
};

const getGuitarDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, GUITAR_DIFFICULTY_THRESHOLDS);
};

const getBassDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, BASS_DIFFICULTY_THRESHOLDS);
};

const getDrumDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, DRUMS_DIFFICULTY_THRESHOLDS);
};

const getVocalsDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, VOCALS_DIFFICULTY_THRESHOLDS);
};

const getKeyDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, KEYS_DIFFICULTY_THRESHOLDS);
};

const getProKeyDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, PRO_KEYS_DIFFICULTY_THRESHOLDS);
};

const getProBassDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, PRO_BASS_DIFFICULTY_THRESHOLDS);
};

const getProGuitarDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, PRO_GUITAR_DIFFICULTY_THRESHOLDS);
};

const getBandDifficulty = (diffValue: number): string => {
  return convertDifficulty(diffValue, BAND_DIFFICULTY_THRESHOLDS);
};

/**
 * 0 = No Part
 * 1 = Warmup
 * 2 = Apprentice
 * 3 = Solid
 * 4 = Moderate
 * 5 = Challenging
 * 6 = Nightmare
 * 7 = Impossible
 */
const convertDifficulty = (
  diffValue: number,
  diffLimits: DifficultyThresholds,
): string => {
  if (diffValue > 0 && diffValue < diffLimits.diff1) {
    return "Warmup";
  }
  if (diffValue >= diffLimits.diff1 && diffValue < diffLimits.diff2) {
    return "Apprentice";
  }
  if (diffValue >= diffLimits.diff2 && diffValue < diffLimits.diff3) {
    return "Solid";
  }
  if (diffValue >= diffLimits.diff3 && diffValue < diffLimits.diff4) {
    return "Moderate";
  }
  if (diffValue >= diffLimits.diff4 && diffValue < diffLimits.diff5) {
    return "Challenging";
  }
  if (diffValue >= diffLimits.diff5 && diffValue < diffLimits.diff6) {
    return "Nightmare";
  }
  return diffValue >= diffLimits.diff6
    ? "Impossible"
    : DIFFICULTY_VALUE_NOT_SET;
};

export type InstrumentName =
  | "guitar"
  | "drum"
  | "bass"
  | "vocals"
  | "band"
  | "keys"
  | "real_keys"
  | "real_guitar"
  | "real_bass";

const convertInstrumentDifficulty = (
  songMetadata: Partial<SongRowCache>,
  instrumentName: InstrumentName,
  diffValue: number,
): void => {
  switch (instrumentName) {
    case "guitar":
      songMetadata.guitarDiff = getGuitarDifficulty(diffValue);
      break;
    case "drum":
      songMetadata.drumsDiff = getDrumDifficulty(diffValue);
      break;
    case "bass":
      songMetadata.bassDiff = getBassDifficulty(diffValue);
      break;
    case "vocals":
      songMetadata.vocalsDiff = getVocalsDifficulty(diffValue);
      break;
    case "band":
      songMetadata.bandDiff = getBandDifficulty(diffValue);
      break;
    case "keys":
      songMetadata.keysDiff = getKeyDifficulty(diffValue);
      break;
    case "real_keys":
      songMetadata.proKeysDiff = getProKeyDifficulty(diffValue);
      break;
    case "real_guitar":
      songMetadata.proGuitarDiff = getProGuitarDifficulty(diffValue);
      break;
    case "real_bass":
      songMetadata.proBassDiff = getProBassDifficulty(diffValue);
      break;
  }
};

const InstrumentDifficulty = {
  convertInstrumentDifficulty,
};

export default InstrumentDifficulty;
