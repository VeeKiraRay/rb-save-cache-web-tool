interface FileSystemDirectoryHandle {
  readonly kind: "directory";
  readonly name: string;
}

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}
