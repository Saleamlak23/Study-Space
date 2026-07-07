export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface LoadedNote {
  html: string;
  body: string;
  file?: File;
}
