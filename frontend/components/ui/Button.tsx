'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-glow-yellow border border-inkwell-violet text-inkwell-violet font-supply text-body-sm rounded-cta hover:bg-inkwell-violet hover:text-pure-white',
    secondary:
      'bg-transparent border border-inkwell-violet text-inkwell-violet font-roobert text-body-sm rounded-none hover:bg-inkwell-violet hover:text-pure-white',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
