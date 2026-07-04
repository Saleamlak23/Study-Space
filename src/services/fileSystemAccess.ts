import { DEFAULT_NOTE_FILE } from '../utils/fileNames';
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

export async function getOrCreateNoteHandle(directoryHandle: FileSystemDirectoryHandle) {
  return directoryHandle.getFileHandle(DEFAULT_NOTE_FILE, { create: true });
}

export async function getExistingNoteHandle(directoryHandle: FileSystemDirectoryHandle) {
  try {
    return await directoryHandle.getFileHandle(DEFAULT_NOTE_FILE);
  } catch {
    return null;
  }
}

export async function writeTextFile(handle: FileSystemFileHandle, content: string) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}
