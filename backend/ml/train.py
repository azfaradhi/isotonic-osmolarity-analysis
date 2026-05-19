import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 8 features — raw composition + intermediate calculations only.
# Excludes absorption_score and na_glucose_ratio (direct REI components)
# to prevent feature leakage and preserve scientific validity.
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
TARGET = "rei_score"

_ML_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH    = os.path.join(_ML_DIR, "saved_model.pkl")
LOG_PATH      = os.path.join(_ML_DIR, "training_log.json")
IMPORTANCE_PATH = os.path.join(_ML_DIR, "feature_importance.json")


def train_model(
    dataset_path: str,
    model_type: str = "random_forest",
    n_estimators: int = 200,
    max_depth: int = 10,
    test_size: float = 0.2,
) -> tuple:
    df = pd.read_csv(dataset_path).dropna(subset=FEATURES + [TARGET])

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    if model_type == "gradient_boosting":
        model = GradientBoostingRegressor(
            n_estimators=n_estimators,
            max_depth=min(max_depth, 5),
            learning_rate=0.05,
            random_state=42,
        )
    else:
        model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=42,
            n_jobs=-1,
        )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "mae":  round(float(mean_absolute_error(y_test, y_pred)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4),
        "r2":   round(float(r2_score(y_test, y_pred)), 4),
    }

    feature_importance = dict(
        sorted(
            {feat: round(float(imp), 4) for feat, imp in zip(FEATURES, model.feature_importances_)}.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    )

    joblib.dump(model, MODEL_PATH)

    log = {
        "model_type":       model_type,
        "n_estimators":     n_estimators,
        "max_depth":        max_depth,
        "test_size":        test_size,
        "features":         FEATURES,
        "metrics":          metrics,
        "feature_importance": feature_importance,
        "training_samples": len(X_train),
        "test_samples":     len(X_test),
        "trained_at":       datetime.utcnow().isoformat() + "Z",
    }
    with open(LOG_PATH, "w") as f:
        json.dump(log, f, indent=2)
    with open(IMPORTANCE_PATH, "w") as f:
        json.dump(feature_importance, f, indent=2)

    return metrics, feature_importance, len(X_train), len(X_test)
