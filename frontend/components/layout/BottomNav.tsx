'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',           label: 'Home'      },
  { href: '/calculator', label: 'Kalkulator'},
  { href: '/compare',    label: 'Komparasi' },
  { href: '/ml',         label: 'ML'        },
  { href: '/about',      label: 'Info'      },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-pure-white border-t border-inkwell-violet flex">
      {tabs.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2.5 font-roobert text-xs transition-colors ${
              active ? 'text-teal-basin' : 'text-inkwell-violet'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
