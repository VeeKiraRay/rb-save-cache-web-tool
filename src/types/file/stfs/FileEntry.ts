import type ItemEntryData from "./ItemEntryData";

/** A file inside the STFS package */
export default interface FileEntry extends ItemEntryData {
  isFolder: false;
}
