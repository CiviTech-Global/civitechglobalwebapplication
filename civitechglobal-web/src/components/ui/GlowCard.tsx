import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: 'green' | 'red' | 'amber' | 'ocean' | 'purple';
}

export function GlowCard({ children, className, hover = true, glowColor = 'green' }: GlowCardProps) {
  const glowStyles: Record<string, string> = {
    green: 'hover:border-brand-green-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]',
    red: 'hover:border-brand-red-400/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.12)]',
    amber: 'hover:border-brand-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]',
    ocean: 'hover:border-brand-green-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]',
    purple: 'hover:border-brand-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'bg-surface-50 backdrop-blur-sm rounded-xl border border-border-default p-6 transition-all duration-300 shadow-sm',
        hover && glowStyles[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
