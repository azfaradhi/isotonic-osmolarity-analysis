'use client'

import { useEffect, useState, useRef } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import BarChart from '@/components/charts/BarChart'
import type { CalculateResult } from '@/lib/api'

interface ResultPanelProps {
  result: CalculateResult | null
  loading: boolean
  onSave?: () => void
}

const REI_LABELS: Record<string, string> = {
  Poor: 'Buruk', Fair: 'Cukup', Good: 'Baik', Excellent: 'Sangat Baik',
}

const REFS = [
  { name: 'WHO ORS',      osmolarity: 245 },
  { name: 'Pocari Sweat', osmolarity: 327 },
  { name: 'Mizone',       osmolarity: 211 },
]

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }

function OsmolalityGauge({ value }: { value: number }) {
  const MAX = 400
  const pct      = Math.min((value / MAX) * 100, 100)
  const isoStart = (285 / MAX) * 100
  const isoEnd   = (295 / MAX) * 100

  return (
    <div className="mt-3">
      <div className="relative h-5 w-full border border-inkwell-violet overflow-hidden">
        <div className="absolute inset-y-0 bg-inkwell-violet/15" style={{ left: 0, width: `${isoStart}%` }} />
        <div className="absolute inset-y-0 bg-teal-basin/40"   style={{ left: `${isoStart}%`, width: `${isoEnd - isoStart}%` }} />
        <div className="absolute inset-y-0 bg-glow-yellow/40"  style={{ left: `${isoEnd}%`, right: 0 }} />
        <div className="absolute inset-y-0 w-0.5 bg-inkwell-violet" style={{ left: `${pct}%` }} />
      </div>
      <div className="flex justify-between font-supply text-xs text-inkwell-violet/50 mt-1">
        <span>0</span><span>285–295 (Isotonic)</span><span>{MAX}+</span>
      </div>
    </div>
  )
}

export default function ResultPanel({ result, loading, onSave }: ResultPanelProps) {
  const [displayREI, setDisplayREI] = useState(0)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    if (!result) return
    const target = result.rei_score
    const start  = performance.now()
    const frame  = (now: number) => {
      const t = Math.min((now - start) / 800, 1)
      setDisplayREI(Math.round(target * easeOut(t)))
      if (t < 1) animRef.current = requestAnimationFrame(frame)
    }
    animRef.current = requestAnimationFrame(frame)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [result])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-28" />
        <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-40" /><Skeleton className="h-32" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-inkwell-violet/30">
        <p className="font-roobert text-body-sm text-inkwell-violet/40 text-center px-4">
          Isi form dan klik &ldquo;Hitung Sekarang&rdquo; untuk melihat hasil
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <Card>
        <p className="font-roobert text-body-sm text-inkwell-violet/60 mb-1">Posisi Osmolaritas</p>
        <OsmolalityGauge value={result.calculated_osmolarity} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Osmolarity</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{result.calculated_osmolarity.toFixed(1)}</p>
          <p className="font-supply text-xs text-inkwell-violet/50 mb-2">mOsm/L</p>
          <Badge status={result.osmolarity_status} />
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Effective Tonicity</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{result.effective_tonicity.toFixed(1)}</p>
          <p className="font-supply text-xs text-inkwell-violet/50 mb-2">mOsm/L</p>
          <Badge status={result.tonicity_status} />
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Phantom Osmolarity</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{result.phantom_osmolarity.toFixed(1)}</p>
          <p className="font-supply text-xs text-inkwell-violet/50">mOsm/L semu</p>
          <p className="font-roobert text-xs text-inkwell-violet/40 mt-1">Solute permeant</p>
        </Card>
        <Card>
          <p className="font-roobert text-xs text-inkwell-violet/60 mb-1">Rasio Na:Glukosa</p>
          <p className="font-supply text-heading-sm text-inkwell-violet">{result.na_glucose_ratio.toFixed(2)}</p>
          <p className="font-supply text-xs text-inkwell-violet/50">optimal: 1.0</p>
          <p className="font-roobert text-xs text-inkwell-violet/40 mt-1">Absorpsi: {result.absorption_label}</p>
        </Card>
      </div>

      {/* REI Panel */}
      <div className="bg-teal-basin p-6">
        <p className="font-roobert text-body-sm text-pure-white/70 mb-2">Rehydration Effectiveness Index</p>
        <p className="font-supply text-display text-pure-white leading-none">
          {displayREI}<span className="text-heading-sm opacity-60"> / 100</span>
        </p>
        <p className="font-roobert text-subheading text-glow-yellow mt-2 font-bold">
          {REI_LABELS[result.rei_label] ?? result.rei_label}
        </p>
        <div className="mt-3 h-2 bg-pure-white/20">
          <div className="h-full bg-glow-yellow transition-all duration-700" style={{ width: `${result.rei_score}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {Object.entries(result.component_scores).map(([k, v]) => (
            <div key={k} className="bg-pure-white/10 p-2">
              <p className="font-supply text-body-sm text-glow-yellow">{(v as number).toFixed(0)}</p>
              <p className="font-roobert text-xs text-pure-white/60 capitalize">{k.replace('_score','').replace('_',' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card>
          <p className="font-roobert font-bold text-body-sm text-inkwell-violet mb-2">Rekomendasi Penyesuaian</p>
          <ul className="flex flex-col gap-1.5">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="font-roobert text-body-sm text-inkwell-violet flex gap-2">
                <span className="text-teal-basin shrink-0">→</span>{rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Mini comparison */}
      <Card>
        <p className="font-roobert font-bold text-body-sm text-inkwell-violet mb-3">Perbandingan Osmolaritas</p>
        <BarChart
          labels={['Hasil Anda', ...REFS.map((r) => r.name)]}
          datasets={[{ label: 'Osmolarity (mOsm/L)', data: [result.calculated_osmolarity, ...REFS.map((r) => r.osmolarity)] }]}
          referenceLines={[
            { value: 245, label: 'WHO ORS',    color: '#19615c' },
            { value: 285, label: 'Plasma min', color: '#b5860d' },
            { value: 295, label: 'Plasma max', color: '#b5860d' },
          ]}
          height={200}
        />
      </Card>

      {onSave && (
        <button
          onClick={onSave}
          className="self-start border border-inkwell-violet px-5 py-2.5 font-roobert text-body-sm text-inkwell-violet hover:bg-inkwell-violet hover:text-pure-white transition-colors"
        >
          Simpan ke Dataset
        </button>
      )}
    </div>
  )
}
