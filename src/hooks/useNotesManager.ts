import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NoteFileEntry, NoteMetadata, SaveState } from '../types/notes';
import type { StudyFileNode } from '../types/files';
import {
  getNoteHandleByPath,
  getOrCreateNoteHandle,
  writeTextFile,
} from '../services/fileSystemAccess';
import { collectNoteFiles, enrichNoteTitles } from '../services/noteDiscovery';
import { buildNoteDocument, defaultNoteBody, readNoteFile } from '../services/noteHtml';
import { sanitizeHtml } from '../services/sanitization';
import { DEFAULT_NOTE_FILE, isNoteFileName, suggestNoteFileName } from '../utils/fileNames';
import { getErrorMessage } from '../utils/errors';

interface UseNotesManagerOptions {
  directoryHandle: FileSystemDirectoryHandle | null;
  tree: StudyFileNode[];
  activeNotePath: string | null;
  onActiveNotePathChange: (path: string) => void;
  onTreeRefresh?: () => void;
}

export function useNotesManager({
  directoryHandle,
  tree,
  activeNotePath,
  onActiveNotePathChange,
  onTreeRefresh,
}: UseNotesManagerOptions) {
  const [content, setContent] = useState(defaultNoteBody());
  const [metadata, setMetadata] = useState<NoteMetadata>({ version: 2 });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [noteTitles, setNoteTitles] = useState<Record<string, string>>({});

  const noteHandleRef = useRef<FileSystemFileHandle | null>(null);
  const latestContentRef = useRef(content);
  const latestMetadataRef = useRef(metadata);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const initializedRef = useRef(false);

  const discoveredNotes = useMemo(() => collectNoteFiles(tree), [tree]);

  const notes: NoteFileEntry[] = useMemo(() => {
    return discoveredNotes.map((note) => ({
      ...note,
      title: noteTitles[note.path] || note.title,
    }));
  }, [discoveredNotes, noteTitles]);

  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  useEffect(() => {
    latestMetadataRef.current = metadata;
  }, [metadata]);

  useEffect(() => {
    if (!directoryHandle || !discoveredNotes.length) return;
    let cancelled = false;

    void enrichNoteTitles(discoveredNotes, async (path) => {
      return getNoteHandleByPath(directoryHandle, path);
    }).then((enriched) => {
      if (cancelled) return;
      setNoteTitles(Object.fromEntries(enriched.map((note) => [note.path, note.title])));
    });

    return () => {
      cancelled = true;
    };
  }, [directoryHandle, discoveredNotes]);

  useEffect(() => {
    if (!directoryHandle) {
      setContent(defaultNoteBody());
      setMetadata({ version: 2 });
      setSaveState('idle');
      setError(null);
      noteHandleRef.current = null;
      initializedRef.current = false;
      return;
    }

    if (!activeNotePath) {
      const preferred = discoveredNotes.find((note) => note.name === DEFAULT_NOTE_FILE)?.path
        || discoveredNotes[0]?.path
        || DEFAULT_NOTE_FILE;
      onActiveNotePathChange(preferred);
    }
  }, [directoryHandle, activeNotePath, discoveredNotes, onActiveNotePathChange]);

  useEffect(() => {
    let cancelled = false;
    initializedRef.current = false;
    noteHandleRef.current = null;
    setError(null);
    setSaveState('idle');

    async function load() {
      if (!directoryHandle || !activeNotePath) {
        setContent(defaultNoteBody());
        setMetadata({ version: 2 });
        return;
      }

      try {
        const handle = await getNoteHandleByPath(directoryHandle, activeNotePath);
        noteHandleRef.current = handle;
        if (handle) {
          const loaded = await readNoteFile(handle);
          if (!cancelled) {
            setContent(loaded.body);
            setMetadata(loaded.metadata);
            setLoadedAt(loaded.file?.lastModified || Date.now());
            setSaveState('saved');
          }
        } else if (!cancelled) {
          setContent(defaultNoteBody());
          setMetadata({ version: 2, title: noteTitles[activeNotePath] });
          setLoadedAt(null);
          setSaveState('idle');
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
  }, [directoryHandle, activeNotePath, noteTitles]);

  const updateContent = useCallback((nextContent: string) => {
    setContent(sanitizeHtml(nextContent));
    if (initializedRef.current) setSaveState('dirty');
  }, []);

  const insertHtml = useCallback((fragment: string) => {
    const safe = sanitizeHtml(fragment);
    setContent((current) => {
      const trimmed = current.replace(/<p><\/p>\s*$/, '');
      const block = trimmed.endsWith('</p>') || trimmed.endsWith('</h1>') || trimmed.endsWith('</h2>') || trimmed.endsWith('</h3>')
        ? `${trimmed}${safe}`
        : `${trimmed}<p></p>${safe}`;
      return sanitizeHtml(block);
    });
    if (initializedRef.current) setSaveState('dirty');
  }, []);

  const saveNow = useCallback(async () => {
    if (!directoryHandle || !activeNotePath || saveState === 'saving') return;
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    setSaveState('saving');
    setError(null);

    try {
      const handle = noteHandleRef.current || await getNoteHandleByPath(directoryHandle, activeNotePath, true)
        || await getOrCreateNoteHandle(directoryHandle, activeNotePath.split('/').pop() || DEFAULT_NOTE_FILE);
      noteHandleRef.current = handle;

      const loadedTimestamp = loadedAt;
      let latestFile: File | null = null;
      if (loadedTimestamp !== null) {
        latestFile = await handle.getFile().catch(() => null);
      }
      if (latestFile && loadedTimestamp !== null && latestFile.lastModified > loadedTimestamp + 1000) {
        throw new Error('This note changed outside StudyLens. Reload the workspace before saving to avoid overwriting newer changes.');
      }

      const nextMetadata: NoteMetadata = {
        ...latestMetadataRef.current,
        title: latestMetadataRef.current.title || noteTitles[activeNotePath],
        version: 2,
      };

      await writeTextFile(handle, buildNoteDocument(latestContentRef.current, nextMetadata));
      const file = await handle.getFile();
      setLoadedAt(file.lastModified);
      setMetadata(nextMetadata);
      setSaveState('saved');
      onTreeRefresh?.();
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
  }, [directoryHandle, activeNotePath, loadedAt, saveState, noteTitles, onTreeRefresh]);

  const createNote = useCallback(async (title: string) => {
    if (!directoryHandle) return null;

    const fileName = suggestNoteFileName(title);
    if (!isNoteFileName(fileName)) {
      throw new Error('Invalid note file name.');
    }

    const handle = await getOrCreateNoteHandle(directoryHandle, fileName);
    const noteMetadata: NoteMetadata = {
      version: 2,
      title: title.trim() || 'Untitled Note',
      created: new Date().toISOString(),
    };
    const body = `<h1>${noteMetadata.title}</h1><p></p>`;
    await writeTextFile(handle, buildNoteDocument(body, noteMetadata));

    const path = fileName;
    setNoteTitles((current) => ({ ...current, [path]: noteMetadata.title || 'Untitled Note' }));
    onTreeRefresh?.();
    onActiveNotePathChange(path);
    return path;
  }, [directoryHandle, onActiveNotePathChange, onTreeRefresh]);

  return {
    notes,
    activeNotePath,
    content,
    metadata,
    updateContent,
    insertHtml,
    saveNow,
    saveState,
    error,
    createNote,
  };
}
