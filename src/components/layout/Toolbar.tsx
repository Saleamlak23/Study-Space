import { FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface ToolbarProps {
  workspaceName?: string;
  onPickFolder: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function Toolbar({ workspaceName, onPickFolder, onRefresh, isRefreshing }: ToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <img src="/src/assets/logo.svg" alt="Logo" className="h-6 w-6" />
        <h1 className="text-base font-semibold text-slate-950">StudyLens</h1>
      </div>
      <div className="flex items-center gap-2">
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
