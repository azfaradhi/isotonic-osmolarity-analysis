import os
import json
import joblib
import pandas as pd

from core.rei import classify_rei

FEATURES = [
    "na_mmol_L",
    "k_mmol_L",
    "cl_mmol_L",
    "glucose_mmol_L",
    "sucrose_mmol_L",
    "calculated_osmolarity",
    "effective_tonicity",
    "phantom_osmolarity",
]

_ML_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_ML_DIR, "saved_model.pkl")
LOG_PATH   = os.path.join(_ML_DIR, "training_log.json")


def predict_rei(features: dict) -> dict:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Model belum dilatih. Buka tab Training dan latih model terlebih dahulu."
        )

    model = joblib.load(MODEL_PATH)

    model_r2 = 0.0
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH) as f:
            log = json.load(f)
            model_r2 = log.get("metrics", {}).get("r2", 0.0)

    X = pd.DataFrame([{feat: float(features.get(feat, 0.0)) for feat in FEATURES}])
    rei_pred = float(model.predict(X)[0])
    rei_pred = max(0.0, min(100.0, rei_pred))

    return {
        "predicted_rei": round(rei_pred, 2),
        "rei_label":     classify_rei(rei_pred),
        "model_r2":      round(model_r2, 4),
    }
