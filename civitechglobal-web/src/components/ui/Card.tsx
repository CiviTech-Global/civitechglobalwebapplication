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
      'bg-dark-800/60 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6',
      hover && 'transition-all hover:shadow-lg hover:-translate-y-1 hover:border-ocean-500/40',
      className
    )}>
      {children}
    </div>
  );
}
