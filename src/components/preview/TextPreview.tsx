import { useState } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { Button } from '../common/Button';

interface TextPreviewProps {
  text: string;
  sourceName?: string;
  onClipToNote?: (text: string, sourceName?: string) => void;
}

export function TextPreview({ text, sourceName, onClipToNote }: TextPreviewProps) {
  const [selection, setSelection] = useState('');

  function handleSelection() {
    const selected = window.getSelection()?.toString().trim() || '';
    setSelection(selected);
  }

  function handleClip() {
    if (!selection || !onClipToNote) return;
    onClipToNote(selection, sourceName);
    setSelection('');
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {onClipToNote && (
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2">
          <p className="text-xs text-slate-500">
            {selection ? `${selection.length} characters selected` : 'Select text to clip into your note'}
          </p>
          <Button
            variant="ghost"
            disabled={!selection}
            onClick={handleClip}
            icon={<ClipboardCopy size={16} />}
          >
            Clip to note
          </Button>
        </div>
      )}
      <pre
        className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-6 text-slate-800"
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
      >
        {text}
      </pre>
    </div>
  );
}
