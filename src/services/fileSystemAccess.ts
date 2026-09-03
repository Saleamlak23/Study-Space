import { DEFAULT_NOTE_FILE, isNoteFileName } from '../utils/fileNames';
import { verifyPermission } from './permissions';

export async function pickWorkspaceDirectory() {
  if (!window.showDirectoryPicker) {
    throw new Error('This browser does not support folder workspaces.');
  }

  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  const allowed = await verifyPermission(handle, 'readwrite');
  if (!allowed) throw new Error('StudyLens needs read and write access to this folder.');
  return handle;
}

export async function readFileHandle(handle: FileSystemFileHandle) {
  return handle.getFile();
}

export async function getOrCreateNoteHandle(directoryHandle: FileSystemDirectoryHandle, fileName = DEFAULT_NOTE_FILE) {
  return directoryHandle.getFileHandle(fileName, { create: true });
}

export async function getExistingNoteHandle(directoryHandle: FileSystemDirectoryHandle, fileName = DEFAULT_NOTE_FILE) {
  try {
    return await directoryHandle.getFileHandle(fileName);
  } catch {
    return null;
  }
}

export async function getNoteHandleByPath(
  directoryHandle: FileSystemDirectoryHandle,
  notePath: string,
  create = false,
): Promise<FileSystemFileHandle | null> {
  const segments = notePath.split('/').filter(Boolean);
  if (!segments.length) return null;

  let current: FileSystemDirectoryHandle = directoryHandle;
  for (let index = 0; index < segments.length - 1; index += 1) {
    current = await current.getDirectoryHandle(segments[index]);
  }

  const fileName = segments[segments.length - 1];
  if (!isNoteFileName(fileName)) {
    throw new Error('Only StudyLens note files can be opened in the editor.');
  }

  try {
    return await current.getFileHandle(fileName, create ? { create: true } : undefined);
  } catch {
    return null;
  }
}

export async function writeTextFile(handle: FileSystemFileHandle, content: string) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function noteFileExists(directoryHandle: FileSystemDirectoryHandle, notePath: string) {
  const handle = await getNoteHandleByPath(directoryHandle, notePath);
  return handle !== null;
}
