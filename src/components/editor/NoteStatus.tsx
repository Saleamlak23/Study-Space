import type { SaveState } from '../../types/notes';

const labels: Record<SaveState, string> = {
  idle: 'Ready',
  dirty: 'Unsaved changes',
  saving: 'Saving',
  saved: 'Saved',
  error: 'Save failed',
};

export function NoteStatus({ state, error }: { state: SaveState; error?: string | null }) {
  return (
    <div className="min-w-0 text-right">
      <p className={`text-xs font-medium ${state === 'error' ? 'text-red-700' : 'text-slate-600'}`}>{labels[state]}</p>
      {error && <p className="max-w-64 truncate text-xs text-red-600">{error}</p>}
    </div>
  );
}
