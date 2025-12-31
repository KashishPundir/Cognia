import pandas as pd

def interpret_distribution(summary_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates natural language interpretation for skewness and kurtosis.
    """
    interpretations = []

    for col, row in summary_df.iterrows():
        skew = row["skewness"]
        kurt = row["kurtosis"]

        # ---- Skewness interpretation ----
        if abs(skew) < 0.5:
            skew_text = "The distribution is approximately symmetric."
        elif skew > 0:
            skew_text = "The distribution is right-skewed, indicating the presence of higher-value outliers."
        else:
            skew_text = "The distribution is left-skewed, indicating the presence of lower-value outliers."

        # ---- Kurtosis interpretation ---
        if abs(kurt) < 1:
            kurt_text = "The distribution has moderate tails, similar to a normal distribution."
        elif kurt > 0:
            kurt_text = "The distribution has heavy tails, suggesting a higher likelihood of extreme values."
        else:
            kurt_text = "The distribution has light tails, suggesting fewer extreme values."

        interpretations.append({
            "column": col,
            "skewness": round(skew, 3),
            "kurtosis": round(kurt, 3),
            "interpretation": f"{skew_text} {kurt_text}"
        })

    return pd.DataFrame(interpretations)


