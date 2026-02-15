import type { RowData } from "@tanstack/react-table";
import type SongRowCombined from "./file/SongRowCombined";

export type Groups =
  | "General"
  | "Song information"
  | "Drums"
  | "Bass"
  | "Guitar"
  | "Vocals"
  | "Keys"
  | "Band"
  | "Harmonies"
  | "Pro Drums"
  | "Pro Guitar"
  | "Pro Bass"
  | "Pro Keys"
  | "Technical";

type Render = "stars" | "difficulty" | "percent" | "rowCount";

export default interface ColumnDefinition {
  key: keyof SongRowCombined | "rowNumber";
  label: string;
  group: Groups;
  size: number;
  isFiltrable?: boolean;
  render?: Render;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    group: Groups;
    render?: Render;
    isFiltrable?: boolean;
  }
}
