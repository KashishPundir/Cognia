import pandas as pd

def _generate_alerts(df, stats_df, outliers_df, missing_df):
    alerts = []

    n_rows = len(df)

    # ---------------- Missing value alerts ----------------
    if missing_df is not None and not missing_df.empty:
        for col, row in missing_df.iterrows():
            if row["missing_percent"] > 5:
                alerts.append(
                    f"{col} has {row['missing_percent']}% missing values"
                )

    # ---------------- Numeric column alerts ----------------
    for col in df.select_dtypes(include="number").columns:
        series = df[col].dropna()

        if series.empty:
            continue

        unique_vals = series.nunique()
        value_counts = series.value_counts(normalize=True)

        # 🔹 Case 1: Constant column
        if unique_vals == 1:
            alerts.append(
                f"{col} has a single constant value ({series.iloc[0]})"
            )
            continue

        # 🔹 Case 2: Continuous numeric → skewness
        # ---- Continuous numeric → skewness (SMART) ----
        if stats_df is not None and col in stats_df.index:
            skew = stats_df.loc[col, "skewness"]
            std = stats_df.loc[col, "std"]

            if pd.notna(skew) and pd.notna(std):
                # Ignore near-constant columns
                if std == 0:
                    pass

                # Severe skew only
                elif abs(skew) > 3:
                    direction = "right" if skew > 0 else "left"
                    alerts.append(
                        f"{col} is severely {direction}-skewed (skew = {round(skew, 2)})"
                    )   

                # Moderate skew → informational only (optional)
                elif abs(skew) > 1.5:
                    alerts.append(
                        f"{col} has moderate skewness (skew = {round(skew, 2)})"
                    )

    # ---------------- Outlier alerts ----------------
    if outliers_df is not None and not outliers_df.empty:
        for _, row in outliers_df.iterrows():
            if row["outlier_percent"] > 10:
                alerts.append(
                    f"{row['column']} has {row['outlier_percent']}% outliers"
                )

    # ---------------- High-cardinality categorical ----------------
    for col in df.select_dtypes(exclude="number").columns:
        unique_ratio = df[col].nunique() / n_rows
        if unique_ratio > 0.2:
            alerts.append(
                f"{col} has high cardinality ({df[col].nunique()} unique values)"
            )

    return alerts
