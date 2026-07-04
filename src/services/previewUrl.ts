import type { FileCategory } from '../types/files';
import { isTextLike } from '../utils/mimeTypes';

export type PreviewKind = 'iframe' | 'image' | 'audio' | 'video' | 'text' | 'unsupported';

export interface PreviewData {
  kind: PreviewKind;
  url?: string;
  text?: string;
  file: File;
}

export async function createPreviewData(file: File, category: FileCategory, extension: string): Promise<PreviewData> {
  if (isTextLike(file, extension) && file.size < 2_000_000) {
    return { kind: 'text', text: await file.text(), file };
  }

  if (category === 'document' || extension === 'pdf') {
    return { kind: 'iframe', url: URL.createObjectURL(file), file };
  }

  if (category === 'image') {
    return { kind: 'image', url: URL.createObjectURL(file), file };
  }

  if (file.type.startsWith('audio/')) {
    return { kind: 'audio', url: URL.createObjectURL(file), file };
  }

  if (file.type.startsWith('video/') || category === 'media') {
    return { kind: 'video', url: URL.createObjectURL(file), file };
  }

  return { kind: 'unsupported', file };
}
