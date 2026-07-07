import { useState } from 'react';
import { Excalidraw, exportToSvg } from '@excalidraw/excalidraw';
import { ImagePlus } from 'lucide-react';
import { Button } from '../common/Button';

interface ExcalidrawBlockProps {
  onInsert: (src: string) => void;
  onClose: () => void;
}

export function ExcalidrawBlock({ onInsert, onClose }: ExcalidrawBlockProps) {
  const [elements, setElements] = useState<readonly unknown[]>([]);
  const [appState, setAppState] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, unknown>>({});

  async function insertDrawing() {
    if (!elements.length) return;
    const svg = await exportToSvg({
      elements,
      appState: { ...appState, exportBackground: true },
      files,
    } as never);
    const source = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg.outerHTML)))}`;
    onInsert(source);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Whiteboard</h2>
          <p className="text-xs text-slate-500">Insert the drawing into the active note as a self-contained image.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={insertDrawing} icon={<ImagePlus size={16} />} disabled={!elements.length}>
            Insert
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Excalidraw
          onChange={(nextElements, nextAppState, nextFiles) => {
            setElements(nextElements);
            setAppState(nextAppState as Record<string, unknown>);
            setFiles(nextFiles as Record<string, unknown>);
          }}
        />
      </div>
    </div>
  );
}
