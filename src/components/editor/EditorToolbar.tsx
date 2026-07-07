import type { Editor } from '@tiptap/react';
import { Bold, Code, Heading1, Heading2, Italic, Link, List, ListOrdered, Quote, Redo2, Save, Strikethrough, Underline, Undo2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

interface EditorToolbarProps {
  editor: Editor | null;
  onSave: () => void;
}

export function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  if (!editor) return null;

  const controls = [
    { label: 'Heading 1', icon: <Heading1 size={16} />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { label: 'Heading 2', icon: <Heading2 size={16} />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { label: 'Bold', icon: <Bold size={16} />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'Italic', icon: <Italic size={16} />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'Underline', icon: <Underline size={16} />, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    { label: 'Strike', icon: <Strikethrough size={16} />, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { label: 'Bullet list', icon: <List size={16} />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: 'Ordered list', icon: <ListOrdered size={16} />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { label: 'Quote', icon: <Quote size={16} />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { label: 'Code', icon: <Code size={16} />, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
  ];

  function setLink() {
    const current = editor?.getAttributes('link').href;
    const href = window.prompt('Link URL', current || 'https://');
    if (href === null) return;
    if (href.trim() === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-3 py-2">
      <Tooltip label="Undo">
        <Button variant="ghost" onClick={() => editor.chain().focus().undo().run()} icon={<Undo2 size={16} />} aria-label="Undo" />
      </Tooltip>
      <Tooltip label="Redo">
        <Button variant="ghost" onClick={() => editor.chain().focus().redo().run()} icon={<Redo2 size={16} />} aria-label="Redo" />
      </Tooltip>
      <span className="mx-1 h-6 w-px bg-slate-200" />
      {controls.map((control) => (
        <Tooltip key={control.label} label={control.label}>
          <Button
            variant="ghost"
            onClick={control.action}
            icon={control.icon}
            aria-label={control.label}
            className={control.active ? 'bg-slate-200' : ''}
          />
        </Tooltip>
      ))}
      <Tooltip label="Link">
        <Button variant="ghost" onClick={setLink} icon={<Link size={16} />} aria-label="Link" className={editor.isActive('link') ? 'bg-slate-200' : ''} />
      </Tooltip>
      <span className="mx-1 h-6 w-px bg-slate-200" />
      <Button onClick={onSave} icon={<Save size={16} />}>Save</Button>
    </div>
  );
}
