import type { TocItem } from '../../types/notes';

interface TableOfContentsProps {
  items: TocItem[];
  onJump: (id: string) => void;
}

export function TableOfContents({ items, onJump }: TableOfContentsProps) {
  return (
    <aside className="border-b border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contents</p>
      {items.length ? (
        <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onJump(item.id)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              <span className={item.level === 1 ? 'font-semibold' : ''}>{item.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Headings will appear here.</p>
      )}
    </aside>
  );
}
