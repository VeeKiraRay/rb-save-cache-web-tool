import type ResultMetadata from "./ResultMetadata";
import type SongRowCombined from "./SongRowCombined";

export default interface LoadResult {
  saveDataRows: SongRowCombined[];
  cacheDataRows: SongRowCombined[];
  meta: ResultMetadata;
}
