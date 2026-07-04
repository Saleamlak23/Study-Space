import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ title, children, isOpen, onClose }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
