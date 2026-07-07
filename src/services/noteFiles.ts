import type { NoteFile } from '../types/notes';
import { DEFAULT_NOTE_FILE } from '../utils/fileNames';

export async function listNoteFiles(directoryHandle: FileSystemDirectoryHandle): Promise<NoteFile[]> {
  const notes: NoteFile[] = [];

  for await (const [, handle] of directoryHandle.entries()) {
    if (handle.kind !== 'file' || !isNoteFileName(handle.name)) continue;
    const file = await handle.getFile().catch(() => null);
    notes.push({
      name: handle.name,
      handle,
      lastModified: file?.lastModified,
      size: file?.size,
    });
  }

  return notes.sort((a, b) => {
    if (a.name === DEFAULT_NOTE_FILE) return -1;
    if (b.name === DEFAULT_NOTE_FILE) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export async function getNoteHandle(directoryHandle: FileSystemDirectoryHandle, fileName: string, create = false) {
  return directoryHandle.getFileHandle(normalizeNoteFileName(fileName), { create });
}

export async function deleteNoteFile(directoryHandle: FileSystemDirectoryHandle, fileName: string) {
  await directoryHandle.removeEntry(normalizeNoteFileName(fileName));
}

export function normalizeNoteFileName(input: string) {
  const trimmed = input.trim() || DEFAULT_NOTE_FILE;
  const withoutUnsafe = trimmed.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ');
  const withExtension = withoutUnsafe.toLowerCase().endsWith('.html') ? withoutUnsafe : `${withoutUnsafe}.html`;
  return withExtension || DEFAULT_NOTE_FILE;
}

export function isNoteFileName(name: string) {
  return name.toLowerCase().endsWith('.html');
}
