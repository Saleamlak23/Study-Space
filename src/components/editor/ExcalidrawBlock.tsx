import { lazy, Suspense, useCallback, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types/types';
import type { ExcalidrawScene } from './excalidrawExtension';
import { Spinner } from '../common/Spinner';

const Excalidraw = lazy(async () => {
  const module = await import('@excalidraw/excalidraw');
  return { default: module.Excalidraw };
});

export function ExcalidrawBlock({ node, updateAttributes }: NodeViewProps) {
  const scene = (node.attrs.scene as ExcalidrawScene | null) || {
    elements: [],
    appState: { viewBackgroundColor: '#ffffff' },
    files: {},
  };

  const initialData = useMemo(
    () =>
      ({
        elements: scene.elements || [],
        appState: {
          viewBackgroundColor: '#ffffff',
          ...(scene.appState || {}),
        },
        files: scene.files || {},
      }) as ExcalidrawInitialDataState,
    [scene.appState, scene.elements, scene.files],
  );

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      updateAttributes({
        scene: {
          elements: [...elements],
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
            zoom: appState.zoom,
          },
          files,
        } satisfies ExcalidrawScene,
      });
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper className="studylens-excalidraw my-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="h-[360px]">
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-slate-500"><Spinner /> Loading whiteboard</div>}>
          <Excalidraw
            initialData={initialData}
            onChange={handleChange}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                export: false,
                saveToActiveFile: false,
              },
            }}
          />
        </Suspense>
      </div>
    </NodeViewWrapper>
  );
}
