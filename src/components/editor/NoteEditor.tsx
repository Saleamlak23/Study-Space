import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { EditorToolbar } from './EditorToolbar';
import { NoteStatus } from './NoteStatus';
import { NoteNavigation } from './NoteNavigation';
import { TableOfContents } from './TableOfContents';
import { ExcalidrawExtension } from './excalidrawExtension';
import type { NoteFileEntry, SaveState } from '../../types/notes';
import { extractTableOfContents } from '../../services/noteHtml';

interface NoteEditorProps {
  content: string;
  saveState: SaveState;
  error?: string | null;
  notes: NoteFileEntry[];
  activeNotePath: string | null;
  onChange: (html: string) => void;
  onSave: () => void;
  onSelectNote: (path: string) => void;
  onCreateNote: () => void;
}

export function NoteEditor({
  content,
  saveState,
  error,
  notes,
  activeNotePath,
  onChange,
  onSave,
  onSelectNote,
  onCreateNote,
}: NoteEditorProps) {
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [showToc, setShowToc] = useState(true);
  const activeFileName = activeNotePath?.split('/').pop() || 'note.html';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({ placeholder: 'Write notes while you study...' }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'studylens-inline-image',
        },
      }),
      ExcalidrawExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-full focus:outline-none',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (!item.type.startsWith('image/')) continue;
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return true;

          const reader = new FileReader();
          reader.onload = () => {
            const src = typeof reader.result === 'string' ? reader.result : '';
            if (!src) return;
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src, alt: file.name || 'Pasted image' }),
              ),
            );
          };
          reader.readAsDataURL(file);
          return true;
        }

        return false;
      },
    },
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const navigateToHeading = useCallback(
    (headingId: string) => {
      if (!editor) return;
      const entries = extractTableOfContents(content);
      const entry = entries.find((item) => item.id === headingId);
      if (!entry) return;

      const root = editorScrollRef.current;
      const target = root?.querySelector(`#${CSS.escape(headingId)}`);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      let foundPos: number | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (foundPos !== null) return false;
        if (node.type.name === 'heading' && node.textContent.trim() === entry.text) {
          foundPos = pos;
          return false;
        }
      });

      if (foundPos !== null) {
        editor.chain().focus().setTextSelection(foundPos + 1).run();
        const domNode = editor.view.domAtPos(foundPos + 1).node;
        const element = domNode instanceof HTMLElement ? domNode : domNode.parentElement;
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [content, editor],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <NoteNavigation
              notes={notes}
              activeNotePath={activeNotePath}
              onSelect={onSelectNote}
              onCreate={onCreateNote}
            />
            <p className="mt-1 text-xs text-slate-500">
              Self-contained rich text note · {activeFileName}
            </p>
          </div>
          <NoteStatus state={saveState} error={error} />
        </div>
      </div>
      <EditorToolbar editor={editor} onSave={onSave} onToggleToc={() => setShowToc((value) => !value)} showToc={showToc} />
      <div className={`grid min-h-0 flex-1 overflow-hidden ${showToc ? 'grid-cols-[180px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {showToc && (
          <aside className="min-h-0 border-r border-slate-200 bg-slate-50">
            <TableOfContents content={content} onNavigate={navigateToHeading} />
          </aside>
        )}
        <div ref={editorScrollRef} className="min-h-0 overflow-auto p-5">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
