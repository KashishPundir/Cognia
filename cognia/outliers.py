import pandas as pd

def outlier_detect(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detects outliers using the IQR (Tukey) method for numeric columns.
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame")

    numeric_df = df.select_dtypes(include="number")

    rows = []

    for col in numeric_df.columns:
        series = numeric_df[col].dropna()

        if series.empty:
            continue

        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1

        # Handle constant columns
        if IQR == 0:
            outlier_count = 0
        else:
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            outlier_count = ((series < lower) | (series > upper)).sum()

        rows.append({
            "column": col,
            "outlier_count": int(outlier_count),
            "outlier_percent": round((outlier_count / len(series)) * 100, 2)
        })

    return pd.DataFrame(rows)

