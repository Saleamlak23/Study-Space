import type { FileCategory } from '../types/files';

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg']);
const textExtensions = new Set(['txt', 'md', 'markdown', 'csv', 'json', 'ts', 'tsx', 'js', 'jsx', 'css', 'html', 'xml', 'yml', 'yaml', 'log']);
const documentExtensions = new Set(['pdf']);
const mediaExtensions = new Set(['mp3', 'wav', 'ogg', 'm4a', 'mp4', 'webm', 'mov']);

export function extensionFromName(name: string) {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > -1 ? name.slice(dotIndex + 1).toLowerCase() : '';
}

export function categoryFromName(name: string): FileCategory {
  const extension = extensionFromName(name);
  if (name.toLowerCase() === 'note.html') return 'note';
  if (imageExtensions.has(extension)) return 'image';
  if (textExtensions.has(extension)) return 'text';
  if (documentExtensions.has(extension)) return 'document';
  if (mediaExtensions.has(extension)) return 'media';
  return 'unsupported';
}

export function isTextLike(file: File, extension: string) {
  return file.type.startsWith('text/') || ['json', 'md', 'csv', 'xml', 'yml', 'yaml', 'ts', 'tsx', 'js', 'jsx', 'css', 'html'].includes(extension);
}
