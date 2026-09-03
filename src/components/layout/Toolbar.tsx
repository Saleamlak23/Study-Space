import { FolderOpen, Moon, RefreshCw, Sun } from 'lucide-react';
import { Button } from '../common/Button';

interface ToolbarProps {
  workspaceName?: string;
  onPickFolder: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Toolbar({ workspaceName, onPickFolder, onRefresh, isRefreshing, isDarkMode, onToggleTheme }: ToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <img src="/src/assets/logo.svg" alt="Logo" className="h-6 w-6" />
        <h1 className="text-base font-semibold text-slate-950">StudyLens</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {workspaceName && (
          <Button onClick={onRefresh} icon={<RefreshCw size={16} />} disabled={isRefreshing}>
            Refresh
          </Button>
        )}
        <Button onClick={onPickFolder} icon={<FolderOpen size={16} />} variant="primary">
          Open folder
        </Button>
      </div>
    </header>
  );
}
