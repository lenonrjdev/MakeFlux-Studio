interface FileSystemDirectoryHandle {
  readonly name: string;
}

interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  __TAURI_INTERNALS__?: unknown;
}
