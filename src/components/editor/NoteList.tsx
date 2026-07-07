import { Copy, Edit3, FilePlus2, NotebookText, Trash2 } from 'lucide-react';
import type { NoteFile } from '../../types/notes';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

interface NoteListProps {
  notes: NoteFile[];
  activeNoteName: string;
  onSelect: (name: string) => void;
  onCreate: () => void;
  onRename: (name: string) => void;
  onDuplicate: (name: string) => void;
  onDelete: (name: string) => void;
}

export function NoteList({ notes, activeNoteName, onSelect, onCreate, onRename, onDuplicate, onDelete }: NoteListProps) {
  return (
    <section className="border-b border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          <NotebookText size={14} /> Notes
        </div>
        <Tooltip label="New note">
          <Button variant="ghost" onClick={onCreate} icon={<FilePlus2 size={15} />} aria-label="New note" />
        </Tooltip>
      </div>
      <ul className="max-h-48 space-y-1 overflow-auto">
        {notes.map((note) => {
          const active = note.name === activeNoteName;
          return (
            <li key={note.name} className={`group flex items-center gap-1 rounded-md p-1 ${active ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
              <button type="button" onClick={() => onSelect(note.name)} className="min-w-0 flex-1 px-2 py-1 text-left">
                <p className={`truncate text-sm font-medium ${active ? 'text-blue-800' : 'text-slate-700'}`}>{note.name}</p>
              </button>
              <Tooltip label="Rename">
                <Button variant="ghost" onClick={() => onRename(note.name)} icon={<Edit3 size={14} />} aria-label="Rename note" className="opacity-70 group-hover:opacity-100" />
              </Tooltip>
              <Tooltip label="Duplicate">
                <Button variant="ghost" onClick={() => onDuplicate(note.name)} icon={<Copy size={14} />} aria-label="Duplicate note" className="opacity-70 group-hover:opacity-100" />
              </Tooltip>
              <Tooltip label="Delete">
                <Button variant="ghost" onClick={() => onDelete(note.name)} icon={<Trash2 size={14} />} aria-label="Delete note" className="opacity-70 group-hover:opacity-100" />
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
