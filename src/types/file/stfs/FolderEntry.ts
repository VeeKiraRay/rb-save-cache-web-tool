import type ItemEntryData from "./ItemEntryData";

export default interface FolderEntry extends ItemEntryData {
  isFolder: true;
}
