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
      'bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-6',
      hover && 'transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary-300 dark:hover:border-primary-600',
      className
    )}>
      {children}
    </div>
  );
}
