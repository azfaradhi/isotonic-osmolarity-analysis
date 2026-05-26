import os
import io
import pandas as pd
from flask import Blueprint, request, jsonify, send_file
from core.osmolarity import validate_input, calculate_osmolarity, components_to_ions
from core.tonicity import calculate_effective_tonicity
from core.sglt1_model import calculate_absorption_score
from core.rei import calculate_rei

bp = Blueprint("dataset", __name__)

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")

_EXPECTED_COLS = [
    "product_name", "na_mmol_L", "k_mmol_L", "cl_mmol_L",
    "glucose_mmol_L", "sucrose_mmol_L", "na_glucose_ratio",
    "calculated_osmolarity", "effective_tonicity", "phantom_osmolarity",
    "absorption_score", "rei_score", "rei_category", "tonicity_category", "source",
]


def _build_dataset_row(product_name: str, components: dict, volume_mL: float, source: str) -> dict:
    osm = calculate_osmolarity(components, volume_mL)
    ton = calculate_effective_tonicity(components, volume_mL)
    ions = components_to_ions(components, volume_mL)
    sglt1 = calculate_absorption_score(ions["na_mmol_L"], ions["glucose_mmol_L"], ton["effective_tonicity"])
    rei = calculate_rei(ton["effective_tonicity"], ions["na_mmol_L"], ions["glucose_mmol_L"], sglt1["absorption_score"])

    return {
        "product_name":        product_name,
        "na_mmol_L":           ions["na_mmol_L"],
        "k_mmol_L":            ions["k_mmol_L"],
        "cl_mmol_L":           ions["cl_mmol_L"],
        "glucose_mmol_L":      ions["glucose_mmol_L"],
        "sucrose_mmol_L":      ions["sucrose_mmol_L"],
        "na_glucose_ratio":    sglt1["na_glucose_ratio"],
        "calculated_osmolarity": osm["calculated_osmolarity"],
        "effective_tonicity":  ton["effective_tonicity"],
        "phantom_osmolarity":  ton["phantom_osmolarity"],
        "absorption_score":    sglt1["absorption_score"],
        "rei_score":           rei["rei_score"],
        "rei_category":        rei["rei_label"],
        "tonicity_category":   ton["tonicity_status"],
        "source":              source,
    }


@bp.get("/api/dataset")
def get_dataset():
    try:
        df = pd.read_csv(_DATASET_PATH)
    except FileNotFoundError:
        return jsonify({"rows": [], "total": 0, "columns": _EXPECTED_COLS})

    preview = df.head(50).fillna("").to_dict(orient="records")
    return jsonify({"rows": preview, "total": len(df), "columns": list(df.columns)})


@bp.post("/api/dataset/upload")
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"error": True, "message": "Tidak ada file yang diupload", "code": "NO_FILE"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": True, "message": "File harus berformat CSV", "code": "INVALID_FORMAT"}), 400

    try:
        new_df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": True, "message": f"Gagal membaca CSV: {str(e)}", "code": "PARSE_ERROR"}), 400

    try:
        existing_df = pd.read_csv(_DATASET_PATH)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
    except FileNotFoundError:
        combined_df = new_df

    combined_df.to_csv(_DATASET_PATH, index=False)
    return jsonify({"status": "success", "rows_added": len(new_df), "total": len(combined_df)})


@bp.post("/api/dataset/add")
def add_dataset_row():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": True, "message": "Request body tidak valid", "code": "INVALID_INPUT"}), 400

    product_name = (body.get("product_name") or "").strip()
    components = body.get("components", {})
    volume_mL = body.get("volume_mL", 0)
    source = (body.get("source") or "homemade").strip()

    if not product_name:
        return jsonify({"error": True, "message": "Nama sampel tidak boleh kosong", "code": "INVALID_INPUT"}), 400

    ok, msg = validate_input(components, volume_mL)
    if not ok:
        return jsonify({"error": True, "message": msg, "code": "INVALID_INPUT"}), 400

    new_row = _build_dataset_row(product_name, components, volume_mL, source)

    try:
        df = pd.read_csv(_DATASET_PATH)
    except FileNotFoundError:
        df = pd.DataFrame(columns=_EXPECTED_COLS)

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df = df.reindex(columns=_EXPECTED_COLS)
    df.to_csv(_DATASET_PATH, index=False)

    return jsonify({"status": "success", "row": new_row, "total": len(df)}), 201


@bp.get("/api/dataset/download")
def download_dataset():
    if not os.path.exists(_DATASET_PATH):
        return jsonify({"error": True, "message": "Dataset belum tersedia", "code": "NOT_FOUND"}), 404

    return send_file(
        _DATASET_PATH,
        mimetype="text/csv",
        as_attachment=True,
        download_name="hydracheck_dataset.csv",
    )
