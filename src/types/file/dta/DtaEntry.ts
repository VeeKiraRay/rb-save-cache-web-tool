import type { DtaValue } from "./DtaValue";

export default interface DtaEntry {
  /** The identifier / shortname at the top of the block */
  id: string;
  /** All properties parsed into a key→value map */
  props: Record<string, DtaValue>;
  /** Metadata from trailing ;comments (if present) */
  meta?: Record<string, DtaValue>;
}
