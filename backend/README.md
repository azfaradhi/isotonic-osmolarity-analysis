# HydraCheck — Backend

Python + Flask REST API untuk kalkulasi osmolaritas, tonisitas efektif, dan Rehydration Effectiveness Index (REI).

## Instalasi

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Menjalankan Server

```bash
python app.py
```

Server berjalan di `http://localhost:5000`. Frontend Next.js di `localhost:3000` sudah dikonfigurasi sebagai allowed CORS origin.

---

## Endpoints

### POST `/api/calculate`

Hitung osmolaritas, tonisitas efektif, skor absorpsi SGLT1, dan REI dari komposisi minuman.

**Request Body:**
```json
{
  "components": {
    "NaCl":       0.9,
    "KCl":        0.15,
    "glucose":    5.0,
    "sucrose":    0.0,
    "fructose":   0.0,
    "Na_citrate": 0.0
  },
  "volume_mL": 200
}
```

> Semua field `components` opsional — cukup isi yang ada. Massa dalam gram, volume dalam mL.

**Response:**
```json
{
  "calculated_osmolarity": 304.87,
  "effective_tonicity":    146.53,
  "phantom_osmolarity":    158.34,
  "osmolarity_status":     "hypertonic",
  "tonicity_status":       "hypotonic",
  "na_mmol_L":             77.01,
  "k_mmol_L":              10.06,
  "glucose_mmol_L":        138.77,
  "na_glucose_ratio":      0.555,
  "osmotic_gradient":      -143.47,
  "absorption_score":      0.4167,
  "absorption_label":      "Moderate",
  "rei_score":             52.34,
  "rei_label":             "Fair",
  "component_scores": {
    "tonicity_score":   49.49,
    "na_glucose_score": 83.36,
    "absorption_score": 41.67
  },
  "recommendations": [
    "Tambahkan 3834 mg (3.83 g) NaCl untuk meningkatkan tonisitas ke range isotonic (target 290 mOsm/L)."
  ],
  "component_breakdown": {
    "NaCl": 146.53,
    "KCl":  19.11,
    "glucose": 138.77
  }
}
```

**REI Label:**

| Skor | Label |
|------|-------|
| < 40 | Poor |
| 40–60 | Fair |
| 60–80 | Good |
| > 80 | Excellent |

---

### GET `/api/products`

Ambil semua produk dari database beserta nilai yang dikalkulasi.

**Response:**
```json
[
  {
    "name":                  "WHO ORS",
    "calculated_osmolarity": 224.32,
    "effective_tonicity":    122.76,
    "phantom_osmolarity":    101.56,
    "osmolarity_status":     "hypotonic",
    "tonicity_status":       "hypotonic",
    "na_mmol_L":             74.07,
    "k_mmol_L":              20.12,
    "glucose_mmol_L":        74.93,
    "na_glucose_ratio":      0.9885,
    "absorption_score":      0.4989,
    "rei_score":             64.28,
    "rei_label":             "Good",
    "volume_mL":             1000
  }
]
```

> Nilai dikalkulasi ulang setiap request dari komposisi mentah (gram) yang tersimpan di `data/products_db.csv`.

---

### POST `/api/products/add`

Tambah produk baru ke database.

**Request Body:**
```json
{
  "name": "Minuman Custom",
  "components": {
    "NaCl":    1.2,
    "glucose": 6.0
  },
  "volume_mL": 500
}
```

**Response (`201`):**
```json
{
  "status":  "success",
  "product": { ...hasil kalkulasi... }
}
```

---

### GET `/api/dataset`

Ambil preview 50 baris pertama dataset ML.

**Response:**
```json
{
  "rows":    [ { ...row... } ],
  "total":   400,
  "columns": ["product_name", "na_mmol_L", "k_mmol_L", ...]
}
```

---

### POST `/api/dataset/add`

Tambah satu sampel baru ke dataset ML.

**Request Body:**
```json
{
  "product_name": "Minuman Custom",
  "components": {
    "NaCl": 1.2,
    "glucose": 6.0
  },
  "volume_mL": 500,
  "source": "homemade"
}
```

**Response (`201`):**
```json
{
  "status": "success",
  "row": { "...": "hasil perhitungan lengkap" },
  "total": 451
}
```

---

### POST `/api/dataset/upload`

Upload file CSV untuk menambah baris ke dataset ML (append, bukan replace).

**Request:** `multipart/form-data`, field name `file`, tipe `.csv`.

**Response:**
```json
{
  "status":     "success",
  "rows_added": 50,
  "total":      450
}
```

---

### GET `/api/dataset/download`

Unduh seluruh dataset ML sebagai file CSV.

**Response:** File `hydracheck_dataset.csv` (attachment).

---

## Komponen yang Didukung

| Key | Senyawa | Berat Molekul |
|-----|---------|---------------|
| `NaCl` | Natrium klorida | 58.44 g/mol |
| `KCl` | Kalium klorida | 74.55 g/mol |
| `glucose` | Glukosa | 180.16 g/mol |
| `sucrose` | Sukrosa | 342.30 g/mol |
| `fructose` | Fruktosa | 180.16 g/mol |
| `Na_citrate` | Trisodium sitrat | 294.10 g/mol |

---

## Format Error

Semua endpoint mengembalikan format error yang konsisten:

```json
{
  "error":   true,
  "message": "Deskripsi error yang human-readable",
  "code":    "INVALID_INPUT"
}
```

| HTTP Status | Keterangan |
|-------------|------------|
| 200 | Success |
| 201 | Resource berhasil dibuat |
| 400 | Bad Request — validasi gagal |
| 404 | Data tidak ditemukan |
| 500 | Internal Server Error |

---

## Struktur Folder

```
backend/
├── app.py                 # Entry point Flask
├── requirements.txt
├── core/
│   ├── constants.py       # VAN_HOFF, MW, PLASMA_MIN/MAX
│   ├── osmolarity.py      # Kalkulasi osmolaritas + konversi ion
│   ├── tonicity.py        # Tonisitas efektif (impermeant solutes only)
│   ├── sglt1_model.py     # Model absorpsi SGLT1
│   ├── rei.py             # Rehydration Effectiveness Index
│   └── recommender.py     # Rekomendasi penyesuaian formula
├── routes/
│   ├── calculator.py      # POST /api/calculate
│   ├── products.py        # GET|POST /api/products
│   └── dataset.py         # GET|POST /api/dataset
└── data/
    ├── products_db.csv    # Database produk (komposisi dalam gram)
    └── dataset.csv        # Dataset ML (fitur + target REI)
```
