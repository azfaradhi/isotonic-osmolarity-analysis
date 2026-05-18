from .constants import VAN_HOFF, MW, IMPERMEANT_COMPOUNDS, PLASMA_MIN, PLASMA_MAX
from .osmolarity import calculate_osmolarity


def classify_tonicity(value: float) -> str:
    if value < PLASMA_MIN:
        return "hypotonic"
    elif value > PLASMA_MAX:
        return "hypertonic"
    return "isotonic"


def calculate_effective_tonicity(components: dict, volume_mL: float) -> dict:
    """
    Effective tonicity only counts impermeant solutes (NaCl, KCl).
    Glucose, sucrose, fructose, and citrate are excluded because they
    either cross cell membranes or are metabolized.
    """
    volume_L = volume_mL / 1000
    impermeant_osm = 0.0

    for compound in IMPERMEANT_COMPOUNDS:
        mass_g = components.get(compound, 0)
        if mass_g <= 0:
            continue
        moles = mass_g / MW[compound]
        molarity_M = moles / volume_L
        impermeant_osm += VAN_HOFF[compound] * molarity_M * 1000

    total_osm = calculate_osmolarity(components, volume_mL)["calculated_osmolarity"]
    phantom_osmolarity = total_osm - impermeant_osm

    return {
        "effective_tonicity":  round(impermeant_osm, 4),
        "phantom_osmolarity":  round(phantom_osmolarity, 4),
        "tonicity_status":     classify_tonicity(impermeant_osm),
    }
