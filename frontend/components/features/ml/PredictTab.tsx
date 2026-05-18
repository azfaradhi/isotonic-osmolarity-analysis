'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import InputForm from '@/components/features/calculator/InputForm'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CalculateResult, PredictResult, Components } from '@/lib/api'

const REI_LABELS: Record<string, string> = { Poor: 'Buruk', Fair: 'Cukup', Good: 'Baik', Excellent: 'Sangat Baik' }

function reiLabel(score: number) {
  if (score > 80) return 'Excellent'
  if (score > 60) return 'Good'
  if (score > 40) return 'Fair'
  return 'Poor'
}

export default function PredictTab() {
  const [calcResult, setCalcResult]   = useState<CalculateResult | null>(null)
  const [prediction, setPrediction]   = useState<PredictResult | null>(null)
  const [loadingCalc, setLoadingCalc] = useState(false)
  const [loadingPred, setLoadingPred] = useState(false)
  const { show } = useToast()

  async function handleCalculate(components: Components, volume_mL: number) {
    setLoadingCalc(true); setPrediction(null)
    try {
      const res = await api.calculate({ components, volume_mL })
      setCalcResult(res)
    } catch (err) {
      show((err as Error).message, 'error')
    } finally {
      setLoadingCalc(false)
    }
  }

  async function handlePredict() {
    if (!calcResult) return
    setLoadingPred(true)
    try {
      const res = await api.predictRei({
        calculated_osmolarity: calcResult.calculated_osmolarity,
        effective_tonicity:    calcResult.effective_tonicity,
        phantom_osmolarity:    calcResult.phantom_osmolarity,
        na_mmol_L:             calcResult.na_mmol_L,
        k_mmol_L:              calcResult.k_mmol_L,
        glucose_mmol_L:        calcResult.glucose_mmol_L,
        na_glucose_ratio:      calcResult.na_glucose_ratio,
        absorption_score:      calcResult.absorption_score,
        sucrose_mmol_L:        0,
        cl_mmol_L:             0,
      })
      setPrediction(res)
    } catch (err) {
      const msg = (err as Error).message
      show(
        msg.includes('404') || msg.includes('500')
          ? 'Endpoint /api/model/predict belum tersedia. Tambahkan routes/model.py di backend.'
          : msg,
        'warning',
      )
    } finally {
      setLoadingPred(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <p className="font-roobert font-bold text-body text-inkwell-violet mb-4">Komposisi Minuman</p>
        <InputForm onCalculate={handleCalculate} loading={loadingCalc} />
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-roobert font-bold text-body text-inkwell-violet">Hasil Prediksi ML</p>

        {calcResult ? (
          <div className="border border-inkwell-violet p-4 flex flex-col gap-2">
            <p className="font-roobert text-body-sm text-inkwell-violet/60">Kalkulasi manual selesai:</p>
            <p className="font-supply text-body-sm text-inkwell-violet">
              REI Manual: <span className="text-teal-basin">{calcResult.rei_score.toFixed(1)}</span> ({calcResult.rei_label})
            </p>
            <Button variant="primary" onClick={handlePredict} disabled={loadingPred}>
              {loadingPred ? 'Memprediksi...' : 'Prediksi dengan ML'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 border border-dashed border-inkwell-violet/30">
            <p className="font-roobert text-body-sm text-inkwell-violet/40 text-center px-4">
              Isi komposisi di kiri, lalu klik &ldquo;Prediksi dengan ML&rdquo;
            </p>
          </div>
        )}

        {prediction && (
          <div className="bg-teal-basin p-6 animate-fade-in-up">
            <p className="font-roobert text-body-sm text-pure-white/70 mb-1">Prediksi Model ML</p>
            <p className="font-supply text-display text-pure-white leading-none">
              {prediction.predicted_rei.toFixed(1)}<span className="text-heading-sm opacity-60"> / 100</span>
            </p>
            <p className="font-roobert text-subheading text-glow-yellow mt-2 font-bold">
              {REI_LABELS[reiLabel(prediction.predicted_rei)]}
            </p>
            <div className="mt-4 border-t border-pure-white/20 pt-4 flex flex-col gap-1">
              <p className="font-roobert text-body-sm text-pure-white/80">
                Kalkulasi manual: <span className="font-supply">{calcResult?.rei_score.toFixed(1)}</span>
              </p>
              <p className="font-roobert text-body-sm text-pure-white/80">
                Prediksi ML: <span className="font-supply">{prediction.predicted_rei.toFixed(1)}</span>
              </p>
              <p className="font-roobert text-body-sm text-pure-white/80">
                Model R²: <span className="font-supply">{prediction.model_r2.toFixed(4)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
