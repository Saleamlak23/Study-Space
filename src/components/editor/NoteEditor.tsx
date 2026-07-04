import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { NoteStatus } from './NoteStatus';
import type { SaveState } from '../../types/notes';

interface NoteEditorProps {
  content: string;
  saveState: SaveState;
  error?: string | null;
  onChange: (html: string) => void;
  onSave: () => void;
}

export function NoteEditor({ content, saveState, error, onChange, onSave }: NoteEditorProps) {
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
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-full focus:outline-none',
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

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">note.html</h2>
          <p className="text-xs text-slate-500">Self-contained rich text note in the selected folder</p>
        </div>
        <NoteStatus state={saveState} error={error} />
      </div>
      <EditorToolbar editor={editor} onSave={onSave} />
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
