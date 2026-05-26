from flask import Blueprint, request, jsonify
from core.osmolarity import validate_input, calculate_osmolarity, components_to_ions
from core.tonicity import calculate_effective_tonicity, classify_tonicity
from core.sglt1_model import calculate_absorption_score
from core.rei import calculate_rei
from core.recommender import generate_recommendation

bp = Blueprint("calculator", __name__)


@bp.post("/api/calculate")
def calculate():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": True, "message": "Request body tidak valid", "code": "INVALID_INPUT"}), 400

    components = body.get("components", {})
    volume_mL  = body.get("volume_mL", 0)

    ok, msg = validate_input(components, volume_mL)
    if not ok:
        return jsonify({"error": True, "message": msg, "code": "INVALID_INPUT"}), 400

    # Core calculations
    osm_result     = calculate_osmolarity(components, volume_mL)
    ton_result     = calculate_effective_tonicity(components, volume_mL)
    ions           = components_to_ions(components, volume_mL)
    sglt1_result   = calculate_absorption_score(
        ions["na_mmol_L"], ions["glucose_mmol_L"], ton_result["effective_tonicity"]
    )
    rei_result     = calculate_rei(
        ton_result["effective_tonicity"],
        ions["na_mmol_L"],
        ions["glucose_mmol_L"],
        sglt1_result["absorption_score"],
    )
    recommendations = generate_recommendation(
        ton_result["effective_tonicity"],
        osm_result["calculated_osmolarity"],
        components,
        volume_mL,
    )

    return jsonify({
        "calculated_osmolarity": osm_result["calculated_osmolarity"],
        "effective_tonicity":    ton_result["effective_tonicity"],
        "phantom_osmolarity":    ton_result["phantom_osmolarity"],
        "osmolarity_status":     classify_tonicity(osm_result["calculated_osmolarity"]),
        "tonicity_status":       ton_result["tonicity_status"],
        "na_mmol_L":             ions["na_mmol_L"],
        "k_mmol_L":              ions["k_mmol_L"],
        "cl_mmol_L":             ions["cl_mmol_L"],
        "glucose_mmol_L":        ions["glucose_mmol_L"],
        "sucrose_mmol_L":        ions["sucrose_mmol_L"],
        "na_glucose_ratio":      sglt1_result["na_glucose_ratio"],
        "osmotic_gradient":      sglt1_result["osmotic_gradient"],
        "absorption_score":      sglt1_result["absorption_score"],
        "absorption_label":      sglt1_result["absorption_label"],
        "rei_score":             rei_result["rei_score"],
        "rei_label":             rei_result["rei_label"],
        "component_scores":      rei_result["component_scores"],
        "recommendations":       recommendations,
        "component_breakdown":   osm_result["component_breakdown"],
    })
