# HydraCheck — Frontend

Next.js 14 App Router. Semua request ke backend Flask dilakukan melalui proxy `/api/*` yang dikonfigurasi di `next.config.ts` — frontend tidak perlu tahu port backend secara langsung.

---

## Prasyarat

- Node.js 18+
- Backend Flask berjalan di `http://localhost:5001` (lihat `backend/README.md`)

---

## Instalasi dan Menjalankan

```bash
cd frontend
npm install
npm run dev
```

Akses di `http://localhost:3000`.

---

## Halaman

| Route | Fungsi |
|---|---|
| `/` | Dashboard — gambaran umum semua produk, chart osmolaritas vs standar WHO |
| `/calculator` | Kalkulator osmolaritas, tonisitas efektif, phantom osmolarity, dan REI dari komposisi custom |
| `/compare` | Komparasi semua produk — tabel interaktif, grouped bar chart, radar chart multi-produk |
| `/ml` | Tiga tab: Dataset (lihat/upload/download), Training (latih model, lihat metrik), Prediksi (ML vs kalkulasi manual) |
| `/about` | Penjelasan singkat HydraCheck dan tim |

---

## Struktur Komponen

```
components/
├── layout/
│   ├── Sidebar.tsx         # Navigasi desktop
│   └── BottomNav.tsx       # Navigasi mobile
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx           # Status badge: isotonic / hypertonic / hypotonic
│   ├── Toast.tsx
│   └── Skeleton.tsx
├── charts/
│   ├── BarChart.tsx        # Bar chart osmolaritas (dengan reference lines)
│   └── RadarChart.tsx      # Radar chart multi-produk
└── features/
    ├── calculator/
    │   ├── InputForm.tsx   # Form komposisi minuman
    │   └── ResultPanel.tsx # Hasil analisis + REI + rekomendasi
    ├── compare/
    │   ├── ProductTable.tsx
    │   └── CompareChart.tsx
    └── ml/
        ├── DatasetTab.tsx
        ├── TrainingTab.tsx
        └── PredictTab.tsx
```

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Jalankan production build
npm run lint     # ESLint check
```

---

## Catatan

- Tab **Prediksi** di `/ml` membutuhkan model yang sudah dilatih. Latih dulu via tab Training sebelum mencoba prediksi.
