import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'red' | 'amber' | 'ocean' | 'purple' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
}

const variants = {
  green: 'bg-gradient-to-r from-brand-green-600 to-brand-green-500 text-white hover:from-brand-green-500 hover:to-brand-amber-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
  red: 'bg-gradient-to-r from-brand-red-600 to-brand-red-500 text-white hover:from-brand-red-500 hover:to-brand-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
  amber: 'bg-gradient-to-r from-brand-amber-500 to-brand-amber-400 text-white hover:from-brand-amber-400 hover:to-brand-green-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]',
  ocean: 'bg-gradient-to-r from-brand-green-600 to-brand-green-500 text-white hover:from-brand-green-500 hover:to-brand-amber-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
  purple: 'bg-gradient-to-r from-brand-amber-500 to-brand-amber-400 text-white hover:from-brand-amber-400 hover:to-brand-green-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-200 dark:hover:bg-surface-300',
  outline: 'border border-brand-green-500/40 text-brand-green-600 hover:bg-brand-green-50 hover:border-brand-green-500 hover:text-brand-green-700 dark:text-brand-green-400 dark:hover:bg-brand-green-900/10',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export function NeonButton({ variant = 'green', size = 'md', isLoading, className, children, disabled, ...props }: NeonButtonProps) {
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
