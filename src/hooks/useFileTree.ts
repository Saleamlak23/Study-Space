import { useCallback, useState } from 'react';
import type { StudyFileNode } from '../types/files';
import { scanDirectory } from '../services/fileTreeScanner';
import { getErrorMessage } from '../utils/errors';

export function useFileTree() {
  const [tree, setTree] = useState<StudyFileNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const scan = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const nextTree = await scanDirectory(directoryHandle);
      setTree(nextTree);
      return nextTree;
    } catch (error) {
      setScanError(getErrorMessage(error));
      setTree([]);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { tree, isScanning, scanError, scan, setTree };
}
