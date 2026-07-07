import { useCallback, useEffect, useState } from 'react';
import type { NoteFile } from '../types/notes';
import { buildNoteDocument, defaultNoteBody, readNoteFile } from '../services/noteHtml';
import { deleteNoteFile, getNoteHandle, listNoteFiles, normalizeNoteFileName } from '../services/noteFiles';
import { writeTextFile } from '../services/fileSystemAccess';
import { DEFAULT_NOTE_FILE } from '../utils/fileNames';
import { getErrorMessage } from '../utils/errors';

export function useNoteFiles(directoryHandle: FileSystemDirectoryHandle | null) {
  const [notes, setNotes] = useState<NoteFile[]>([]);
  const [activeNoteName, setActiveNoteName] = useState(DEFAULT_NOTE_FILE);
  const [error, setError] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    if (!directoryHandle) {
      setNotes([]);
      setActiveNoteName(DEFAULT_NOTE_FILE);
      return [];
    }

    try {
      setError(null);
      let nextNotes = await listNoteFiles(directoryHandle);
      if (!nextNotes.length) {
        const handle = await getNoteHandle(directoryHandle, DEFAULT_NOTE_FILE, true);
        await writeTextFile(handle, buildNoteDocument(defaultNoteBody()));
        nextNotes = await listNoteFiles(directoryHandle);
      }
      setNotes(nextNotes);
      setActiveNoteName((current) => nextNotes.some((note) => note.name === current) ? current : nextNotes[0]?.name || DEFAULT_NOTE_FILE);
      return nextNotes;
    } catch (notesError) {
      setError(getErrorMessage(notesError));
      return [];
    }
  }, [directoryHandle]);

  useEffect(() => {
    void refreshNotes();
  }, [refreshNotes]);

  const createNote = useCallback(async () => {
    if (!directoryHandle) return;
    const requested = window.prompt('New note name', 'New Note');
    if (requested === null) return;
    const fileName = await uniqueNoteName(directoryHandle, normalizeNoteFileName(requested));
    const handle = await getNoteHandle(directoryHandle, fileName, true);
    await writeTextFile(handle, buildNoteDocument(defaultNoteBody()));
    await refreshNotes();
    setActiveNoteName(fileName);
  }, [directoryHandle, refreshNotes]);

  const duplicateNote = useCallback(async (sourceName: string) => {
    if (!directoryHandle) return;
    const source = await getNoteHandle(directoryHandle, sourceName);
    const loaded = await readNoteFile(source);
    const fileName = await uniqueNoteName(directoryHandle, sourceName.replace(/\.html$/i, ' copy.html'));
    const target = await getNoteHandle(directoryHandle, fileName, true);
    await writeTextFile(target, buildNoteDocument(loaded.body));
    await refreshNotes();
    setActiveNoteName(fileName);
  }, [directoryHandle, refreshNotes]);

  const renameNote = useCallback(async (sourceName: string) => {
    if (!directoryHandle) return;
    const requested = window.prompt('Rename note', sourceName);
    if (requested === null) return;
    const fileName = normalizeNoteFileName(requested);
    if (fileName === sourceName) return;
    const source = await getNoteHandle(directoryHandle, sourceName);
    const loaded = await readNoteFile(source);
    const targetName = await uniqueNoteName(directoryHandle, fileName);
    const target = await getNoteHandle(directoryHandle, targetName, true);
    await writeTextFile(target, buildNoteDocument(loaded.body));
    await deleteNoteFile(directoryHandle, sourceName);
    await refreshNotes();
    setActiveNoteName(targetName);
  }, [directoryHandle, refreshNotes]);

  const deleteNote = useCallback(async (sourceName: string) => {
    if (!directoryHandle || notes.length <= 1) return;
    const confirmed = window.confirm(`Delete ${sourceName}? This removes the note file from the selected folder.`);
    if (!confirmed) return;
    await deleteNoteFile(directoryHandle, sourceName);
    const nextNotes = await refreshNotes();
    setActiveNoteName(nextNotes[0]?.name || DEFAULT_NOTE_FILE);
  }, [directoryHandle, notes.length, refreshNotes]);

  return {
    notes,
    activeNoteName,
    setActiveNoteName,
    createNote,
    duplicateNote,
    renameNote,
    deleteNote,
    refreshNotes,
    error,
  };
}

async function uniqueNoteName(directoryHandle: FileSystemDirectoryHandle, requestedName: string) {
  const normalized = normalizeNoteFileName(requestedName);
  const base = normalized.replace(/\.html$/i, '');
  let candidate = normalized;
  let index = 2;

  while (await noteExists(directoryHandle, candidate)) {
    candidate = `${base} ${index}.html`;
    index += 1;
  }

  return candidate;
}

async function noteExists(directoryHandle: FileSystemDirectoryHandle, fileName: string) {
  try {
    await directoryHandle.getFileHandle(fileName);
    return true;
  } catch {
    return false;
  }
}
