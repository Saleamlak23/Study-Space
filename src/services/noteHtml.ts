import type { NoteMetadata, TocEntry } from '../types/notes';
import type { LoadedNote } from '../types/notes';
import { sanitizeHtml } from './sanitization';

const NOTE_SELECTOR = '[data-studylens="note-body"]';
const METADATA_SELECTOR = 'script[type="application/json"][data-studylens="metadata"]';
export const NOTE_VERSION = 2;

export async function readNoteFile(handle: FileSystemFileHandle): Promise<LoadedNote> {
  const file = await handle.getFile();
  const html = await file.text();
  return {
    html,
    body: extractNoteBody(html),
    metadata: extractNoteMetadata(html),
    file,
  };
}

export function extractNoteBody(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const noteBody = document.querySelector(NOTE_SELECTOR);
  const source = noteBody?.innerHTML || document.body.innerHTML || html;
  return sanitizeHtml(source || defaultNoteBody());
}

export function extractNoteMetadata(html: string): NoteMetadata {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const script = document.querySelector(METADATA_SELECTOR);
  if (script?.textContent) {
    try {
      const parsed = JSON.parse(script.textContent) as Partial<NoteMetadata>;
      return {
        version: parsed.version ?? NOTE_VERSION,
        title: parsed.title,
        created: parsed.created,
        updated: parsed.updated,
      };
    } catch {
      return { version: NOTE_VERSION };
    }
  }

  const titleMeta = document.querySelector('meta[name="studylens:title"]')?.getAttribute('content');
  const createdMeta = document.querySelector('meta[name="studylens:created"]')?.getAttribute('content');
  const updatedMeta = document.querySelector('meta[name="studylens:updated"]')?.getAttribute('content');
  const versionMeta = document.querySelector('meta[name="studylens:version"]')?.getAttribute('content');

  return {
    version: versionMeta ? Number(versionMeta) || NOTE_VERSION : NOTE_VERSION,
    title: titleMeta || undefined,
    created: createdMeta || undefined,
    updated: updatedMeta || undefined,
  };
}

export function defaultNoteBody() {
  return '<h1>Study Notes</h1><p>Start writing while you study.</p>';
}

export function buildNoteDocument(body: string, metadata: Partial<NoteMetadata> = {}) {
  const safeBody = sanitizeHtml(body);
  const now = new Date().toISOString();
  const noteMetadata: NoteMetadata = {
    version: NOTE_VERSION,
    title: metadata.title,
    created: metadata.created || now,
    updated: now,
  };
  const metadataJson = JSON.stringify(noteMetadata, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="studylens:version" content="${NOTE_VERSION}">
  <meta name="studylens:title" content="${escapeAttribute(noteMetadata.title || 'Study Notes')}">
  <meta name="studylens:created" content="${noteMetadata.created}">
  <meta name="studylens:updated" content="${noteMetadata.updated}">
  <title>${escapeHtml(noteMetadata.title || 'StudyLens Note')}</title>
  <script type="application/json" data-studylens="metadata">${metadataJson}</script>
  <style>
    :root { color: #1f2933; background: #f8fafc; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; padding: 48px; line-height: 1.65; }
    main { max-width: 840px; margin: 0 auto; background: #ffffff; border: 1px solid #d9e2ec; padding: 40px; border-radius: 8px; }
    h1, h2, h3 { line-height: 1.2; color: #102a43; }
    a { color: #2563eb; }
    blockquote { border-left: 4px solid #9fb3c8; margin-left: 0; padding-left: 16px; color: #52606d; }
    code, pre { background: #f0f4f8; border-radius: 4px; }
    pre { padding: 16px; overflow: auto; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    .studylens-excalidraw { margin: 1.5rem 0; border: 1px solid #d9e2ec; border-radius: 8px; overflow: hidden; min-height: 320px; }
  </style>
</head>
<body>
  <main data-studylens="note-body">
${safeBody}
  </main>
</body>
</html>`;
}

export function extractTableOfContents(html: string): TocEntry[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const noteBody = document.querySelector(NOTE_SELECTOR) || document.body;
  const headings = noteBody.querySelectorAll('h1, h2, h3');
  const entries: TocEntry[] = [];

  headings.forEach((heading, index) => {
    const level = Number(heading.tagName.slice(1)) as 1 | 2 | 3;
    const text = heading.textContent?.trim() || `Section ${index + 1}`;
    let id = heading.id;
    if (!id) {
      id = slugifyHeading(text, index);
      heading.id = id;
    }
    entries.push({ id, level, text });
  });

  return entries;
}

export function headingIdFromText(text: string, index: number) {
  return slugifyHeading(text, index);
}

function slugifyHeading(text: string, index: number) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug ? `heading-${slug}` : `heading-${index + 1}`;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
