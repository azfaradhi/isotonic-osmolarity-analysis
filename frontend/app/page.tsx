'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BarChart from '@/components/charts/BarChart'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'

const NAV_CARDS = [
  { href: '/calculator', title: 'Kalkulator Osmolaritas', desc: 'Hitung osmolaritas, tonisitas efektif, dan REI dari komposisi minuman custom.' },
  { href: '/compare',    title: 'Komparasi Produk',       desc: 'Bandingkan semua produk dalam database secara visual dengan chart interaktif.'  },
  { href: '/ml',         title: 'ML Prediksi REI',        desc: 'Latih model machine learning dan prediksi REI berbasis komposisi kimia.'        },
  { href: '/ml',         title: 'Dataset & Training',     desc: 'Kelola dataset, upload data baru, dan evaluasi performa model yang terlatih.'   },
]

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const avgREI        = products.length > 0 ? products.reduce((s, p) => s + p.rei_score, 0) / products.length : 0
  const isotonicCount = products.filter((p) => p.tonicity_status === 'isotonic').length

  return (
    <div className="py-10 flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col gap-6">
        <h1 className="font-roobert font-bold text-display text-inkwell-violet max-w-3xl leading-tight">
          Is Your &ldquo;Isotonic&rdquo; Drink Really Isotonic?
        </h1>
        <p className="font-roobert text-body text-inkwell-violet/70 max-w-2xl">
          Minuman berlabel &ldquo;isotonic&rdquo; bisa saja hypertonic secara fisiologis — yang justru memperlambat
          absorpsi cairan. HydraCheck membedakan osmolaritas vs tonisitas efektif dan mengukur efektivitas rehidrasi
          dengan Rehydration Effectiveness Index (REI).
        </p>
        <div>
          <Link href="/calculator">
            <Button variant="primary">Analisis Minumanmu →</Button>
          </Link>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Total Produk</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{loading ? '—' : products.length}</p>
          <p className="font-roobert text-xs text-inkwell-violet/50 mt-1">dalam database</p>
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Rata-rata REI</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{loading ? '—' : avgREI.toFixed(1)}</p>
          <p className="font-roobert text-xs text-inkwell-violet/50 mt-1">produk komersial</p>
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Truly Isotonic</p>
          <p className="font-supply text-heading-sm text-teal-basin">{loading ? '—' : isotonicCount}</p>
          <p className="font-roobert text-xs text-inkwell-violet/50 mt-1">produk dalam database</p>
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">WHO ORS Standar</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">245</p>
          <p className="font-roobert text-xs text-inkwell-violet/50 mt-1">mOsm/L (target ideal)</p>
        </Card>
      </section>

      {/* Preview chart */}
      <section className="bg-teal-basin p-8">
        <h2 className="font-roobert font-bold text-heading text-pure-white mb-6">Osmolaritas Produk vs Standar</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="font-roobert text-pure-white/40">Memuat data produk...</p>
          </div>
        ) : products.length > 0 ? (
          <BarChart
            labels={products.map((p) => p.name)}
            datasets={[{ label: 'Osmolarity (mOsm/L)', data: products.map((p) => p.calculated_osmolarity), backgroundColor: '#fffcf7cc', borderColor: '#fffcf7' }]}
            referenceLines={[
              { value: 245, label: 'WHO ORS (245)',    color: '#fae59b'   },
              { value: 285, label: 'Plasma min (285)', color: '#fffcf770' },
              { value: 295, label: 'Plasma max (295)', color: '#fffcf770' },
            ]}
            height={320}
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="font-roobert text-pure-white/40">Backend tidak terhubung — pastikan Flask berjalan di port 5000</p>
          </div>
        )}
      </section>

      {/* Nav cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {NAV_CARDS.map(({ href, title, desc }) => (
          <Link key={title} href={href}>
            <Card className="h-full hover:shadow-subtle transition-shadow cursor-pointer group">
              <h3 className="font-roobert font-bold text-subheading text-inkwell-violet mb-2 group-hover:text-teal-basin transition-colors">{title}</h3>
              <p className="font-roobert text-body-sm text-inkwell-violet/60 mb-4">{desc}</p>
              <span className="font-supply text-body-sm text-inkwell-violet group-hover:text-teal-basin transition-colors">→</span>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
