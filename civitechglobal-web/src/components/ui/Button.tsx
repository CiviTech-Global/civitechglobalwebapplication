import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-brand-green-500 to-brand-green-600 text-white hover:from-brand-green-600 hover:to-brand-green-700 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  secondary: 'bg-surface-200 text-text-primary hover:bg-surface-300 dark:bg-surface-300 dark:text-text-primary dark:hover:bg-surface-400',
  outline: 'border border-border-default text-text-secondary hover:bg-surface-200 hover:border-border-strong dark:border-surface-400 dark:text-surface-700 dark:hover:bg-surface-300 dark:hover:text-text-primary',
  ghost: 'text-text-secondary hover:bg-surface-200 hover:text-text-primary dark:hover:bg-surface-300 dark:hover:text-text-primary',
  danger: 'bg-gradient-to-r from-brand-red-500 to-brand-red-600 text-white hover:from-brand-red-600 hover:to-brand-red-700 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
      {children}
    </button>
  );
}
