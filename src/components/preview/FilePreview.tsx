import type { StudyFileNode } from '../../types/files';
import type { PreviewData } from '../../services/previewUrl';
import { Spinner } from '../common/Spinner';
import { EmptyState } from '../layout/EmptyState';
import { IframePreview } from './IframePreview';
import { TextPreview } from './TextPreview';
import { UnsupportedPreview } from './UnsupportedPreview';

interface FilePreviewProps {
  node: StudyFileNode | null;
  preview: PreviewData | null;
  isLoading: boolean;
  error: string | null;
  onClipToNote?: (text: string, sourceName?: string) => void;
}

export function FilePreview({ node, preview, isLoading, error, onClipToNote }: FilePreviewProps) {
  if (!node) {
    return (
      <EmptyState
        title="Select a study file"
        description="Choose a PDF, image, text file, audio file, or video from the folder tree to preview it in this pane."
      />
    );
  }

  if (node.category === 'note') {
    return (
      <EmptyState
        title="Note open in editor"
        description={`${node.name} is open in the note panel. Edit it there, or pick another file to preview.`}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <div className="flex items-center gap-3 text-sm text-slate-600"><Spinner /> Loading preview</div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState title="Preview failed" description={error} />
    );
  }

  if (!preview) return null;

  if (preview.kind === 'iframe' && preview.url) return <IframePreview url={preview.url} title={node.name} />;
  if (preview.kind === 'image' && preview.url) {
    return (
      <div className="grid h-full place-items-center overflow-auto bg-white p-4">
        <img src={preview.url} alt={node.name} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  if (preview.kind === 'audio' && preview.url) {
    return (
      <div className="grid h-full place-items-center bg-white p-8">
        <audio src={preview.url} controls className="w-full max-w-xl" />
      </div>
    );
  }
  if (preview.kind === 'video' && preview.url) {
    return (
      <div className="grid h-full place-items-center bg-slate-950 p-4">
        <video src={preview.url} controls className="max-h-full max-w-full" />
      </div>
    );
  }
  if (preview.kind === 'text') {
    return (
      <TextPreview
        text={preview.text || ''}
        sourceName={node.name}
        onClipToNote={onClipToNote}
      />
    );
  }

  return <UnsupportedPreview node={node} />;
}
