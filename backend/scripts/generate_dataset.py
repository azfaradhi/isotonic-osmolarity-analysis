import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

import numpy as np
import pandas as pd

from core.osmolarity import calculate_osmolarity, components_to_ions
from core.tonicity import calculate_effective_tonicity
from core.sglt1_model import calculate_absorption_score
from core.rei import calculate_rei
from core.constants import MW

OUTPUT_PATH      = os.path.join(BACKEND_DIR, "data", "dataset.csv")
PRODUCTS_DB_PATH = os.path.join(BACKEND_DIR, "data", "products_db.csv")

_COMPONENT_COLS = ["NaCl_g", "KCl_g", "glucose_g", "sucrose_g", "fructose_g", "Na_citrate_g"]


def compute_row(name: str, components: dict, volume_mL: float, source: str) -> dict:
    osm   = calculate_osmolarity(components, volume_mL)
    ton   = calculate_effective_tonicity(components, volume_mL)
    ions  = components_to_ions(components, volume_mL)
    sglt1 = calculate_absorption_score(
        ions["na_mmol_L"], ions["glucose_mmol_L"], ton["effective_tonicity"]
    )
    rei   = calculate_rei(
        ton["effective_tonicity"],
        ions["na_mmol_L"],
        ions["glucose_mmol_L"],
        sglt1["absorption_score"],
    )
    return {
        "product_name":          name,
        "na_mmol_L":             ions["na_mmol_L"],
        "k_mmol_L":              ions["k_mmol_L"],
        "cl_mmol_L":             ions["cl_mmol_L"],
        "glucose_mmol_L":        ions["glucose_mmol_L"],
        "sucrose_mmol_L":        ions["sucrose_mmol_L"],
        "na_glucose_ratio":      sglt1["na_glucose_ratio"],
        "calculated_osmolarity": osm["calculated_osmolarity"],
        "effective_tonicity":    ton["effective_tonicity"],
        "phantom_osmolarity":    ton["phantom_osmolarity"],
        "absorption_score":      sglt1["absorption_score"],
        "rei_score":             rei["rei_score"],
        "rei_category":          rei["rei_label"],
        "tonicity_category":     ton["tonicity_status"],
        "source":                source,
    }


def generate_commercial():
    rows = []
    try:
        df = pd.read_csv(PRODUCTS_DB_PATH)
    except FileNotFoundError:
        print("  [WARN] products_db.csv not found, skipping commercial rows")
        return rows
    for _, row in df.iterrows():
        components = {
            col.replace("_g", ""): float(row.get(col, 0) or 0)
            for col in _COMPONENT_COLS
        }
        volume_mL = float(row.get("volume_mL", 500))
        rows.append(compute_row(str(row["name"]), components, volume_mL, "commercial"))
    return rows


