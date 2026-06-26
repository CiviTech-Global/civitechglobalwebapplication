export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-0 -start-1/4 w-1/2 h-1/2 bg-ocean-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -end-1/4 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-[120px]" />
    </div>
  );
}
