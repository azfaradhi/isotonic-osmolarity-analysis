'use client'

import Badge from '@/components/ui/Badge'
import type { Product, TonicityStatus } from '@/lib/api'

interface ProductTableProps {
  products: Product[]
  selectedNames: Set<string>
  onToggleSelect: (name: string) => void
}

export default function ProductTable({ products, selectedNames, onToggleSelect }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="border border-inkwell-violet/30 p-8 text-center">
        <p className="font-roobert text-body-sm text-inkwell-violet/40">Tidak ada produk yang sesuai filter</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-inkwell-violet text-pure-white">
            <th className="px-4 py-3 w-8"><span className="sr-only">Pilih</span></th>
            <th className="px-4 py-3 font-roobert text-body-sm font-bold">Produk</th>
            <th className="px-4 py-3 font-supply text-body-sm">Osmolarity</th>
            <th className="px-4 py-3 font-supply text-body-sm">Tonicity</th>
            <th className="px-4 py-3 font-supply text-body-sm">REI</th>
            <th className="px-4 py-3 font-roobert text-body-sm font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const sel = selectedNames.has(p.name)
            return (
              <tr
                key={p.name}
                onClick={() => onToggleSelect(p.name)}
                className={`border-b border-inkwell-violet/10 cursor-pointer transition-colors ${
                  sel ? 'bg-glow-yellow/20' : i % 2 === 0 ? 'bg-pure-white hover:bg-glow-yellow/20' : 'bg-canvas-cream hover:bg-glow-yellow/20'
                }`}
              >
                <td className="px-4 py-3">
                  <span className={`inline-block w-4 h-4 border border-inkwell-violet ${sel ? 'bg-teal-basin' : ''}`} />
                </td>
                <td className="px-4 py-3 font-roobert text-body-sm text-inkwell-violet font-bold">{p.name}</td>
                <td className="px-4 py-3 font-supply text-body-sm text-inkwell-violet">
                  {p.calculated_osmolarity.toFixed(1)}<span className="text-xs text-inkwell-violet/50 ml-1">mOsm/L</span>
                </td>
                <td className="px-4 py-3 font-supply text-body-sm text-inkwell-violet">
                  {p.effective_tonicity.toFixed(1)}<span className="text-xs text-inkwell-violet/50 ml-1">mOsm/L</span>
                </td>
                <td className="px-4 py-3 font-supply text-body-sm text-inkwell-violet">
                  {p.rei_score.toFixed(1)}<span className="text-xs text-inkwell-violet/50 ml-1">/ 100</span>
                </td>
                <td className="px-4 py-3">
                  <Badge status={p.tonicity_status as TonicityStatus} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
