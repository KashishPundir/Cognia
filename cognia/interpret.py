import pandas as pd

def interpret_distribution(summary_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates concise statistical interpretation for skewness and kurtosis.
    """
    interpretations = []

    for col, row in summary_df.iterrows():
        skew = row["skewness"]
        kurt = row["kurtosis"]

        # ---- Skewness interpretation ----
        if abs(skew) < 0.5:
            skew_text = "Approximately symmetric"
        elif skew > 0:
            skew_text = "Right-skewed (positive skew)"
        else:
            skew_text = "Left-skewed (negative skew)"

        # ---- Kurtosis interpretation (excess kurtosis assumed) ----
        if abs(kurt) < 0.5:
            kurt_text = "Normal-like tails"
        elif kurt > 0:
            kurt_text = "Heavy-tailed (outlier-prone)"
        else:
            kurt_text = "Light-tailed (few outliers)"

        interpretations.append({
            "column": col,
            "skewness": round(skew, 3),
            "kurtosis": round(kurt, 3),
            "interpretation": f"{skew_text}; {kurt_text}"
        })

    return pd.DataFrame(interpretations)
