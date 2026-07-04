import { useEffect, useState } from 'react';
import type { StudyFileNode } from '../types/files';
import { createPreviewData, type PreviewData } from '../services/previewUrl';
import { getErrorMessage } from '../utils/errors';

export function useFilePreview(selectedNode: StudyFileNode | null) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;

    async function loadPreview() {
      setPreview(null);
      setError(null);

      if (!selectedNode || selectedNode.kind !== 'file') return;

      setIsLoading(true);
      try {
        const file = await (selectedNode.handle as FileSystemFileHandle).getFile();
        const data = await createPreviewData(file, selectedNode.category, selectedNode.extension);
        objectUrl = data.url;
        if (!cancelled) setPreview(data);
      } catch (previewError) {
        if (!cancelled) setError(getErrorMessage(previewError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedNode]);

  return { preview, isLoading, error };
}
