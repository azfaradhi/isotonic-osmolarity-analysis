import os
import pandas as pd
from flask import Blueprint, request, jsonify
from ml.train import train_model
from ml.predict import predict_rei

bp = Blueprint("model", __name__)

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")


@bp.post("/api/model/train")
def train():
    if not os.path.exists(_DATASET_PATH):
        return jsonify({
            "error": True,
            "message": "Dataset tidak ditemukan. Jalankan scripts/generate_dataset.py terlebih dahulu.",
            "code": "NO_DATASET",
        }), 404

    try:
        df = pd.read_csv(_DATASET_PATH)
    except Exception as e:
        return jsonify({"error": True, "message": str(e), "code": "READ_ERROR"}), 500

    if len(df) < 10:
        return jsonify({
            "error": True,
            "message": f"Dataset terlalu kecil ({len(df)} baris). Minimal 10 baris diperlukan.",
            "code": "INSUFFICIENT_DATA",
        }), 400

    body         = request.get_json(silent=True) or {}
    model_type   = body.get("model_type", "random_forest")
    n_estimators = int(body.get("n_estimators", 200))
    max_depth    = int(body.get("max_depth", 10))
    test_size    = float(body.get("test_size", 0.2))

    if model_type not in ("random_forest", "gradient_boosting"):
        return jsonify({
            "error": True,
            "message": "model_type harus 'random_forest' atau 'gradient_boosting'",
            "code": "INVALID_MODEL_TYPE",
        }), 400

    try:
        metrics, feature_importance, n_train, n_test = train_model(
            _DATASET_PATH, model_type, n_estimators, max_depth, test_size
        )
        return jsonify({
            "status":            "success",
            "metrics":           metrics,
            "feature_importance": feature_importance,
            "training_samples":  n_train,
            "test_samples":      n_test,
        })
    except Exception as e:
        return jsonify({"error": True, "message": str(e), "code": "TRAINING_ERROR"}), 500


@bp.post("/api/model/predict")
def predict():
    body = request.get_json(silent=True)
    if not body or "features" not in body:
        return jsonify({
            "error": True,
            "message": "Request body harus mengandung field 'features'",
            "code": "INVALID_INPUT",
        }), 400

    try:
        result = predict_rei(body["features"])
        return jsonify(result)
    except FileNotFoundError as e:
        return jsonify({"error": True, "message": str(e), "code": "MODEL_NOT_TRAINED"}), 404
    except Exception as e:
        return jsonify({"error": True, "message": str(e), "code": "PREDICTION_ERROR"}), 500
