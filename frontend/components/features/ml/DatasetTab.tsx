'use client'

import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import BarChart from '@/components/charts/BarChart'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { DatasetResponse } from '@/lib/api'

interface DatasetTabProps {
  data: DatasetResponse | null
  loading: boolean
  onRefresh: () => void
}

const REI_BUCKETS = [
  { label: 'Poor (<40)',    min: 0,  max: 40  },
  { label: 'Fair (40–60)', min: 40, max: 60  },
  { label: 'Good (60–80)', min: 60, max: 80  },
  { label: 'Excellent (>80)', min: 80, max: 101 },
]

export default function DatasetTab({ data, loading, onRefresh }: DatasetTabProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { show } = useToast()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await api.uploadDataset(file)
      show(`Berhasil menambah ${(res as { rows_added: number }).rows_added} baris`, 'success')
      onRefresh()
    } catch (err) {
      show((err as Error).message, 'error')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDownload() {
    try {
      const res = await api.downloadDataset()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'hydracheck_dataset.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      show('Gagal mengunduh dataset', 'error')
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-4"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>
  )

  const rows    = data?.rows    ?? []
  const total   = data?.total   ?? 0
  const columns = data?.columns ?? []

  const catDist = {
    hypotonic:  rows.filter((r) => r.tonicity_category === 'hypotonic').length,
    isotonic:   rows.filter((r) => r.tonicity_category === 'isotonic').length,
    hypertonic: rows.filter((r) => r.tonicity_category === 'hypertonic').length,
  }
  const reiDist = REI_BUCKETS.map(({ min, max }) =>
    rows.filter((r) => { const s = Number(r.rei_score); return s >= min && s < max }).length,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-4 border border-inkwell-violet p-4">
        <div>
          <p className="font-roobert text-xs text-inkwell-violet/60">Total Baris</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{total}</p>
        </div>
        <div className="w-px bg-inkwell-violet/20" />
        <div>
          <p className="font-roobert text-xs text-inkwell-violet/60">Fitur</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{columns.length}</p>
        </div>
        <div className="w-px bg-inkwell-violet/20" />
        <div className="flex gap-4">
          {Object.entries(catDist).map(([k, v]) => (
            <div key={k}>
              <p className="font-roobert text-xs text-inkwell-violet/60 capitalize">{k}</p>
              <p className="font-supply text-subheading text-inkwell-violet">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="primary" onClick={() => fileRef.current?.click()}>Upload CSV</Button>
        <Button variant="secondary" onClick={handleDownload} disabled={total === 0}>Download Dataset</Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
      </div>

      {/* REI distribution */}
      {rows.length > 0 && (
        <div className="bg-teal-basin p-6">
          <p className="font-roobert font-bold text-body text-pure-white mb-4">Distribusi REI Score</p>
          <BarChart
            labels={REI_BUCKETS.map((b) => b.label)}
            datasets={[{ label: 'Jumlah Sampel', data: reiDist, backgroundColor: '#fae59bcc', borderColor: '#fae59b' }]}
            height={240}
          />
        </div>
      )}

      {/* Table preview */}
      {rows.length > 0 ? (
        <div>
          <p className="font-roobert text-body-sm text-inkwell-violet/60 mb-2">Preview {rows.length} baris pertama</p>
          <div className="overflow-x-auto border border-inkwell-violet">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-inkwell-violet text-pure-white">
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 font-supply whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-pure-white' : 'bg-canvas-cream'}>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-1.5 font-supply text-inkwell-violet whitespace-nowrap">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 border border-dashed border-inkwell-violet/30">
          <p className="font-roobert text-body-sm text-inkwell-violet/40">Dataset kosong — upload CSV untuk memulai</p>
        </div>
      )}
    </div>
  )
}
