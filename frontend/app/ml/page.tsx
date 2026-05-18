'use client'

import { useEffect, useState } from 'react'
import DatasetTab from '@/components/features/ml/DatasetTab'
import TrainingTab from '@/components/features/ml/TrainingTab'
import PredictTab from '@/components/features/ml/PredictTab'
import { api } from '@/lib/api'
import type { DatasetResponse } from '@/lib/api'

type Tab = 'dataset' | 'training' | 'predict'

const TABS: { value: Tab; label: string }[] = [
  { value: 'dataset',  label: 'Dataset'  },
  { value: 'training', label: 'Training' },
  { value: 'predict',  label: 'Prediksi' },
]

export default function MLPage() {
  const [activeTab,      setActiveTab]      = useState<Tab>('dataset')
  const [datasetData,    setDatasetData]    = useState<DatasetResponse | null>(null)
  const [datasetLoading, setDatasetLoading] = useState(true)

  async function loadDataset() {
    setDatasetLoading(true)
    try { setDatasetData(await api.getDataset()) }
    catch { setDatasetData({ rows: [], total: 0, columns: [] }) }
    finally { setDatasetLoading(false) }
  }

  useEffect(() => { loadDataset() }, [])

  return (
    <div className="py-10 flex flex-col gap-8">
      <div>
        <h1 className="font-roobert font-bold text-heading text-inkwell-violet">ML Model</h1>
        <p className="font-roobert text-body text-inkwell-violet/60 mt-2 max-w-xl">
          Manajemen dataset, training model Random Forest / Gradient Boosting, dan prediksi REI berbasis komposisi kimia minuman.
        </p>
      </div>

      <div className="flex border-b border-inkwell-violet">
        {TABS.map(({ value, label }) => {
          const active = activeTab === value
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`px-6 py-3 font-roobert text-body-sm transition-colors ${
                active ? 'border-b-2 border-inkwell-violet font-bold text-inkwell-violet -mb-px' : 'text-inkwell-violet/60 hover:text-inkwell-violet'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div>
        {activeTab === 'dataset'  && <DatasetTab data={datasetData} loading={datasetLoading} onRefresh={loadDataset} />}
        {activeTab === 'training' && <TrainingTab />}
        {activeTab === 'predict'  && <PredictTab />}
      </div>
    </div>
  )
}
