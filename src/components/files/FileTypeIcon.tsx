import { File, FileImage, FileText, FileVideo, Folder, NotebookText, Presentation } from 'lucide-react';
import type { StudyFileNode } from '../../types/files';

export function FileTypeIcon({ node, expanded }: { node: StudyFileNode; expanded?: boolean }) {
  const className = expanded ? 'text-rust' : 'text-slate-500';
  if (node.kind === 'directory') return <Folder size={16} className={className} />;
  if (node.category === 'note') return <NotebookText size={16} className="text-moss" />;
  if (node.category === 'image') return <FileImage size={16} className="text-lake" />;
  if (node.category === 'media') return <FileVideo size={16} className="text-rust" />;
  if (node.category === 'document') return <Presentation size={16} className="text-red-600" />;
  if (node.category === 'text') return <FileText size={16} className="text-slate-600" />;
  return <File size={16} className="text-slate-400" />;
}
