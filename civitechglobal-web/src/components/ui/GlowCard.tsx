import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: 'ocean' | 'purple';
}

export function GlowCard({ children, className, hover = true, glowColor = 'ocean' }: GlowCardProps) {
  const glowStyles = glowColor === 'purple'
    ? 'hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(139,44,245,0.1)]'
    : 'hover:border-ocean-500/40 hover:shadow-[0_0_30px_rgba(0,128,230,0.1)]';

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'bg-dark-800/60 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6 transition-all duration-300',
        hover && glowStyles,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
