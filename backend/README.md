# HydraCheck — Backend

Python + Flask REST API. Menangani kalkulasi kimia larutan (osmolaritas, tonisitas efektif, REI), pipeline machine learning (training dan prediksi), dan manajemen dataset CSV.

---

## Instalasi

```bash
cd backend
pip install -r requirements.txt
```

---

## Menjalankan Server

```bash
FLASK_APP=app.py flask run --port 5001
```

Server berjalan di `http://localhost:5001`.

Port 5000 dipakai macOS AirPlay Receiver, gunakan 5001. Frontend sudah dikonfigurasi untuk proxy ke port ini.

---

## Generate Dataset (satu kali)

Jika `data/dataset.csv` kosong atau belum ada:

```bash
cd backend
python scripts/generate_dataset.py
```

Menghasilkan 528 baris dari tiga sumber: 7 produk komersial, 21 variasi ORS literatur, dan 500 formula sintetis dari grid search.

---

## Struktur Folder

```
backend/
├── app.py                  # Entry point Flask — mendaftarkan semua blueprint
├── requirements.txt
├── core/                   # Engine kalkulasi kimia
│   ├── constants.py        # VAN_HOFF, MW, PLASMA_MIN/MAX
│   ├── osmolarity.py       # Kalkulasi osmolaritas + konversi ion
│   ├── tonicity.py         # Tonisitas efektif (impermeant solutes only)
│   ├── sglt1_model.py      # Model absorpsi SGLT1
│   ├── rei.py              # Rehydration Effectiveness Index
│   └── recommender.py      # Rekomendasi penyesuaian formula
├── routes/
│   ├── calculator.py       # POST /api/calculate
│   ├── products.py         # GET|POST /api/products
│   ├── dataset.py          # GET|POST /api/dataset
│   └── model.py            # POST /api/model/train + /predict
├── ml/
│   ├── train.py            # Pipeline training RF/GB, simpan .pkl
│   ├── predict.py          # Load model, prediksi REI
│   ├── saved_model.pkl     # Dibuat setelah training pertama
│   ├── training_log.json   # Metrik training terakhir
│   └── feature_importance.json
├── scripts/
│   └── generate_dataset.py # One-time dataset generation
└── data/
    ├── products_db.csv     # Komposisi produk dalam gram
    └── dataset.csv         # Dataset ML (528 baris)
```

---

## Komponen yang Didukung

| Key | Senyawa | Berat Molekul |
|---|---|---|
| `NaCl` | Natrium klorida | 58.44 g/mol |
| `KCl` | Kalium klorida | 74.55 g/mol |
| `glucose` | Glukosa | 180.16 g/mol |
| `sucrose` | Sukrosa | 342.30 g/mol |
| `fructose` | Fruktosa | 180.16 g/mol |
| `Na_citrate` | Trisodium sitrat | 294.10 g/mol |

---