'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { Components } from '@/lib/api'

interface InputFormProps {
  onCalculate: (components: Components, volume_mL: number) => void
  loading?: boolean
}

type Mode = 'mg' | 'g'

interface FormValues {
  NaCl: string
  KCl: string
  glucose: string
  sucrose: string
  Na_citrate: string
  volume_mL: string
}

const EMPTY: FormValues = { NaCl: '', KCl: '', glucose: '', sucrose: '', Na_citrate: '', volume_mL: '500' }

const FIELDS: { key: keyof Omit<FormValues, 'volume_mL'>; label: string; hint: string }[] = [
  { key: 'NaCl',       label: 'Natrium Klorida (NaCl)',         hint: 'Garam dapur / garam rehidrasi'  },
  { key: 'KCl',        label: 'Kalium Klorida (KCl)',           hint: 'Sumber elektrolit K⁺'           },
  { key: 'glucose',    label: 'Glukosa',                        hint: 'Gula dekstrosa / D-glucose'     },
  { key: 'sucrose',    label: 'Sukrosa',                        hint: 'Gula pasir biasa'               },
  { key: 'Na_citrate', label: 'Trisodium Citrate (opsional)',   hint: 'Buffer alkalinity'              },
]

function toGram(val: string, mode: Mode) {
  const n = parseFloat(val) || 0
  return mode === 'mg' ? n / 1000 : n
}

export default function InputForm({ onCalculate, loading = false }: InputFormProps) {
  const [mode, setMode] = useState<Mode>('g')
  const [values, setValues] = useState<FormValues>(EMPTY)

  function set(key: keyof FormValues, val: string) {
    setValues((p) => ({ ...p, [key]: val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCalculate(
      {
        NaCl:       toGram(values.NaCl,       mode),
        KCl:        toGram(values.KCl,        mode),
        glucose:    toGram(values.glucose,    mode),
        sucrose:    toGram(values.sucrose,    mode),
        Na_citrate: toGram(values.Na_citrate, mode),
      },
      parseFloat(values.volume_mL) || 500,
    )
  }

  const unit = mode === 'mg' ? 'mg' : 'gram'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div>
        <p className="font-roobert text-body-sm text-inkwell-violet mb-2">Mode Input</p>
        <div className="flex">
          {(['g', 'mg'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-5 py-2 border border-inkwell-violet font-roobert text-body-sm transition-colors ${
                mode === m ? 'bg-teal-basin text-pure-white' : 'text-inkwell-violet hover:bg-glow-yellow/30'
              }`}
            >
              {m === 'g' ? 'Gram / sdm' : 'mg / sajian'}
            </button>
          ))}
        </div>
        <p className="mt-1 font-roobert text-xs text-inkwell-violet/60">
          {mode === 'mg' ? 'Dari label nutrisi — nilai dalam mg per sajian' : 'Takaran rumahan — nilai dalam gram'}
        </p>
      </div>

      {/* Component fields */}
      <div className="flex flex-col gap-3">
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="block font-roobert text-body-sm text-inkwell-violet mb-1">{label}</label>
            <div className="flex">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={values[key]}
                onChange={(e) => set(key, e.target.value)}
                className="flex-1 border border-inkwell-violet bg-pure-white px-3 py-2 font-supply text-body-sm text-inkwell-violet outline-none focus:ring-1 focus:ring-inkwell-violet"
              />
              <span className="border border-l-0 border-inkwell-violet bg-canvas-cream px-3 py-2 font-supply text-body-sm text-inkwell-violet/60 shrink-0">
                {unit}
              </span>
            </div>
            <p className="mt-0.5 font-roobert text-xs text-inkwell-violet/50">{hint}</p>
          </div>
        ))}
      </div>

      {/* Volume */}
      <div>
        <label className="block font-roobert text-body-sm text-inkwell-violet mb-1">Volume Air</label>
        <div className="flex">
          <input
            type="number"
            min="1"
            step="1"
            value={values.volume_mL}
            onChange={(e) => set('volume_mL', e.target.value)}
            className="flex-1 border border-inkwell-violet bg-pure-white px-3 py-2 font-supply text-body-sm text-inkwell-violet outline-none focus:ring-1 focus:ring-inkwell-violet"
          />
          <span className="border border-l-0 border-inkwell-violet bg-canvas-cream px-3 py-2 font-supply text-body-sm text-inkwell-violet/60 shrink-0">
            mL
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Menghitung...' : 'Hitung Sekarang'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setValues(EMPTY)} disabled={loading}>
          Reset
        </Button>
      </div>
    </form>
  )
}
