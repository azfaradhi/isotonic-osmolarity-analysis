from .constants import PLASMA_MID

W1 = 0.40   # effective tonicity proximity to isotonic range
W2 = 0.35   # Na:glucose ratio quality for SGLT1
W3 = 0.25   # SGLT1 absorption score

OPTIMAL_NA_GLUCOSE_RATIO = 1.0


def score_tonicity_proximity(effective_tonicity: float) -> float:
    """0–100; maximum when effective_tonicity == PLASMA_MID (290 mOsm/L)."""
    deviation = abs(effective_tonicity - PLASMA_MID)
    return max(0.0, 100.0 - (deviation / PLASMA_MID) * 100.0)


def score_na_glucose_ratio(na_mmol_L: float, glucose_mmol_L: float) -> float:
    """0–100; maximum when na:glucose ratio == 1:1."""
    if glucose_mmol_L <= 0:
        return 0.0
    ratio = na_mmol_L / glucose_mmol_L
    deviation = abs(ratio - OPTIMAL_NA_GLUCOSE_RATIO)
    return max(0.0, 100.0 - deviation * 30.0)


def classify_rei(score: float) -> str:
    if score < 40:
        return "Poor"
    if score < 60:
        return "Fair"
    if score < 80:
        return "Good"
    return "Excellent"


def calculate_rei(
    effective_tonicity: float,
    na_mmol_L: float,
    glucose_mmol_L: float,
    absorption_score: float,
) -> dict:
    tonicity_score    = score_tonicity_proximity(effective_tonicity)
    na_glucose_score  = score_na_glucose_ratio(na_mmol_L, glucose_mmol_L)
    absorption_score_100 = absorption_score * 100.0

    rei = W1 * tonicity_score + W2 * na_glucose_score + W3 * absorption_score_100

    return {
        "rei_score": round(rei, 4),
        "rei_label": classify_rei(rei),
        "component_scores": {
            "tonicity_score":   round(tonicity_score, 4),
            "na_glucose_score": round(na_glucose_score, 4),
            "absorption_score": round(absorption_score_100, 4),
        },
    }
