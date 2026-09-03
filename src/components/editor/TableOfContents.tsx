import { useMemo } from 'react';
import { ListTree } from 'lucide-react';
import type { TocEntry } from '../../types/notes';
import { extractTableOfContents } from '../../services/noteHtml';

interface TableOfContentsProps {
  content: string;
  onNavigate: (headingId: string) => void;
}

export function TableOfContents({ content, onNavigate }: TableOfContentsProps) {
  const entries = useMemo(() => extractTableOfContents(content), [content]);

  if (!entries.length) {
    return (
      <div className="px-3 py-4 text-xs text-slate-500">
        Add headings to generate a table of contents.
      </div>
    );
  }

  return (
    <nav aria-label="Table of contents" className="min-h-0 flex-1 overflow-auto px-2 py-3">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        <ListTree size={14} /> Contents
      </div>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <TocItem entry={entry} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TocItem({ entry, onNavigate }: { entry: TocEntry; onNavigate: (headingId: string) => void }) {
  const indent = entry.level === 1 ? 'pl-1' : entry.level === 2 ? 'pl-4' : 'pl-7';

  return (
    <button
      type="button"
      onClick={() => onNavigate(entry.id)}
      className={`block w-full truncate rounded px-2 py-1.5 text-left text-xs text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${indent}`}
      title={entry.text}
    >
      {entry.text}
    </button>
  );
}
