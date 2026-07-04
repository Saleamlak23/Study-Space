import type { LoadedNote } from '../types/notes';
import { sanitizeHtml } from './sanitization';

const NOTE_SELECTOR = '[data-studylens="note-body"]';

export async function readNoteFile(handle: FileSystemFileHandle): Promise<LoadedNote> {
  const file = await handle.getFile();
  const html = await file.text();
  return {
    html,
    body: extractNoteBody(html),
    file,
  };
}

export function extractNoteBody(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const noteBody = document.querySelector(NOTE_SELECTOR);
  const source = noteBody?.innerHTML || document.body.innerHTML || html;
  return sanitizeHtml(source || defaultNoteBody());
}

export function defaultNoteBody() {
  return '<h1>Study Notes</h1><p>Start writing while you study.</p>';
}

export function buildNoteDocument(body: string) {
  const safeBody = sanitizeHtml(body);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StudyLens Note</title>
  <style>
    :root { color: #1f2933; background: #f8fafc; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; padding: 48px; line-height: 1.65; }
    main { max-width: 840px; margin: 0 auto; background: #ffffff; border: 1px solid #d9e2ec; padding: 40px; border-radius: 8px; }
    h1, h2, h3 { line-height: 1.2; color: #102a43; }
    a { color: #2563eb; }
    blockquote { border-left: 4px solid #9fb3c8; margin-left: 0; padding-left: 16px; color: #52606d; }
    code, pre { background: #f0f4f8; border-radius: 4px; }
    pre { padding: 16px; overflow: auto; }
  </style>
</head>
<body>
  <main data-studylens="note-body">
${safeBody}
  </main>
</body>
</html>`;
}
