import type { StudyFileNode } from '../types/files';
import { getErrorMessage } from '../utils/errors';
import { makeNodeId, pathJoin } from '../utils/fileNames';
import { categoryFromName, extensionFromName } from '../utils/mimeTypes';

const MAX_INITIAL_DEPTH = 8;

export async function scanDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  parentPath = '',
  depth = 0,
): Promise<StudyFileNode[]> {
  const nodes: StudyFileNode[] = [];

  try {
    for await (const [, handle] of directoryHandle.entries()) {
      if (shouldSkip(handle.name)) continue;

      const path = pathJoin(parentPath, handle.name);
      const extension = extensionFromName(handle.name);
      const baseNode = {
        id: makeNodeId(path, handle.kind),
        name: handle.name,
        path,
        depth,
        kind: handle.kind,
        extension,
        category: handle.kind === 'file' ? categoryFromName(handle.name) : 'unsupported',
        handle,
      } satisfies StudyFileNode;

      if (handle.kind === 'directory') {
        const directoryNode: StudyFileNode = { ...baseNode, children: [] };
        if (depth < MAX_INITIAL_DEPTH) {
          directoryNode.children = await scanDirectory(handle, path, depth + 1);
        }
        nodes.push(directoryNode);
      } else {
        try {
          const file = await handle.getFile();
          nodes.push({
            ...baseNode,
            size: file.size,
            lastModified: file.lastModified,
          });
        } catch (error) {
          nodes.push({
            ...baseNode,
            error: getErrorMessage(error),
          });
        }
      }

      if (nodes.length % 25 === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    }
  } catch (error) {
    nodes.push({
      id: makeNodeId(parentPath || directoryHandle.name, 'directory-error'),
      name: parentPath || directoryHandle.name,
      path: parentPath,
      depth,
      kind: 'directory',
      extension: '',
      category: 'unsupported',
      handle: directoryHandle,
      error: getErrorMessage(error),
      children: [],
    });
  }

  return nodes.sort(sortNodes);
}

function shouldSkip(name: string) {
  return name === 'node_modules' || name === '.git' || name === '.DS_Store';
}

function sortNodes(a: StudyFileNode, b: StudyFileNode) {
  if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}
