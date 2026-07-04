import type { StudyFileNode } from './files';

export interface Workspace {
  name: string;
  directoryHandle: FileSystemDirectoryHandle;
  tree: StudyFileNode[];
}

export interface RecentFolder {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  lastOpenedAt: number;
}
