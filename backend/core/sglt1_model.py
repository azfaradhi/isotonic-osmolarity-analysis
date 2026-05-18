from .constants import PLASMA_MID

OPTIMAL_NA_GLUCOSE_RATIO = 1.0

# Reference absorption scores from lookup table (Scientific Reports 2020)
# Low gradient  = |effective_tonicity - plasma| < 100 mOsm/L
# High gradient = |effective_tonicity - plasma| >= 100 mOsm/L
# Optimal ratio = na:glucose close to 1.0 (ratio_factor near 0)
# Poor ratio    = large deviation from 1.0 (ratio_factor near 1)
_LOOKUP = {
    ("low",  "optimal"): 0.9,
    ("low",  "poor"):    0.6,
    ("high", "optimal"): 0.5,
    ("high", "poor"):    0.2,
}
_GRADIENT_THRESHOLD = 100.0  # mOsm/L
_RATIO_NORMALIZATION = 3.0   # deviation of 3 → fully "poor"


def calculate_absorption_score(
    na_mmol_L: float,
    glucose_mmol_L: float,
    effective_tonicity: float,
) -> dict:
    osmotic_gradient = effective_tonicity - PLASMA_MID

    # gradient_factor: 0 = isotonic (low), 1 = large deviation (high)
    gradient_factor = min(abs(osmotic_gradient) / _GRADIENT_THRESHOLD, 1.0)

    # ratio_factor: 0 = optimal 1:1, 1 = very poor ratio
    if glucose_mmol_L <= 0:
        na_glucose_ratio = 0.0
        ratio_factor = 1.0
    else:
        na_glucose_ratio = na_mmol_L / glucose_mmol_L
        ratio_deviation = abs(na_glucose_ratio - OPTIMAL_NA_GLUCOSE_RATIO)
        ratio_factor = min(ratio_deviation / _RATIO_NORMALIZATION, 1.0)

    # Bilinear interpolation between the four lookup table reference points
    score = (
        (1 - gradient_factor) * (1 - ratio_factor) * _LOOKUP[("low",  "optimal")] +
        (1 - gradient_factor) *      ratio_factor   * _LOOKUP[("low",  "poor")]    +
             gradient_factor  * (1 - ratio_factor)  * _LOOKUP[("high", "optimal")] +
             gradient_factor  *      ratio_factor    * _LOOKUP[("high", "poor")]
    )

    label = "High" if score >= 0.7 else ("Moderate" if score >= 0.4 else "Low")

    return {
        "na_glucose_ratio":  round(na_glucose_ratio, 4),
        "osmotic_gradient":  round(osmotic_gradient, 4),
        "absorption_score":  round(score, 4),
        "absorption_label":  label,
    }
