import type { StudyFileNode } from '../types/files';
import type { NoteFileEntry } from '../types/notes';
import { isNoteFileName } from '../utils/fileNames';
import { extractNoteMetadata } from './noteHtml';

export function collectNoteFiles(tree: StudyFileNode[]): NoteFileEntry[] {
  const notes: NoteFileEntry[] = [];

  function walk(nodes: StudyFileNode[]) {
    for (const node of nodes) {
      if (node.kind === 'directory') {
        node.children && walk(node.children);
        continue;
      }
      if (isNoteFileName(node.name)) {
        notes.push({
          path: node.path,
          name: node.name,
          title: titleFromNoteName(node.name),
        });
      }
    }
  }

  walk(tree);
  return notes.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export async function enrichNoteTitles(
  notes: NoteFileEntry[],
  getHandle: (path: string) => Promise<FileSystemFileHandle | null>,
): Promise<NoteFileEntry[]> {
  const enriched = await Promise.all(
    notes.map(async (note) => {
      try {
        const handle = await getHandle(note.path);
        if (!handle) return note;
        const file = await handle.getFile();
        const html = await file.text();
        const metadata = extractNoteMetadata(html);
        return {
          ...note,
          title: metadata.title || titleFromNoteName(note.name),
        };
      } catch {
        return note;
      }
    }),
  );
  return enriched;
}

function titleFromNoteName(name: string) {
  if (name.toLowerCase() === 'note.html') return 'Main Notes';
  return name
    .replace(/\.note\.html$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function findNodeByPath(tree: StudyFileNode[], path: string): StudyFileNode | null {
  for (const node of tree) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
