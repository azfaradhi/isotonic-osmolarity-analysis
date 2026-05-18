'use client'

import BarChart from '@/components/charts/BarChart'
import type { Product } from '@/lib/api'

export default function CompareChart({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-pure-white/40">
        <p className="font-roobert text-body-sm text-pure-white/50">Belum ada produk untuk ditampilkan</p>
      </div>
    )
  }

  return (
    <BarChart
      labels={products.map((p) => p.name)}
      datasets={[
        {
          label: 'Osmolarity (mOsm/L)',
          data: products.map((p) => p.calculated_osmolarity),
          backgroundColor: '#fffcf7cc',
          borderColor: '#fffcf7',
        },
        {
          label: 'Effective Tonicity (mOsm/L)',
          data: products.map((p) => p.effective_tonicity),
          backgroundColor: '#fae59bcc',
          borderColor: '#fae59b',
        },
      ]}
      referenceLines={[
        { value: 245, label: 'WHO ORS (245)',    color: '#fae59b'   },
        { value: 285, label: 'Plasma min (285)', color: '#fffcf770' },
        { value: 295, label: 'Plasma max (295)', color: '#fffcf770' },
      ]}
      height={320}
    />
  )
}
