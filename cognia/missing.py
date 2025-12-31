import pandas as pd

def missing_report(df) -> pd.DataFrame:
    """
    Returns missing value count and percentage for each column.
    """
    
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame")

    total = df.isnull().sum()
    percent = (total / len(df)) * 100

    report = pd.DataFrame({
        "missing_count": total,
        "missing_percent": percent.round(2)
    })

    return report.sort_values(by="missing_percent", ascending=False)

