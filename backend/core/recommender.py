from .constants import PLASMA_MID, MW

_I_NACL = 1.9
_TOLERANCE = 5.0 


def generate_recommendation(
    effective_tonicity: float,
    calculated_osmolarity: float,
    components: dict,
    volume_mL: float,
) -> list:
    delta = effective_tonicity - PLASMA_MID

    if abs(delta) <= _TOLERANCE:
        return ["Formula ini sudah optimal! Tonisitas efektif berada dalam range isotonic ideal."]

    recommendations = []

    if delta > 0:
        # Hypertonic: need to add water
        new_volume = (effective_tonicity / PLASMA_MID) * volume_mL
        extra_water = new_volume - volume_mL
        recommendations.append(
            f"Tambahkan {extra_water:.0f} mL air untuk menurunkan tonisitas ke range isotonic (target 290 mOsm/L)."
        )
    else:
        # Hypotonic: need to add NaCl
        extra_osm_needed = -delta  # mOsm/L to add
        extra_NaCl_mmol_L = extra_osm_needed / _I_NACL
        extra_NaCl_mol = extra_NaCl_mmol_L * (volume_mL / 1000) / 1000
        extra_NaCl_g = extra_NaCl_mol * MW["NaCl"]
        extra_NaCl_mg = extra_NaCl_g * 1000
        recommendations.append(
            f"Tambahkan {extra_NaCl_mg:.0f} mg ({extra_NaCl_g:.2f} g) NaCl "
            f"untuk meningkatkan tonisitas ke range isotonic (target 290 mOsm/L)."
        )

    return recommendations
