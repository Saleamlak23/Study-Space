import { useCallback, useMemo, useState } from 'react';
import { Clock, FolderOpen, Trash2, Upload } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/layout/EmptyState';
import { Sidebar } from '../components/layout/Sidebar';
import { SplitPane } from '../components/layout/SplitPane';
import { Toolbar } from '../components/layout/Toolbar';
import { FileTree } from '../components/files/FileTree';
import { FilePreview } from '../components/preview/FilePreview';
import { NoteEditor } from '../components/editor/NoteEditor';
import { useDirectoryAccess } from '../hooks/useDirectoryAccess';
import { useFilePreview } from '../hooks/useFilePreview';
import { useFileTree } from '../hooks/useFileTree';
import { useNotesManager } from '../hooks/useNotesManager';
import { useRecentFolders } from '../hooks/useRecentFolders';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { supportsDirectoryPicker } from '../services/permissions';
import { DEFAULT_NOTE_FILE } from '../utils/fileNames';
import { buildClipHtml } from '../utils/clipToNote';
import type { StudyFileNode } from '../types/files';
import type { RecentFolder } from '../types/workspace';

export function AppShell() {
  const { recentFolders, isLoading: recentLoading, remember, forget } = useRecentFolders();
  const { tree, isScanning, scanError, scan } = useFileTree();
  const { workspace, accessError, pickFolder, openRecent } = useDirectoryAccess(scan, remember);
  const [selectedNode, setSelectedNode] = useState<StudyFileNode | null>(null);
  const [activeNotePath, setActiveNotePath] = useState<string | null>(DEFAULT_NOTE_FILE);
  const [droppedFiles, setDroppedFiles] = useState<StudyFileNode[]>([]);
  const directoryHandle = workspace?.directoryHandle || null;

  const refreshWorkspace = useCallback(async () => {
    if (!workspace) return;
    await scan(workspace.directoryHandle);
  }, [scan, workspace]);

  const notes = useNotesManager({
    directoryHandle,
    tree,
    activeNotePath,
    onActiveNotePathChange: setActiveNotePath,
    onTreeRefresh: () => void refreshWorkspace(),
  });

  const preview = useFilePreview(selectedNode);
  const canUseFolderPicker = supportsDirectoryPicker();

  useDebouncedSave(() => {
    if (notes.saveState === 'dirty') void notes.saveNow();
  }, 900, [notes.saveState, notes.content]);

  const currentTree = canUseFolderPicker ? tree : droppedFiles;
  const selectedPath = selectedNode?.path;
  const sidebarTitle = workspace?.name || (canUseFolderPicker ? 'No folder open' : 'Drop files to preview');

  const recentList = useMemo(() => recentFolders.slice(0, 8), [recentFolders]);

  const handleClipToNote = useCallback(
    (text: string, sourceName?: string) => {
      notes.insertHtml(buildClipHtml(text, sourceName));
    },
    [notes],
  );

  const handleFileSelect = useCallback((node: StudyFileNode) => {
    setSelectedNode(node);
    if (node.category === 'note') {
      setActiveNotePath(node.path);
    }
  }, []);

  async function handleOpenRecent(folder: RecentFolder) {
    try {
      await openRecent(folder);
      setSelectedNode(null);
      setActiveNotePath(DEFAULT_NOTE_FILE);
    } catch {
      return;
    }
  }

  async function handleCreateNote() {
    const title = window.prompt('Note title', 'New Study Note');
    if (!title?.trim()) return;
    try {
      await notes.createNote(title.trim());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not create note.');
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (canUseFolderPicker) return;

    const files = Array.from(event.dataTransfer.files);
    const nodes = files.map((file) => {
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
      return {
        id: `drop:${file.name}:${file.lastModified}`,
        name: file.name,
        path: file.name,
        depth: 0,
        kind: 'file' as const,
        extension,
        category: file.type.startsWith('image/')
          ? 'image' as const
          : file.type.startsWith('video/') || file.type.startsWith('audio/')
            ? 'media' as const
            : file.type === 'application/pdf'
              ? 'document' as const
              : file.type.startsWith('text/') || ['txt', 'md', 'csv', 'json', 'html'].includes(extension)
                ? 'text' as const
                : 'unsupported' as const,
        handle: {
          kind: 'file',
          name: file.name,
          getFile: async () => file,
          createWritable: async () => { throw new Error('Drag-and-drop fallback is read-only.'); },
          isSameEntry: async () => false,
          queryPermission: async () => 'granted' as PermissionState,
          requestPermission: async () => 'granted' as PermissionState,
        } as FileSystemFileHandle,
        size: file.size,
        lastModified: file.lastModified,
      };
    });

    setDroppedFiles(nodes);
    setSelectedNode(nodes[0] || null);
  }

  const mainContent = workspace ? (
    <SplitPane
      left={
        <FilePreview
          node={selectedNode}
          preview={preview.preview}
          isLoading={preview.isLoading}
          error={preview.error}
          onClipToNote={handleClipToNote}
        />
      }
      right={
        <NoteEditor
          content={notes.content}
          saveState={notes.saveState}
          error={notes.error}
          notes={notes.notes}
          activeNotePath={notes.activeNotePath}
          onChange={notes.updateContent}
          onSave={() => void notes.saveNow()}
          onSelectNote={setActiveNotePath}
          onCreateNote={() => void handleCreateNote()}
        />
      }
    />
  ) : canUseFolderPicker ? (
    <EmptyState
      title="Turn a folder into a study workspace"
      description="Open a local folder to browse readings, preview files inline, and write self-contained note files beside your study materials."
      action={<Button variant="primary" icon={<FolderOpen size={16} />} onClick={pickFolder}>Open folder</Button>}
    />
  ) : (
    <div onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} className="h-full">
      <EmptyState
        title="Folder access is unavailable"
        description="This browser does not support persistent local folders. Drop files here for temporary read-only preview, or use desktop Chrome or Edge for the full StudyLens workspace."
        action={<Button icon={<Upload size={16} />}>Drop files anywhere in this area</Button>}
      />
    </div>
  );

  return (
    <div className="flex h-screen min-h-0 bg-paper text-ink">
      <Sidebar>
        <div className="border-b border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace</p>
          <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">{sidebarTitle}</h2>
          {(accessError || scanError) && <p className="mt-2 text-sm text-red-700">{accessError || scanError}</p>}
        </div>
        {currentTree.length || workspace || !canUseFolderPicker ? (
          <FileTree tree={currentTree} selectedPath={selectedPath} isScanning={isScanning} onSelect={handleFileSelect} />
        ) : (
          <RecentFoldersList folders={recentList} loading={recentLoading} onOpen={handleOpenRecent} onForget={forget} />
        )}
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          workspaceName={workspace?.name}
          onPickFolder={pickFolder}
          onRefresh={() => void refreshWorkspace()}
          isRefreshing={isScanning}
        />
        {mainContent}
      </main>
    </div>
  );
}

interface RecentFoldersListProps {
  folders: RecentFolder[];
  loading: boolean;
  onOpen: (folder: RecentFolder) => void;
  onForget: (id: string) => void;
}

function RecentFoldersList({ folders, loading, onOpen, onForget }: RecentFoldersListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Clock size={14} /> Recent folders
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner /> Loading recent folders</div>}
      {!loading && !folders.length && <p className="text-sm leading-6 text-slate-500">Recent folders will appear here after you open a workspace.</p>}
      <ul className="space-y-2">
        {folders.map((folder) => (
          <li key={folder.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-panel">
            <button type="button" onClick={() => onOpen(folder)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-slate-800">{folder.name}</p>
              <p className="text-xs text-slate-500">Open local workspace</p>
            </button>
            <Button variant="ghost" onClick={() => void onForget(folder.id)} icon={<Trash2 size={15} />} aria-label="Forget folder" />
          </li>
        ))}
      </ul>
    </div>
  );
}
