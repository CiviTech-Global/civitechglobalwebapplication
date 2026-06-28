import { useTheme } from '../../hooks/useTheme';

export function AmbientBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-surface-100">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(15,23,42,0.6) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-0 -start-1/4 w-1/2 h-1/2 bg-brand-green-500/5 dark:bg-brand-green-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -end-1/4 w-1/2 h-1/2 bg-brand-amber-500/5 dark:bg-brand-amber-600/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-brand-red-500/5 rounded-full blur-[120px]" />
    </div>
  );
}
