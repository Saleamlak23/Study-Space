import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ExcalidrawBlock } from './ExcalidrawBlock';

export interface ExcalidrawScene {
  elements: unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidraw: {
      insertExcalidraw: () => ReturnType;
    };
  }
}

export const ExcalidrawExtension = Node.create({
  name: 'excalidraw',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      scene: {
        default: null as ExcalidrawScene | null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-excalidraw');
          if (!raw) return null;
          try {
            return JSON.parse(raw) as ExcalidrawScene;
          } catch {
            return null;
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.scene) return {};
          return {
            'data-excalidraw': JSON.stringify(attributes.scene),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-studylens="excalidraw"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-studylens': 'excalidraw',
        class: 'studylens-excalidraw',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawBlock);
  },

  addCommands() {
    return {
      insertExcalidraw:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' }, files: {} },
            },
          }),
    };
  },
});
