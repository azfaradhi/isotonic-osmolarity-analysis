import os
import io
import pandas as pd
from flask import Blueprint, request, jsonify, send_file

bp = Blueprint("dataset", __name__)

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")

_EXPECTED_COLS = [
    "product_name", "na_mmol_L", "k_mmol_L", "cl_mmol_L",
    "glucose_mmol_L", "sucrose_mmol_L", "na_glucose_ratio",
    "calculated_osmolarity", "effective_tonicity", "phantom_osmolarity",
    "absorption_score", "rei_score", "rei_category", "tonicity_category", "source",
]


@bp.get("/api/dataset")
def get_dataset():
    try:
        df = pd.read_csv(_DATASET_PATH)
    except FileNotFoundError:
        return jsonify({"rows": [], "total": 0, "columns": _EXPECTED_COLS})

    preview = df.head(100).fillna("").to_dict(orient="records")
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
