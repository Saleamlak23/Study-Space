export const DEFAULT_NOTE_FILE = 'note.html';

export function pathJoin(parent: string, child: string) {
  return parent ? `${parent}/${child}` : child;
}

export function makeNodeId(path: string, kind: string) {
  return `${kind}:${path}`;
}
