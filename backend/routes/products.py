import os
import pandas as pd
from flask import Blueprint, request, jsonify
from core.osmolarity import validate_input, calculate_osmolarity, components_to_ions
from core.tonicity import calculate_effective_tonicity, classify_tonicity
from core.sglt1_model import calculate_absorption_score
from core.rei import calculate_rei

bp = Blueprint("products", __name__)

_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "products_db.csv")
_COMPONENT_COLS = ["NaCl_g", "KCl_g", "glucose_g", "sucrose_g", "fructose_g", "Na_citrate_g"]


def _row_to_components(row: pd.Series) -> dict:
    return {
        col.replace("_g", ""): float(row.get(col, 0) or 0)
        for col in _COMPONENT_COLS
    }


def _compute_product(name: str, components: dict, volume_mL: float) -> dict:
    osm    = calculate_osmolarity(components, volume_mL)
    ton    = calculate_effective_tonicity(components, volume_mL)
    ions   = components_to_ions(components, volume_mL)
    sglt1  = calculate_absorption_score(ions["na_mmol_L"], ions["glucose_mmol_L"], ton["effective_tonicity"])
    rei    = calculate_rei(ton["effective_tonicity"], ions["na_mmol_L"], ions["glucose_mmol_L"], sglt1["absorption_score"])

    return {
        "name":                  name,
        "calculated_osmolarity": osm["calculated_osmolarity"],
        "effective_tonicity":    ton["effective_tonicity"],
        "phantom_osmolarity":    ton["phantom_osmolarity"],
        "osmolarity_status":     classify_tonicity(osm["calculated_osmolarity"]),
        "tonicity_status":       ton["tonicity_status"],
        "na_mmol_L":             ions["na_mmol_L"],
        "k_mmol_L":              ions["k_mmol_L"],
        "glucose_mmol_L":        ions["glucose_mmol_L"],
        "na_glucose_ratio":      sglt1["na_glucose_ratio"],
        "absorption_score":      sglt1["absorption_score"],
        "rei_score":             rei["rei_score"],
        "rei_label":             rei["rei_label"],
        "volume_mL":             volume_mL,
    }


@bp.get("/api/products")
def get_products():
    try:
        df = pd.read_csv(_DB_PATH)
    except FileNotFoundError:
        return jsonify([])

    results = []
    for _, row in df.iterrows():
        components = _row_to_components(row)
        volume_mL  = float(row.get("volume_mL", 500))
        product    = _compute_product(str(row["name"]), components, volume_mL)
        results.append(product)

    return jsonify(results)


@bp.post("/api/products/add")
def add_product():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": True, "message": "Request body tidak valid", "code": "INVALID_INPUT"}), 400

    name       = body.get("name", "").strip()
    components = body.get("components", {})
    volume_mL  = body.get("volume_mL", 500)

    if not name:
        return jsonify({"error": True, "message": "Nama produk tidak boleh kosong", "code": "INVALID_INPUT"}), 400

    ok, msg = validate_input(components, volume_mL)
    if not ok:
        return jsonify({"error": True, "message": msg, "code": "INVALID_INPUT"}), 400

    # Build row for CSV
    new_row = {"name": name, "volume_mL": volume_mL}
    for col in _COMPONENT_COLS:
        key = col.replace("_g", "")
        new_row[col] = components.get(key, 0)

    try:
        df = pd.read_csv(_DB_PATH)
    except FileNotFoundError:
        df = pd.DataFrame(columns=["name"] + _COMPONENT_COLS + ["volume_mL"])

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(_DB_PATH, index=False)

    product = _compute_product(name, components, volume_mL)
    return jsonify({"status": "success", "product": product}), 201
