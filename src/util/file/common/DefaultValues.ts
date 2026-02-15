import type SongRowCombined from "@/types/file/SongRowCombined";
import { DEFAULT_SONG_ROW_COMBINED } from "@/types/file/SongRowCombined";

const setDefaultValuesForSongRowCombined = <T>(
  obj: Partial<T>,
  defaults: T,
): T => {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (obj[key] !== undefined && obj[key] !== "") {
      result[key] = obj[key]!;
    }
  }
  return result;
};

const setDefaultValuesForAllSongRows = (songRows: SongRowCombined[]) => {
  return songRows.map((row) =>
    setDefaultValuesForSongRowCombined(row, DEFAULT_SONG_ROW_COMBINED),
  );
};

const DefaultValues = {
  setDefaultValuesForAllSongRows,
};

export default DefaultValues;
