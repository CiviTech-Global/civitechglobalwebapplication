import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      'bg-surface-50 backdrop-blur-sm rounded-xl border border-border-default p-6 shadow-sm',
      hover && 'transition-all hover:shadow-lg hover:-translate-y-1 hover:border-brand-green-400/40 dark:hover:border-brand-green-500/40',
      className
    )}>
      {children}
    </div>
  );
}
