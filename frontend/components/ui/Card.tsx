interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`border border-inkwell-violet bg-pure-white p-5 ${className}`}>
      {children}
    </div>
  )
}
