interface IconProps {
  className?: string
}

const base = 'w-5 h-5'

export function HomeIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  )
}

export function CalculatorIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="3.5" width="14" height="17" />
      <path d="M8 7.5h8M8 12h2M12 12h2M16 12h2M8 16h2M12 16h2M16 16h2" />
    </svg>
  )
}

export function CompareIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16" />
      <path d="M7 19V10M12 19V6M17 19v-8" />
    </svg>
  )
}

export function MlIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.2 7.5 10.8 15M15.8 7.5 13.2 15M8.5 6h7" />
    </svg>
  )
}

export function InfoIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7.5h.01" />
    </svg>
  )
}
