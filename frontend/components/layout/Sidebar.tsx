'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/',           label: 'Dashboard'  },
  { href: '/calculator', label: 'Kalkulator' },
  { href: '/compare',    label: 'Komparasi'  },
  { href: '/ml',         label: 'ML Model'   },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-inkwell-violet bg-canvas-cream sticky top-0 h-screen">
      <div className="px-6 py-7 border-b border-inkwell-violet">
        <span className="font-roobert font-bold text-subheading text-inkwell-violet tracking-tight">
          HydraCheck
        </span>
      </div>

      <nav className="flex flex-col p-3 gap-0.5 flex-1">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2.5 font-roobert text-body-sm transition-colors ${
                active
                  ? 'bg-teal-basin text-pure-white'
                  : 'text-inkwell-violet hover:bg-glow-yellow/30'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-5 border-t border-inkwell-violet">
        <Link href="/about" className="font-roobert text-body-sm text-inkwell-violet hover:underline">
          Tentang
        </Link>
      </div>
    </aside>
  )
}
