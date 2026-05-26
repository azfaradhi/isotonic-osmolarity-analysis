# HydraCheck - Frontend

Frontend HydraCheck dibangun dengan Next.js App Router dan mengikuti design system pada `prompts/DESIGN.md`.
Semua data diambil dari backend Flask melalui proxy `/api/*` (lihat `next.config.ts`).

## Prasyarat
- Node.js 18+
- Backend Flask berjalan di `http://localhost:5001`

## Menjalankan Development Server
```bash
cd frontend
npm install
npm run dev
```

Akses aplikasi di `http://localhost:3000`.

## Struktur Halaman Utama
- `/` — Dashboard
- `/calculator` — Kalkulator osmolaritas & REI
- `/compare` — Komparasi produk
- `/ml` — Dataset, training, dan prediksi ML
- `/about` — Penjelasan singkat HydraCheck

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```
