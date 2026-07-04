# StudyLens Project Plan

## 1. Overview

StudyLens is a local-first, browser-based study workspace for desktop students who want to read course materials and take rich notes without leaving a single tab. A student selects a folder on their computer, StudyLens turns that folder into a complete study workspace inside the browser, and the app lets them browse files, preview study materials inline, and maintain self-contained HTML notes stored directly alongside the source files. The value proposition is simple: no backend, no accounts, no external apps, and no cloud lock-in; the student’s folder remains the source of truth.

## 2. Core Vision & Constraints

StudyLens is browser-only and serverless. The application runs entirely in the client after the initial page load, using the File System Access API for local folder read/write access and browser storage only for local app metadata such as recent folders and saved handles.

The app is folder-based. A selected directory becomes a study workspace containing source materials, generated notes, embedded images, drawings, and any future study artifacts. The app should avoid proprietary project files wherever possible; human-readable files, especially self-contained `note.html` files, are preferred.

The primary target is desktop Chromium browsers: Chrome and Edge. These browsers support the File System Access API required for persistent local folder access. Non-Chromium browsers should receive a degraded drag-and-drop mode that allows temporary file browsing and read-only preview where possible, but without persistent write access or full workspace behavior.

Core constraints:

- No backend service.
- No cloud storage.
- No authentication or user accounts.
- No native desktop wrapper for the initial product.
- Works offline after the app shell has loaded.
- Notes are self-contained HTML files that can be opened outside StudyLens.
- Target platform is desktop Chrome and Edge.

## 3. Phased Development Roadmap

### Phase 1 - Minimal Viable Study App (2-4 Weeks)

Phase 1 establishes the core local study loop: pick a folder, browse files, preview materials, write notes, and save those notes back into the folder.

Deliverables:

- Folder selection using the File System Access API.
- Persistent read/write access to the selected directory after user permission.
- Recursive file-tree view with filtering.
- Inline file preview for PDFs, images, text files, audio, video, and common browser-supported formats.
- Preview rendering through blob URLs and browser-native viewers.
- Rich-text note editor panel backed by Tiptap.
- Automatic creation of `note.html` in the selected folder when no note exists.
- Auto-save with debounce.
- DOMPurify sanitization before writing note HTML.
- Recent folders stored in IndexedDB using `idb`.
- Permission checks and re-prompt flow when restored handles no longer have access.
- Clear unsupported-browser and unsupported-file messaging.

### Phase 2 - Enhanced Note-Taking (2-3 Weeks)

Phase 2 deepens the note-taking experience and makes StudyLens more than a side-by-side viewer.

Deliverables:

- Drawing/whiteboard integration with Excalidraw inside the note.
- Multiple note files.
- Clip to note button for quick text capture.
- Table of contents generation.
- Image pasting and inline storage.
- Better note navigation.
- Optional note metadata stored inside the HTML document in a durable, app-readable format.

### Phase 3 - Polish & Productivity (Ongoing)

Phase 3 adds study productivity features and improves the application shell.

Deliverables:

- Flashcard generation from selected terms.
- Full-text search across notes.
- Light/dark mode.
- Offline-capable app shell.
- Split view for two files side by side.
- Export note to PDF.
- Fallback drag-and-drop mode for other browsers.
- Improved keyboard shortcuts and command palette.
- Performance profiling for large workspaces.

## 4. Technology Stack

StudyLens uses React, Vite, Tailwind CSS, and TypeScript because the app needs a fast local development loop, strongly typed browser APIs, a component-driven UI, and a styling system that can support dense desktop productivity interfaces without heavy custom CSS.

- **TypeScript** provides type safety around File System Access API handles, editor state, IndexedDB records, and app-level domain models.
- **React** supports a component-based layout for file navigation, preview panes, editor surfaces, toolbars, modals, and future split-view workflows.
- **Vite** provides fast development builds, modern browser targeting, and a straightforward production bundling setup.
- **Tailwind CSS** enables a consistent desktop UI system with utility classes, responsive layout primitives, and light/dark mode support.
- **File System Access API** enables folder selection, persistent directory handles, file reads, note creation, and note writes on Chromium browsers.
- **idb** wraps IndexedDB with a cleaner promise-based API for recent folders, persisted handles, app preferences, and lightweight workspace metadata.
- **Tiptap / ProseMirror** powers the rich-text note editor with extensible document structure, headings, lists, links, tables, images, and future custom blocks.
- **Excalidraw React component** adds embedded drawing and whiteboard experiences for visual study notes.
- **DOMPurify** sanitizes generated and edited note HTML before persistence and before rehydrating content into the editor.
- **Lucide** provides consistent icons for navigation, file types, editor actions, view controls, search, and settings.

## 5. Project Structure

```text
studylens/
├─ public/
│  ├─ icons/
│  ├─ manifest.webmanifest
│  └─ offline.html
├─ src/
│  ├─ app/
│  ├─ assets/
│  ├─ components/
│  ├─ hooks/
│  ├─ services/
│  ├─ styles/
│  ├─ types/
│  ├─ utils/
│  └─ main.tsx
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
├─ eslint.config.js
├─ .gitignore
└─ README.md
```

## 6. Detailed Implementation Plan for Phase 1

Phase 1 implements folder access, recursive browsing, inline preview, a default rich-text `note.html`, debounced sanitized saving, and recent folders through IndexedDB.

## 7. Handling Edge Cases

StudyLens treats the selected folder as the durable source of truth. If browser storage is cleared, the user can select the folder again and continue using the existing note files. Large folders should be scanned incrementally, unsupported files remain visible, and externally edited notes should be loaded safely after sanitization.

## 8. Open Questions & Future Considerations

Mobile support, collaboration, settings export/import, stronger conflict handling, and improved PDF export remain future considerations.
