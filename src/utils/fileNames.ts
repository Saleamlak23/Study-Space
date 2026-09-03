export const DEFAULT_NOTE_FILE = 'note.html';
export const NOTE_SUFFIX = '.note.html';

export function pathJoin(parent: string, child: string) {
  return parent ? `${parent}/${child}` : child;
}

export function makeNodeId(path: string, kind: string) {
  return `${kind}:${path}`;
}

export function isNoteFileName(name: string) {
  const lower = name.toLowerCase();
  return lower === DEFAULT_NOTE_FILE || lower.endsWith(NOTE_SUFFIX);
}

export function suggestNoteFileName(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug ? `${slug}${NOTE_SUFFIX}` : `untitled${NOTE_SUFFIX}`;
}
