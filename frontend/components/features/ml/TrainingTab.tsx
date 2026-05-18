'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import BarChart from '@/components/charts/BarChart'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { TrainResult, TrainRequest } from '@/lib/api'

function SliderField({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; format?: (v: number) => string
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="font-supply text-body-sm text-inkwell-violet">{label}</label>
        <span className="font-supply text-body-sm text-teal-basin">{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

export default function TrainingTab() {
  const [modelType, setModelType] = useState<TrainRequest['model_type']>('random_forest')
  const [nEstimators, setNEstimators] = useState(200)
  const [maxDepth, setMaxDepth]       = useState(10)
  const [testSize, setTestSize]       = useState(0.2)
  const [training, setTraining]       = useState(false)
  const [progress, setProgress]       = useState(0)
  const [log, setLog]                 = useState<string[]>([])
  const [result, setResult]           = useState<TrainResult | null>(null)
  const { show } = useToast()

  async function handleTrain() {
    setTraining(true); setProgress(0); setLog([]); setResult(null)
    setLog(['Memulai training...'])
    const steps = [
      { pct: 20, msg: 'Memuat dataset...' },
      { pct: 40, msg: 'Split data training / testing...' },
      { pct: 60, msg: `Melatih ${modelType === 'random_forest' ? 'Random Forest' : 'Gradient Boosting'}...` },
      { pct: 80, msg: 'Mengevaluasi model...' },
      { pct: 100, msg: 'Menyimpan model...' },
    ]
    let i = 0
    const ticker = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].pct)
        setLog((p) => [...p, `[${steps[i].pct}%] ${steps[i].msg}`])
        i++
      }
    }, 400)

    try {
      const res = await api.trainModel({ model_type: modelType, n_estimators: nEstimators, max_depth: maxDepth, test_size: testSize })
      clearInterval(ticker); setProgress(100)
      setLog((p) => [...p, '[100%] Training selesai!'])
      setResult(res); show('Model berhasil dilatih', 'success')
    } catch (err) {
      clearInterval(ticker)
      const msg = (err as Error).message
      setLog((p) => [
        ...p,
        `[ERROR] ${msg}`,
        ...(msg.includes('404') || msg.includes('500')
          ? ['[INFO] Endpoint /api/model/train belum tersedia.', '[INFO] Tambahkan routes/model.py dan daftarkan di app.py.']
          : []),
      ])
      show(msg, 'error')
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 border border-inkwell-violet p-5">
        <p className="font-roobert font-bold text-body text-inkwell-violet">Konfigurasi Model</p>

        <div>
          <p className="font-roobert text-body-sm text-inkwell-violet mb-2">Algoritma</p>
          <div className="flex flex-col gap-2">
            {([{ value: 'random_forest', label: 'Random Forest' }, { value: 'gradient_boosting', label: 'Gradient Boosting' }] as { value: TrainRequest['model_type']; label: string }[]).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="model_type" value={value} checked={modelType === value} onChange={() => setModelType(value)} className="accent-inkwell-violet" />
                <span className="font-roobert text-body-sm text-inkwell-violet">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <SliderField label="n_estimators" value={nEstimators} min={50} max={500} step={50} onChange={setNEstimators} />
          <SliderField label="max_depth"    value={maxDepth}    min={3}  max={20}  step={1}  onChange={setMaxDepth}    />
          <SliderField label="test_size"    value={testSize}    min={0.1} max={0.3} step={0.05} onChange={setTestSize} format={(v) => `${Math.round(v * 100)}%`} />
        </div>

        <Button variant="primary" fullWidth onClick={handleTrain} disabled={training}>
          {training ? 'Training...' : 'Train Model'}
        </Button>
      </div>

      {log.length > 0 && (
        <div>
          <div className="h-2 bg-inkwell-violet/10 mb-3">
            <div className="h-full bg-teal-basin transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="bg-inkwell-violet p-4 font-supply text-body-sm text-pure-white max-h-40 overflow-y-auto flex flex-col gap-0.5">
            {log.map((line, idx) => (
              <span key={idx} className={line.startsWith('[ERROR]') ? 'text-glow-yellow' : line.startsWith('[INFO]') ? 'text-pure-white/50' : ''}>
                {line}
              </span>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(result.metrics).map(([k, v]) => (
              <Card key={k}>
                <p className="font-roobert text-xs text-inkwell-violet/60 uppercase">{k}</p>
                <p className="font-supply text-heading-sm text-inkwell-violet">{v.toFixed(4)}</p>
              </Card>
            ))}
          </div>
          <Card>
            <p className="font-roobert font-bold text-body-sm text-inkwell-violet mb-3">Feature Importance</p>
            <BarChart
              labels={Object.keys(result.feature_importance)}
              datasets={[{ label: 'Importance', data: Object.values(result.feature_importance), backgroundColor: '#19615ccc', borderColor: '#19615c' }]}
              horizontal height={280}
            />
          </Card>
          <p className="font-roobert text-body-sm text-inkwell-violet/60">
            Training: {result.training_samples} sampel | Testing: {result.test_samples} sampel
          </p>
        </div>
      )}
    </div>
  )
}
