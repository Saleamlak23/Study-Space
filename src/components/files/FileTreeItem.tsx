import { ChevronRight } from 'lucide-react';
import type { StudyFileNode } from '../../types/files';
import { FileTypeIcon } from './FileTypeIcon';

interface FileTreeItemProps {
  node: StudyFileNode;
  selectedPath?: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (node: StudyFileNode) => void;
}

export function FileTreeItem({ node, selectedPath, expanded, onToggle, onSelect }: FileTreeItemProps) {
  const isDirectory = node.kind === 'directory';
  const isExpanded = expanded.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <li>
      <button
        type="button"
        onClick={() => isDirectory ? onToggle(node.path) : onSelect(node)}
        className={`flex h-8 w-full items-center gap-2 rounded px-2 text-left text-sm transition ${
          isSelected
            ? 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            : 'text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        style={{ paddingLeft: `${8 + node.depth * 16}px` }}
      >
        {isDirectory ? (
          <ChevronRight size={14} className={`shrink-0 text-slate-400 transition ${isExpanded ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <FileTypeIcon node={node} expanded={isExpanded} />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
      </button>
      {isDirectory && isExpanded && node.children && (
        <ul>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              selectedPath={selectedPath}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
