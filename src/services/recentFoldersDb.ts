import { openDB, type DBSchema } from 'idb';
import type { RecentFolder } from '../types/workspace';

interface StudyLensDb extends DBSchema {
  recentFolders: {
    key: string;
    value: RecentFolder;
    indexes: { 'by-last-opened': number };
  };
}

const DB_NAME = 'studylens';
const DB_VERSION = 1;

async function getDb() {
  return openDB<StudyLensDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('recentFolders', { keyPath: 'id' });
      store.createIndex('by-last-opened', 'lastOpenedAt');
    },
  });
}

export async function listRecentFolders() {
  const db = await getDb();
  const folders = await db.getAllFromIndex('recentFolders', 'by-last-opened');
  return folders.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export async function saveRecentFolder(handle: FileSystemDirectoryHandle) {
  const db = await getDb();
  const existing = await db.getAll('recentFolders');
  const matched = await findMatchingFolder(existing, handle);
  const record: RecentFolder = {
    id: matched?.id || crypto.randomUUID(),
    name: handle.name,
    handle,
    lastOpenedAt: Date.now(),
  };
  await db.put('recentFolders', record);
  return record;
}

export async function removeRecentFolder(id: string) {
  const db = await getDb();
  await db.delete('recentFolders', id);
}

async function findMatchingFolder(folders: RecentFolder[], handle: FileSystemDirectoryHandle) {
  for (const folder of folders) {
    if (await folder.handle.isSameEntry(handle)) return folder;
  }
  return null;
}
