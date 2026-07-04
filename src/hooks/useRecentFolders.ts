import { useCallback, useEffect, useState } from 'react';
import type { RecentFolder } from '../types/workspace';
import { listRecentFolders, removeRecentFolder, saveRecentFolder } from '../services/recentFoldersDb';

export function useRecentFolders() {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setRecentFolders(await listRecentFolders());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remember = useCallback(async (handle: FileSystemDirectoryHandle) => {
    await saveRecentFolder(handle);
    await refresh();
  }, [refresh]);

  const forget = useCallback(async (id: string) => {
    await removeRecentFolder(id);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recentFolders, isLoading, refresh, remember, forget };
}
