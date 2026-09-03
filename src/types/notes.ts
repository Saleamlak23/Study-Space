export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface NoteMetadata {
  title?: string;
  created?: string;
  updated?: string;
  version: number;
}

export interface LoadedNote {
  html: string;
  body: string;
  metadata: NoteMetadata;
  file?: File;
}

export interface NoteFileEntry {
  path: string;
  name: string;
  title: string;
}

export interface TocEntry {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}
