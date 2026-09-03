import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: [
      'target',
      'rel',
      'data-studylens',
      'data-excalidraw',
      'id',
      'src',
      'alt',
      'width',
      'height',
    ],
    ADD_TAGS: ['img'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

export function sanitizeNoteBody(html: string) {
  return sanitizeHtml(html);
}
