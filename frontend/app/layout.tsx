import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'HydraCheck — Rehydration Effectiveness Analyzer',
  description:
    'Analisis osmolaritas, tonisitas efektif, dan Rehydration Effectiveness Index (REI) dari komposisi minuman rehidrasi.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-canvas-cream text-inkwell-violet font-roobert">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 pb-20 lg:pb-0">
              <div className="max-w-[1280px] mx-auto px-4 lg:px-8">{children}</div>
            </main>
          </div>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  )
}
