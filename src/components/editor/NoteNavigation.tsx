import { FilePlus, NotebookPen } from 'lucide-react';
import type { NoteFileEntry } from '../../types/notes';
import { Button } from '../common/Button';

interface NoteNavigationProps {
  notes: NoteFileEntry[];
  activeNotePath: string | null;
  onSelect: (path: string) => void;
  onCreate: () => void;
}

export function NoteNavigation({ notes, activeNotePath, onSelect, onCreate }: NoteNavigationProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <NotebookPen size={16} className="shrink-0 text-slate-500" />
      <select
        value={activeNotePath || ''}
        onChange={(event) => onSelect(event.target.value)}
        className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
        aria-label="Select note"
      >
        {!notes.length && <option value="">No notes yet</option>}
        {notes.map((note) => (
          <option key={note.path} value={note.path}>
            {note.title} ({note.name})
          </option>
        ))}
      </select>
      <Button variant="ghost" onClick={onCreate} icon={<FilePlus size={16} />} aria-label="Create note">
        New
      </Button>
    </div>
  );
}
