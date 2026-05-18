export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-canvas-cream border border-inkwell-violet/10 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-glow-yellow/40 to-transparent" />
    </div>
  )
}
