'use client'

import { useState, useRef } from 'react'
import InputForm from '@/components/features/calculator/InputForm'
import ResultPanel from '@/components/features/calculator/ResultPanel'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CalculateResult, Components } from '@/lib/api'

export default function CalculatorPage() {
  const [result,  setResult]  = useState<CalculateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const lastForm = useRef<{ components: Components; volume_mL: number } | null>(null)
  const { show } = useToast()

  async function handleCalculate(components: Components, volume_mL: number) {
    setLoading(true)
    lastForm.current = { components, volume_mL }
    try {
      setResult(await api.calculate({ components, volume_mL }))
    } catch (err) {
      show((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!lastForm.current) return
    const name = window.prompt('Nama sampel:')
    if (!name?.trim()) return
    try {
      await api.addDatasetRow({
        product_name: name.trim(),
        components: lastForm.current.components,
        volume_mL: lastForm.current.volume_mL,
        source: 'homemade',
      })
      show(`Sampel "${name.trim()}" berhasil disimpan ke dataset`, 'success')
    } catch (err) {
      show((err as Error).message, 'error')
    }
  }

  return (
    <div className="py-10">
      <div className="mb-8">
        <h1 className="font-roobert font-bold text-heading text-inkwell-violet">Kalkulator Osmolaritas</h1>
        <p className="font-roobert text-body text-inkwell-violet/60 mt-2 max-w-xl">
          Masukkan komposisi minuman untuk menghitung osmolaritas, tonisitas efektif, dan Rehydration Effectiveness Index (REI).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
        <div className="border border-inkwell-violet p-6">
          <p className="font-roobert font-bold text-body text-inkwell-violet mb-5">Komposisi Minuman</p>
          <InputForm onCalculate={handleCalculate} loading={loading} />
        </div>
        <div>
          <p className="font-roobert font-bold text-body text-inkwell-violet mb-5">Hasil Analisis</p>
          <ResultPanel result={result} loading={loading} onSave={result ? handleSave : undefined} />
        </div>
      </div>
    </div>
  )
}
