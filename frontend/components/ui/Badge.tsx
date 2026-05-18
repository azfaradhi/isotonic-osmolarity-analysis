import type { TonicityStatus } from '@/lib/api'

interface BadgeProps {
  status: TonicityStatus
  className?: string
}

const styles: Record<TonicityStatus, string> = {
  isotonic:   'bg-teal-basin text-pure-white',
  hypertonic: 'bg-glow-yellow text-inkwell-violet border border-pitch-black',
  hypotonic:  'bg-transparent text-inkwell-violet border border-dashed border-inkwell-violet',
}

const labels: Record<TonicityStatus, string> = {
  isotonic:   'Isotonic',
  hypertonic: 'Hypertonic',
  hypotonic:  'Hypotonic',
}

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block font-roobert text-body-sm px-3 py-1 ${styles[status]} ${className}`}>
      {labels[status]}
    </span>
  )
}