def generate_ors_literature():
    # (name, NaCl_g, KCl_g, glucose_g, sucrose_g, Na_citrate_g, volume_mL)
    # Sources: PMC6682936, Scientific Reports 2020, WHO ORS 2006
    variants = [
        # WHO ORS dilution series — testing sensitivity
        ("WHO ORS 50% Dilution",         1.30, 0.75,  6.75,  0.0, 1.45, 1000),
        ("WHO ORS 75% Dilution",         1.95, 1.13, 10.13,  0.0, 2.18, 1000),
        ("WHO ORS 125% Concentration",   3.25, 1.88, 16.88,  0.0, 3.63, 1000),
        ("WHO ORS 150% Concentration",   3.90, 2.25, 20.25,  0.0, 4.35, 1000),
        # Classic high-osmolarity WHO ORS (pre-2003)
        ("Classic WHO ORS High-Osm",     3.50, 1.50, 20.00,  0.0, 2.90, 1000),
        # Pediatric ORS literature (Pedialyte-like, PMC6682936)
        ("ORS Pediatrik Standard",       1.17, 0.75, 25.00,  0.0, 0.00, 1000),
        ("ORS Pediatrik Low-Osm",        0.88, 0.75, 20.00,  0.0, 0.00, 1000),
        # Homemade oralit — variasi takaran rumah tangga Indonesia
        ("Oralit Rumahan 0.5sdt+4sdt",   1.50, 0.00,  0.00, 24.00, 0.00, 1000),
        ("Oralit Rumahan 0.5sdt+6sdt",   1.50, 0.00,  0.00, 36.00, 0.00, 1000),
        ("Oralit Rumahan 1sdt+4sdt",     3.00, 0.00,  0.00, 24.00, 0.00, 1000),
        ("Oralit Rumahan 1sdt+8sdt",     3.00, 0.00,  0.00, 48.00, 0.00, 1000),
        ("Oralit Kurang Garam",          0.75, 0.00,  0.00, 20.00, 0.00, 1000),
        ("Oralit Terlalu Asin",          4.50, 0.00,  0.00, 20.00, 0.00, 1000),
        ("Oralit Tanpa Gula",            1.50, 0.00,  0.00,  0.00, 0.00, 1000),
        ("Oralit Terlalu Manis",         1.50, 0.00,  0.00, 60.00, 0.00, 1000),
        ("Oralit Glukosa Optimal",       2.19, 0.75, 13.50,  0.00, 0.00, 1000),
        # High-K variant (literature)
        ("ORS Tinggi Kalium",            1.17, 2.24, 20.00,  0.00, 0.00, 1000),
        # Low-Na sports-style (poor rehydration)
        ("Sports Drink Low-Na",          0.29, 0.19,  0.00, 30.00, 0.00,  500),
        # Medical high-Na ORS
        ("ORS Medis Tinggi Na",          5.26, 1.50, 20.00,  0.00, 0.00, 1000),
        # Balanced mid-range
        ("ORS Seimbang",                 2.00, 1.00, 10.00,  0.00, 1.50, 1000),
        ("ORS Rendah Osmolaritas",       1.75, 0.75,  9.00,  0.00, 1.45, 1000),
    ]
    rows = []
    for name, NaCl_g, KCl_g, glucose_g, sucrose_g, Na_citrate_g, vol in variants:
        components = {
            "NaCl": NaCl_g, "KCl": KCl_g,
            "glucose": glucose_g, "sucrose": sucrose_g,
            "Na_citrate": Na_citrate_g,
        }
        rows.append(compute_row(name, components, float(vol), "homemade"))
    return rows


def generate_synthetic():
    na_levels = [5, 15, 30, 50, 70, 90, 110, 130, 150, 170]
    k_levels  = [0, 5, 10, 15, 20]
    gl_levels = np.arange(5, 100, 10).tolist()   # [5,15,25,...,95]

    rows = []
    for na in na_levels:
        for k in k_levels:
            for gl in gl_levels:
                components = {
                    "NaCl":    float(na) * MW["NaCl"]    / 1000,
                    "KCl":     float(k)  * MW["KCl"]     / 1000,
                    "glucose": float(gl) * MW["glucose"] / 1000,
                }
                name = f"Synthetic_Na{int(na)}_K{int(k)}_Gl{int(gl)}"
                rows.append(compute_row(name, components, 1000.0, "synthetic"))
    return rows


def main():
    print("Generating HydraCheck ML dataset...")

    commercial  = generate_commercial()
    print(f"  Commercial products  : {len(commercial):>4} rows")

    literature  = generate_ors_literature()
    print(f"  ORS / homemade       : {len(literature):>4} rows")

    synthetic   = generate_synthetic()
    print(f"  Synthetic grid       : {len(synthetic):>4} rows")

    all_rows = commercial + literature + synthetic
    df = pd.DataFrame(all_rows)
    df.to_csv(OUTPUT_PATH, index=False)

    print(f"\nSaved → {OUTPUT_PATH}")
    print(f"Total rows : {len(df)}")
    print(f"\nREI category distribution:")
    print(df["rei_category"].value_counts().to_string())
    print(f"\nTonicity distribution:")
    print(df["tonicity_category"].value_counts().to_string())
    print(f"\nSource distribution:")
    print(df["source"].value_counts().to_string())


if __name__ == "__main__":
    main()
