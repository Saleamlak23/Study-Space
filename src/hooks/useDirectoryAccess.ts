import { useCallback, useState } from 'react';
import { pickWorkspaceDirectory } from '../services/fileSystemAccess';
import { verifyPermission } from '../services/permissions';
import type { RecentFolder, Workspace } from '../types/workspace';
import type { StudyFileNode } from '../types/files';
import { getErrorMessage } from '../utils/errors';

export function useDirectoryAccess(
  scan: (directoryHandle: FileSystemDirectoryHandle) => Promise<StudyFileNode[]>,
  remember: (handle: FileSystemDirectoryHandle) => Promise<void>,
) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const openHandle = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    setAccessError(null);
    try {
      const allowed = await verifyPermission(directoryHandle, 'readwrite');
      if (!allowed) throw new Error('Folder permission was not granted.');
      const tree = await scan(directoryHandle);
      setWorkspace({ name: directoryHandle.name, directoryHandle, tree });
      await remember(directoryHandle);
      return directoryHandle;
    } catch (error) {
      setAccessError(getErrorMessage(error));
      throw error;
    }
  }, [remember, scan]);

  const pickFolder = useCallback(async () => {
    setAccessError(null);
    try {
      const handle = await pickWorkspaceDirectory();
      await openHandle(handle);
    } catch (error) {
      setAccessError(getErrorMessage(error));
    }
  }, [openHandle]);

  const openRecent = useCallback(async (folder: RecentFolder) => {
    await openHandle(folder.handle);
  }, [openHandle]);

  return { workspace, setWorkspace, accessError, pickFolder, openRecent, openHandle };
}
