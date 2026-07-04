import { useMemo, useState } from 'react';
import type { FileCategory, StudyFileNode } from '../../types/files';
import { FileFilter } from './FileFilter';
import { FileTreeItem } from './FileTreeItem';
import { Spinner } from '../common/Spinner';

interface FileTreeProps {
  tree: StudyFileNode[];
  selectedPath?: string;
  isScanning: boolean;
  onSelect: (node: StudyFileNode) => void;
}

export function FileTree({ tree, selectedPath, isScanning, onSelect }: FileTreeProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FileCategory | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredTree = useMemo(() => filterNodes(tree, query, category), [tree, query, category]);

  function toggle(path: string) {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpanded(next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FileFilter query={query} category={category} onQueryChange={setQuery} onCategoryChange={setCategory} />
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs text-slate-500">
        <span>Workspace files</span>
        {isScanning && <Spinner />}
      </div>
      <nav className="min-h-0 flex-1 overflow-auto p-2">
        {filteredTree.length ? (
          <ul className="space-y-0.5">
            {filteredTree.map((node) => (
              <FileTreeItem
                key={node.id}
                node={node}
                selectedPath={selectedPath}
                expanded={expanded}
                onToggle={toggle}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : (
          <p className="p-3 text-sm text-slate-500">No files match the current filter.</p>
        )}
      </nav>
    </div>
  );
}

function filterNodes(nodes: StudyFileNode[], query: string, category: FileCategory | 'all'): StudyFileNode[] {
  const normalizedQuery = query.trim().toLowerCase();

  return nodes.flatMap((node) => {
    const childMatches = node.children ? filterNodes(node.children, query, category) : [];
    const nameMatches = !normalizedQuery || node.name.toLowerCase().includes(normalizedQuery);
    const categoryMatches = category === 'all' || node.category === category || node.kind === 'directory';
    const ownMatch = nameMatches && categoryMatches;

    if (node.kind === 'directory') {
      if (ownMatch || childMatches.length) return [{ ...node, children: childMatches.length ? childMatches : node.children }];
      return [];
    }

    return ownMatch ? [node] : [];
  });
}
