import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const variants = {
  primary: 'bg-ink text-white hover:bg-slate-700 disabled:bg-slate-300 dark:bg-blue-600 dark:hover:bg-blue-500',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:text-red-300',
};

export function Button({ children, icon, variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
