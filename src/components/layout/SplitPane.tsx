import type { ReactNode } from 'react';

export function SplitPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] overflow-hidden">
      <section className="min-h-0 border-r border-slate-200 bg-white">{left}</section>
      <section className="min-h-0 bg-slate-50">{right}</section>
    </div>
  );
}
