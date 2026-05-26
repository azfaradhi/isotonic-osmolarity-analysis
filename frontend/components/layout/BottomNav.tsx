'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, CalculatorIcon, CompareIcon, MlIcon, InfoIcon } from '@/components/ui/Icons'

const tabs = [
  { href: '/',           label: 'Home',       icon: HomeIcon },
  { href: '/calculator', label: 'Kalkulator', icon: CalculatorIcon },
  { href: '/compare',    label: 'Komparasi',  icon: CompareIcon },
  { href: '/ml',         label: 'ML',         icon: MlIcon },
  { href: '/about',      label: 'Info',       icon: InfoIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-pure-white border-t border-inkwell-violet flex">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2.5 font-roobert text-xs transition-colors ${
              active ? 'text-teal-basin' : 'text-inkwell-violet'
            }`}
          >
            <Icon className="mb-0.5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
