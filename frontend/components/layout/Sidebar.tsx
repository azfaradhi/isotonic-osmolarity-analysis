'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, CalculatorIcon, CompareIcon, MlIcon, InfoIcon } from '@/components/ui/Icons'

const navLinks = [
  { href: '/',           label: 'Dashboard',  icon: HomeIcon },
  { href: '/calculator', label: 'Kalkulator', icon: CalculatorIcon },
  { href: '/compare',    label: 'Komparasi',  icon: CompareIcon },
  { href: '/ml',         label: 'ML Model',   icon: MlIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col md:w-16 lg:w-52 shrink-0 border-r border-inkwell-violet bg-canvas-cream sticky top-0 h-screen">
      <div className="px-4 py-6 border-b border-inkwell-violet flex items-center justify-center lg:justify-start">
        <span className="font-roobert font-bold text-subheading text-inkwell-violet tracking-tight hidden lg:inline">
          HydraCheck
        </span>
        <span className="font-roobert font-bold text-subheading text-inkwell-violet tracking-tight lg:hidden">
          HC
        </span>
      </div>

      <nav className="flex flex-col p-2 lg:p-3 gap-0.5 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`px-3 lg:px-4 py-2.5 font-roobert text-body-sm transition-colors flex items-center justify-center lg:justify-start ${
                active
                  ? 'bg-teal-basin text-pure-white'
                  : 'text-inkwell-violet hover:bg-glow-yellow/30'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-5 border-t border-inkwell-violet flex items-center justify-center lg:justify-start">
        <Link
          href="/about"
          aria-label="Tentang"
          className="font-roobert text-body-sm text-inkwell-violet hover:underline flex items-center gap-3"
        >
          <InfoIcon className="shrink-0" />
          <span className="hidden lg:inline">Tentang</span>
        </Link>
      </div>
    </aside>
  )
}
