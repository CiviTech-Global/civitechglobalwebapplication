import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ocean' | 'purple' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
}

const variants = {
  ocean: 'bg-gradient-to-r from-ocean-600 to-ocean-500 text-white hover:from-ocean-500 hover:to-purple-500 shadow-[0_0_20px_rgba(0,128,230,0.3)] hover:shadow-[0_0_30px_rgba(0,128,230,0.5)]',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-ocean-500 shadow-[0_0_20px_rgba(139,44,245,0.3)] hover:shadow-[0_0_30px_rgba(139,44,245,0.5)]',
  ghost: 'text-dark-300 hover:text-white hover:bg-dark-800/50',
  outline: 'border border-ocean-500/40 text-ocean-300 hover:bg-ocean-500/10 hover:border-ocean-400 hover:text-ocean-200',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export function NeonButton({ variant = 'ocean', size = 'md', isLoading, glow, className, children, disabled, ...props }: NeonButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ocean-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
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
