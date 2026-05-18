VAN_HOFF = {
    "NaCl":       1.9,
    "KCl":        1.9,
    "Na_citrate": 2.7,
    "glucose":    1.0,
    "sucrose":    1.0,
    "fructose":   1.0,
}

MW = {
    "NaCl":       58.44,
    "KCl":        74.55,
    "Na_citrate": 294.10,
    "glucose":    180.16,
    "sucrose":    342.30,
    "fructose":   180.16,
}

KNOWN_COMPONENTS = ["NaCl", "KCl", "glucose", "sucrose", "fructose", "Na_citrate"]

# Compounds whose ions are all impermeant (Na⁺, K⁺, Cl⁻)
IMPERMEANT_COMPOUNDS = ["NaCl", "KCl"]

PLASMA_MIN = 285.0
PLASMA_MAX = 295.0
PLASMA_MID = (PLASMA_MIN + PLASMA_MAX) / 2  # 290.0
WHO_ORS    = 245.0
