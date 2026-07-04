export type FileCategory = 'document' | 'image' | 'text' | 'media' | 'note' | 'unsupported';

export interface StudyFileNode {
  id: string;
  name: string;
  path: string;
  depth: number;
  kind: 'file' | 'directory';
  extension: string;
  category: FileCategory;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: StudyFileNode[];
  size?: number;
  lastModified?: number;
  error?: string;
}

export interface FlatFileNode extends StudyFileNode {
  children?: StudyFileNode[];
}
