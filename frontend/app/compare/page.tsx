'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ProductTable from '@/components/features/compare/ProductTable'
import CompareChart from '@/components/features/compare/CompareChart'
import RadarChart from '@/components/charts/RadarChart'
import Skeleton from '@/components/ui/Skeleton'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { Product, TonicityStatus, Components } from '@/lib/api'

type FilterStatus = 'all' | TonicityStatus
type SortKey = 'calculated_osmolarity' | 'rei_score' | 'name'

const RADAR_LABELS = ['Na (mmol/L)', 'K (mmol/L)', 'Glucose (mmol/L)', 'REI Score', 'Tonicity']
const toRadarData  = (p: Product) => [p.na_mmol_L, p.k_mmol_L, p.glucose_mmol_L, p.rei_score, p.effective_tonicity / 4]

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',        label: 'Semua'     },
  { value: 'isotonic',   label: 'Isotonic'  },
  { value: 'hypertonic', label: 'Hypertonic'},
  { value: 'hypotonic',  label: 'Hypotonic' },
]

const EMPTY_COMP = { NaCl: '', KCl: '', glucose: '', sucrose: '', Na_citrate: '' }

export default function ComparePage() {
  const [products,     setProducts]     = useState<Product[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState<FilterStatus>('all')
  const [sort,         setSort]         = useState<SortKey>('calculated_osmolarity')
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [showAddForm,  setShowAddForm]  = useState(false)
  const [addName,      setAddName]      = useState('')
  const [addVolume,    setAddVolume]    = useState('500')
  const [addComp,      setAddComp]      = useState(EMPTY_COMP)
  const [addLoading,   setAddLoading]   = useState(false)
  const { show } = useToast()

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await api.getProducts()) } catch { /* offline */ } finally { setLoading(false) }
  }

  useEffect(() => { loadProducts() }, [])

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) { next.delete(name) }
      else if (next.size < 4) { next.add(name) }
      else { show('Maksimal 4 produk untuk radar chart', 'warning') }
      return next
    })
  }

  const filtered = products
    .filter((p) => filter === 'all' || p.tonicity_status === filter)
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : b[sort] - a[sort])

  const selectedProducts = products.filter((p) => selected.has(p.name))

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!addName.trim()) { show('Nama produk tidak boleh kosong', 'warning'); return }
    setAddLoading(true)
    try {
      const components: Components = {
        NaCl:       parseFloat(addComp.NaCl)       || 0,
        KCl:        parseFloat(addComp.KCl)        || 0,
        glucose:    parseFloat(addComp.glucose)    || 0,
        sucrose:    parseFloat(addComp.sucrose)    || 0,
        Na_citrate: parseFloat(addComp.Na_citrate) || 0,
      }
      await api.addProduct({ name: addName.trim(), components, volume_mL: parseFloat(addVolume) || 500 })
      show(`Produk "${addName}" berhasil ditambahkan`, 'success')
      setAddName(''); setAddComp(EMPTY_COMP); setShowAddForm(false)
      loadProducts()
    } catch (err) {
      show((err as Error).message, 'error')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="py-10 flex flex-col gap-10">
      <div>
        <h1 className="font-roobert font-bold text-heading text-inkwell-violet">Komparasi Produk</h1>
        <p className="font-roobert text-body text-inkwell-violet/60 mt-2 max-w-xl">
          Bandingkan osmolaritas dan efektivitas rehidrasi semua produk. Pilih hingga 4 produk untuk radar chart multi-dimensi.
        </p>
      </div>

      {/* Filter & sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 border border-inkwell-violet font-roobert text-body-sm transition-colors ${
                filter === value ? 'bg-teal-basin text-pure-white' : 'text-inkwell-violet hover:bg-glow-yellow/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-roobert text-body-sm text-inkwell-violet/60">Urutkan:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-inkwell-violet bg-pure-white px-3 py-2 font-roobert text-body-sm text-inkwell-violet outline-none"
          >
            <option value="calculated_osmolarity">Osmolaritas</option>
            <option value="rei_score">REI Score</option>
            <option value="name">Nama</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <div>
          <p className="font-roobert text-body-sm text-inkwell-violet/60 mb-2">
            {filtered.length} produk — klik baris untuk memilih (max 4 untuk radar chart)
          </p>
          <ProductTable products={filtered} selectedNames={selected} onToggleSelect={toggleSelect} />
        </div>
      )}

      {/* Bar chart */}
      <section className="bg-teal-basin p-6">
        <h2 className="font-roobert font-bold text-heading text-pure-white mb-6">Osmolarity vs Tonicity</h2>
        <CompareChart products={filtered} />
      </section>

      {/* Radar chart */}
      {selectedProducts.length > 0 && (
        <Card>
          <h2 className="font-roobert font-bold text-subheading text-inkwell-violet mb-4">
            Radar Chart — {selectedProducts.map((p) => p.name).join(', ')}
          </h2>
          <RadarChart labels={RADAR_LABELS} datasets={selectedProducts.map((p) => ({ label: p.name, data: toRadarData(p) }))} height={380} />
        </Card>
      )}

      {/* Add product */}
      <div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="border border-inkwell-violet px-5 py-2.5 font-roobert text-body-sm text-inkwell-violet hover:bg-inkwell-violet hover:text-pure-white transition-colors"
        >
          {showAddForm ? '✕ Tutup Form' : '+ Tambah Produk Baru'}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddProduct} className="mt-4 border border-inkwell-violet p-6 animate-fade-in-up">
            <p className="font-roobert font-bold text-body text-inkwell-violet mb-4">Tambah Produk Baru</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-roobert text-body-sm text-inkwell-violet mb-1">Nama Produk *</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="cth. Aquarius 500mL"
                  className="w-full border border-inkwell-violet bg-pure-white px-3 py-2 font-roobert text-body-sm outline-none focus:ring-1 focus:ring-inkwell-violet" />
              </div>
              <div>
                <label className="block font-roobert text-body-sm text-inkwell-violet mb-1">Volume (mL)</label>
                <input type="number" value={addVolume} onChange={(e) => setAddVolume(e.target.value)}
                  className="w-full border border-inkwell-violet bg-pure-white px-3 py-2 font-supply text-body-sm outline-none focus:ring-1 focus:ring-inkwell-violet" />
              </div>
              {(Object.keys(EMPTY_COMP) as (keyof typeof EMPTY_COMP)[]).map((k) => (
                <div key={k}>
                  <label className="block font-roobert text-body-sm text-inkwell-violet mb-1">{k} (gram)</label>
                  <input type="number" min="0" step="any" placeholder="0" value={addComp[k]}
                    onChange={(e) => setAddComp((p) => ({ ...p, [k]: e.target.value }))}
                    className="w-full border border-inkwell-violet bg-pure-white px-3 py-2 font-supply text-body-sm outline-none focus:ring-1 focus:ring-inkwell-violet" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <Button type="submit" variant="primary" disabled={addLoading}>{addLoading ? 'Menyimpan...' : 'Tambah Produk'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Batal</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
