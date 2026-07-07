import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveState } from '../types/notes';
import { writeTextFile } from '../services/fileSystemAccess';
import { buildNoteDocument, defaultNoteBody, readNoteFile } from '../services/noteHtml';
import { getNoteHandle } from '../services/noteFiles';
import { sanitizeHtml } from '../services/sanitization';
import { getErrorMessage } from '../utils/errors';
import { DEFAULT_NOTE_FILE } from '../utils/fileNames';

export function useNoteDocument(directoryHandle: FileSystemDirectoryHandle | null, noteFileName = DEFAULT_NOTE_FILE) {
  const [content, setContent] = useState(defaultNoteBody());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const noteHandleRef = useRef<FileSystemFileHandle | null>(null);
  const latestContentRef = useRef(content);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  useEffect(() => {
    let cancelled = false;
    initializedRef.current = false;
    noteHandleRef.current = null;
    setError(null);
    setSaveState('idle');

    async function load() {
      if (!directoryHandle) {
        setContent(defaultNoteBody());
        return;
      }

      try {
        const handle = await getNoteHandle(directoryHandle, noteFileName, true);
        noteHandleRef.current = handle;
        const loaded = await readNoteFile(handle);
        if (!cancelled) {
          setContent(loaded.body);
          setLoadedAt(loaded.file?.lastModified || Date.now());
          setSaveState('saved');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
          setContent(defaultNoteBody());
          setSaveState('error');
        }
      } finally {
        initializedRef.current = true;
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [directoryHandle, noteFileName]);

  const updateContent = useCallback((nextContent: string) => {
    setContent(sanitizeHtml(nextContent));
    if (initializedRef.current) setSaveState('dirty');
  }, []);

  const saveNow = useCallback(async () => {
    if (!directoryHandle || saveState === 'saving') return;
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    setSaveState('saving');
    setError(null);

    try {
      const handle = noteHandleRef.current || await getNoteHandle(directoryHandle, noteFileName, true);
      noteHandleRef.current = handle;
      const loadedTimestamp = loadedAt;
      let latestFile: File | null = null;
      if (loadedTimestamp !== null) {
        latestFile = await handle.getFile().catch(() => null);
      }
      if (latestFile && loadedTimestamp !== null && latestFile.lastModified > loadedTimestamp + 1000) {
        throw new Error(`${noteFileName} changed outside StudyLens. Reload the workspace before saving to avoid overwriting newer changes.`);
      }
      await writeTextFile(handle, buildNoteDocument(latestContentRef.current));
      const file = await handle.getFile();
      setLoadedAt(file.lastModified);
      setSaveState('saved');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      setSaveState('error');
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        setSaveState('dirty');
      }
    }
  }, [directoryHandle, loadedAt, noteFileName, saveState]);

  return { content, updateContent, saveNow, saveState, error };
}
