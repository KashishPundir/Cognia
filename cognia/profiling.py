import pandas as pd

def dataset_overview(df) -> dict:
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame")

    column_overview = pd.DataFrame({
        "column_name": df.columns,
        "dtype": df.dtypes.astype(str).values
    })

    return {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_overview": column_overview
    }
