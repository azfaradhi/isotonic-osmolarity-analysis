# HydraCheck

Sistem komputasional berbasis web untuk menganalisis efektivitas rehidrasi minuman. HydraCheck menghitung osmolaritas, tonisitas efektif, dan **Rehydration Effectiveness Index (REI)** dari komposisi kimia minuman, baik produk komersial maupun oralit rumahan, lalu melatih model machine learning untuk memprediksi REI langsung dari data label nutrisi.

---

## Latar Belakang

Minuman berlabel "isotonik" tidak selalu isotonik secara fisiologis. Ada perbedaan krusial antara **osmolaritas total** (semua solute) dan **tonisitas efektif** (hanya solute impermeant seperti Na dan K). Glukosa dan sukrosa berkontribusi besar pada osmolaritas total, tapi karena bersifat permeant dan dimetabolisme, tidak memengaruhi pergerakan air melintasi membran sel secara efektif. Selisih keduanya disebut **phantom osmolarity** dan tidak pernah terlihat di label produk manapun.

HydraCheck mengisi gap ini dengan menghitung, memvisualisasikan, dan memodelkan perbedaan tersebut untuk semua produk yang umum dikonsumsi di Indonesia.

**Pertanyaan penelitian:**
> Apakah komposisi kimia minuman rehidrasi komersial dan rumahan di Indonesia memenuhi syarat fisiologis absorpsi cairan yang optimal dan bisakah model machine learning memprediksi efektivitasnya langsung dari data label nutrisi?

---

## Fitur Utama

- Kalkulasi osmolaritas, tonisitas efektif, dan phantom osmolarity dari komposisi minuman
- Simplified SGLT1 absorption model berbasis mekanisme ko-transport Na-Glukosa
- Rehydration Effectiveness Index (REI)  skor komposit 0–100 dengan empat kategori: Poor, Fair, Good, Excellent
- Rekomendasi penyesuaian formula (tambah air, tambah NaCl) berbasis target tonisitas
- Komparasi visual semua produk dengan bar chart dan radar chart
- Pipeline machine learning: Random Forest dan Gradient Boosting untuk prediksi REI dari label nutrisi
- Dataset 528 baris yang mencakup produk komersial, ORS literatur, dan formula sintetis

---

## Hasil Machine Learning

Model Random Forest dilatih dengan 8 fitur komposisi kimia (tanpa feature leakage).

| Metrik | Nilai |
|---|---|
| R² | 0.97 |
| MAE | 1.71 poin REI |
| RMSE | 2.78 |
| Ukuran dataset | 528 baris |
| Waktu training | ~5 detik |

Feature importance tertinggi: `calculated_osmolarity` (24.6%), `glucose_mmol_L` (22.5%), `phantom_osmolarity` (21.3%), `na_mmol_L` (12.8%) — konsisten dengan teori biologi SGLT1.

---

## Produk dalam Database

| Produk | REI | Kategori |
|---|---|---|
| Pharolit ORS | 66.0 | Good |
| WHO ORS | 64.3 | Good |
| Oralit Rumahan | 53.3 | Fair |
| Gatorade | 40.7 | Fair |
| Pocari Sweat | 42.9 | Fair |
| Mizone | 39.2 | Poor |
| Hydro Coco | 37.7 | Poor |

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Chart.js |
| Backend | Python, Flask, Flask-CORS |
| Komputasi | pandas, numpy |
| Machine Learning | scikit-learn (RandomForestRegressor, GradientBoostingRegressor), joblib |

---

## Cara Menjalankan

### Prasyarat
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
FLASK_APP=app.py flask run --port 5001
```

Backend berjalan di `http://localhost:5001`.

Jika dataset kosong, generate terlebih dahulu:
```bash
cd backend
python scripts/generate_dataset.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`. Semua request `/api/*` di-proxy otomatis ke backend.

### 3. Training Model ML (via UI)

Buka `http://localhost:3000/ml`, masuk ke tab **Training**, lalu klik **Train Model**. Model tersimpan di `backend/ml/saved_model.pkl` dan dapat dipakai langsung di tab **Prediksi**.

---

## Struktur Proyek

```
hydracheck/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── core/                  # Engine kalkulasi kimia
│   │   ├── osmolarity.py
│   │   ├── tonicity.py
│   │   ├── sglt1_model.py
│   │   ├── rei.py
│   │   └── recommender.py
│   ├── routes/                # REST API endpoints
│   │   ├── calculator.py
│   │   ├── products.py
│   │   ├── dataset.py
│   │   └── model.py
│   ├── ml/                    # Pipeline machine learning
│   │   ├── train.py
│   │   └── predict.py
│   ├── scripts/
│   │   └── generate_dataset.py
│   └── data/
│       ├── products_db.csv
│       └── dataset.csv
│
└── frontend/
    ├── app/
    │   ├── page.tsx            # Dashboard
    │   ├── calculator/         # Kalkulator REI
    │   ├── compare/            # Komparasi produk
    │   ├── ml/                 # Dataset, training, prediksi
    │   └── about/
    ├── components/
    ├── lib/api.ts              # Client API ke backend
    └── next.config.ts          # Proxy /api/* ke localhost:5001
```

---

## Referensi Ilmiah

- Tóth et al. (2024). *Osmolality and Tonicity of Isotonic Beverages*. Foods, MDPI. PMC11120308
- Bhattacharya et al. (2019). *Osmolality of Commercially Available ORS*. PMC6682936
- Rao et al. (2020). *Potency of ORS in Inducing Fluid Absorption*. Scientific Reports
- Maughan et al. (2023). *Compositional Aspects of Hydration Beverages*. Nutrients. PMC10781183
- WHO (2006). *Oral Rehydration Salts Formulation*. WHO/FCH/CAH/06.1
