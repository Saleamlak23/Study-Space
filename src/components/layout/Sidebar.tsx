import type { ReactNode } from 'react';

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="flex min-h-0 w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      {children}
    </aside>
  );
}
