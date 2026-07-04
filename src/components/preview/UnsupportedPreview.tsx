import type { StudyFileNode } from '../../types/files';
import { formatDateTime } from '../../utils/dates';

export function UnsupportedPreview({ node }: { node: StudyFileNode }) {
  return (
    <div className="grid h-full place-items-center bg-white p-8">
      <div className="max-w-sm text-center">
        <h2 className="text-lg font-semibold text-slate-900">Preview unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          StudyLens can see this file, but the browser cannot render this format inline yet.
        </p>
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-left text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd className="truncate text-slate-800">{node.name}</dd>
          <dt className="text-slate-500">Type</dt>
          <dd className="text-slate-800">{node.extension || 'Unknown'}</dd>
          <dt className="text-slate-500">Modified</dt>
          <dd className="text-slate-800">{formatDateTime(node.lastModified)}</dd>
        </dl>
      </div>
    </div>
  );
}
