export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface LoadedNote {
  html: string;
  body: string;
  file?: File;
}

export interface NoteFile {
  name: string;
  handle: FileSystemFileHandle;
  lastModified?: number;
  size?: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}
