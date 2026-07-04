import { Search } from 'lucide-react';
import type { FileCategory } from '../../types/files';

const filters: Array<FileCategory | 'all'> = ['all', 'document', 'image', 'text', 'media', 'note', 'unsupported'];

interface FileFilterProps {
  query: string;
  category: FileCategory | 'all';
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: FileCategory | 'all') => void;
}

export function FileFilter({ query, category, onQueryChange, onCategoryChange }: FileFilterProps) {
  return (
    <div className="space-y-3 border-b border-slate-200 p-3">
      <label className="relative block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Filter files"
          className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-lake focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value as FileCategory | 'all')}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-lake focus:ring-2 focus:ring-blue-100"
      >
        {filters.map((filter) => (
          <option key={filter} value={filter}>
            {filter === 'all' ? 'All files' : filter[0].toUpperCase() + filter.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
