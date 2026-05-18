from .constants import VAN_HOFF, MW, KNOWN_COMPONENTS


def validate_input(components: dict, volume_mL: float) -> tuple:
    if volume_mL <= 0:
        return False, "Volume air harus lebih dari 0 mL"
    unknown = [k for k in components if k not in KNOWN_COMPONENTS]
    if unknown:
        return False, f"Komponen tidak dikenal: {unknown}"
    negative = [k for k, v in components.items() if v < 0]
    if negative:
        return False, f"Massa tidak boleh negatif: {negative}"
    if not components or not any(v > 0 for v in components.values()):
        return False, "Minimal satu komponen harus memiliki massa > 0"
    return True, "OK"


def calculate_osmolarity(components: dict, volume_mL: float) -> dict:
    volume_L = volume_mL / 1000
    breakdown = {}
    total = 0.0

    for compound, mass_g in components.items():
        if mass_g <= 0:
            continue
        moles = mass_g / MW[compound]
        molarity_M = moles / volume_L
        contribution = VAN_HOFF[compound] * molarity_M * 1000  # mOsm/L
        breakdown[compound] = round(contribution, 4)
        total += contribution

    return {
        "calculated_osmolarity": round(total, 4),
        "component_breakdown": breakdown,
    }


def components_to_ions(components: dict, volume_mL: float) -> dict:
    """Convert gram amounts to ion concentrations in mmol/L."""
    volume_L = volume_mL / 1000
    na_mmol_L = 0.0
    k_mmol_L = 0.0
    cl_mmol_L = 0.0
    glucose_mmol_L = 0.0
    sucrose_mmol_L = 0.0

    for compound, mass_g in components.items():
        if mass_g <= 0:
            continue
        moles = mass_g / MW[compound]
        mmol_per_L = (moles / volume_L) * 1000

        if compound == "NaCl":
            na_mmol_L += mmol_per_L
            cl_mmol_L += mmol_per_L
        elif compound == "KCl":
            k_mmol_L += mmol_per_L
            cl_mmol_L += mmol_per_L
        elif compound == "Na_citrate":
            # Trisodium citrate: 1 mol → 3 Na⁺ + 1 citrate³⁻
            na_mmol_L += 3 * mmol_per_L
        elif compound == "glucose":
            glucose_mmol_L += mmol_per_L
        elif compound == "sucrose":
            # Sucrose is hydrolyzed to glucose + fructose in the gut;
            # counts as glucose for SGLT1 co-transport modeling.
            glucose_mmol_L += mmol_per_L
            sucrose_mmol_L += mmol_per_L
        elif compound == "fructose":
            # Fructose uses GLUT5, not SGLT1; excluded from glucose_mmol_L.
            pass

    return {
        "na_mmol_L":      round(na_mmol_L, 4),
        "k_mmol_L":       round(k_mmol_L, 4),
        "cl_mmol_L":      round(cl_mmol_L, 4),
        "glucose_mmol_L": round(glucose_mmol_L, 4),
        "sucrose_mmol_L": round(sucrose_mmol_L, 4),
    }
