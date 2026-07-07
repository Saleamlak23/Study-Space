import { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { NoteStatus } from './NoteStatus';
import { TableOfContents } from './TableOfContents';
import { ExcalidrawBlock } from './ExcalidrawBlock';
import type { SaveState, TocItem } from '../../types/notes';

interface NoteEditorProps {
  content: string;
  saveState: SaveState;
  error?: string | null;
  noteName: string;
  onChange: (html: string) => void;
  onSave: () => void;
  onClipSelection: () => string;
}

export function NoteEditor({ content, saveState, error, noteName, onChange, onSave, onClipSelection }: NoteEditorProps) {
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        allowBase64: true,
        inline: false,
      }),
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
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files || []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (!imageFile) return false;

        event.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          const src = String(reader.result || '');
          if (src) {
            const { state, dispatch } = view;
            const node = state.schema.nodes.image.create({ src, alt: imageFile.name || 'Pasted image' });
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
          }
        };
        reader.readAsDataURL(imageFile);
        return true;
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

  const tocItems = useMemo(() => buildToc(content), [content]);

  function jumpToHeading(id: string) {
    const target = document.querySelector(`[data-heading-id="${id}"]`);
    target?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function insertClip() {
    if (!editor) return;
    const selectedText = onClipSelection();
    if (!selectedText.trim()) return;
    editor.chain().focus().insertContent(`<blockquote><p>${escapeHtml(selectedText.trim())}</p></blockquote>`).run();
  }

  function insertDrawing(src: string) {
    editor?.chain().focus().setImage({ src, alt: 'Excalidraw study sketch' }).run();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{noteName}</h2>
          <p className="text-xs text-slate-500">Self-contained rich text note in the selected folder</p>
        </div>
        <NoteStatus state={saveState} error={error} />
      </div>
      <EditorToolbar editor={editor} onSave={onSave} onClipSelection={insertClip} onOpenWhiteboard={() => setShowWhiteboard(true)} />
      <TableOfContents items={tocItems} onJump={jumpToHeading} />
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <EditorContent editor={editor} />
      </div>
      {showWhiteboard && <ExcalidrawBlock onInsert={insertDrawing} onClose={() => setShowWhiteboard(false)} />}
    </div>
  );
}

function buildToc(html: string): TocItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('h1, h2, h3')).map((heading, index) => {
    const text = heading.textContent?.trim() || `Heading ${index + 1}`;
    const id = `heading-${index}-${slugify(text)}`;
    heading.setAttribute('data-heading-id', id);
    return {
      id,
      text,
      level: Number(heading.tagName.slice(1)),
    };
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
