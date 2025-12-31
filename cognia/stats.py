import pandas as pd

def numeric_summary(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns descriptive statistics for numeric columns.
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame")

    numeric_df = df.select_dtypes(include="number")

    if numeric_df.empty:
        return pd.DataFrame()

    summary = numeric_df.describe().T
    summary["skewness"] = numeric_df.skew()
    summary["kurtosis"] = numeric_df.kurt()

    return summary.round(3)



