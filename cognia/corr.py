import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
import base64


# ---------------- Utility ----------------

def _encode_plot():
    buffer = BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buffer.getvalue()).decode()

# ---------------- Correlation computations ----------------

def top_correlated_pairs(df, threshold=0.6, top_n=10):
    corr = df.select_dtypes(include="number").corr().abs()
    upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))

    pairs = (
        upper.stack()
        .reset_index()
        .rename(columns={
            "level_0": "Feature 1",
            "level_1": "Feature 2",
            0: "Correlation"
        })
        .sort_values("Correlation", ascending=False)
    )

    return pairs[pairs["Correlation"] >= threshold].head(top_n)



def full_correlation_heatmap(df):
    corr = df.select_dtypes(include="number").corr()

    plt.figure(figsize=(8, 6))
    plt.imshow(corr, cmap="coolwarm")
    plt.colorbar()

    plt.xticks(range(len(corr)), corr.columns, rotation=45, ha="right")
    plt.yticks(range(len(corr)), corr.columns)
    plt.title("Full Correlation Heatmap")

    plt.tight_layout()
    return _encode_plot()

