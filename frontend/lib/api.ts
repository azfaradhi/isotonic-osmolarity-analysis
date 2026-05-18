const BASE = '/api'

export type TonicityStatus = 'hypotonic' | 'isotonic' | 'hypertonic'
export type ReiLabel = 'Poor' | 'Fair' | 'Good' | 'Excellent'
export type AbsorptionLabel = 'Low' | 'Moderate' | 'High'

export interface Components {
  NaCl?: number
  KCl?: number
  glucose?: number
  sucrose?: number
  fructose?: number
  Na_citrate?: number
}

export interface CalculateRequest {
  components: Components
  volume_mL: number
}

export interface CalculateResult {
  calculated_osmolarity: number
  effective_tonicity: number
  phantom_osmolarity: number
  osmolarity_status: TonicityStatus
  tonicity_status: TonicityStatus
  na_mmol_L: number
  k_mmol_L: number
  glucose_mmol_L: number
  na_glucose_ratio: number
  osmotic_gradient: number
  absorption_score: number
  absorption_label: AbsorptionLabel
  rei_score: number
  rei_label: ReiLabel
  component_scores: {
    tonicity_score: number
    na_glucose_score: number
    absorption_score: number
  }
  recommendations: string[]
  component_breakdown: Record<string, number>
}

export interface Product {
  name: string
  calculated_osmolarity: number
  effective_tonicity: number
  phantom_osmolarity: number
  osmolarity_status: TonicityStatus
  tonicity_status: TonicityStatus
  na_mmol_L: number
  k_mmol_L: number
  glucose_mmol_L: number
  na_glucose_ratio: number
  absorption_score: number
  rei_score: number
  rei_label: ReiLabel
  volume_mL: number
}

export interface DatasetResponse {
  rows: Record<string, unknown>[]
  total: number
  columns: string[]
}

export interface TrainRequest {
  model_type: 'random_forest' | 'gradient_boosting'
  n_estimators: number
  max_depth: number
  test_size: number
}

export interface TrainResult {
  status: string
  metrics: { mae: number; rmse: number; r2: number }
  feature_importance: Record<string, number>
  training_samples: number
  test_samples: number
}

export interface PredictResult {
  predicted_rei: number
  rei_label: ReiLabel
  model_r2: number
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  calculate: (body: CalculateRequest) =>
    apiFetch<CalculateResult>('/calculate', { method: 'POST', body: JSON.stringify(body) }),

  getProducts: () => apiFetch<Product[]>('/products'),

  addProduct: (body: { name: string; components: Components; volume_mL: number }) =>
    apiFetch<{ status: string; product: Product }>('/products/add', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getDataset: () => apiFetch<DatasetResponse>('/dataset'),

  uploadDataset: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/dataset/upload`, { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload gagal' }))
      throw new Error((err as { message?: string }).message)
    }
    return res.json()
  },

  downloadDataset: () => fetch(`${BASE}/dataset/download`),

  trainModel: (body: TrainRequest) =>
    apiFetch<TrainResult>('/model/train', { method: 'POST', body: JSON.stringify(body) }),

  predictRei: (features: Record<string, number>) =>
    apiFetch<PredictResult>('/model/predict', {
      method: 'POST',
      body: JSON.stringify({ features }),
    }),
}
