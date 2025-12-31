from .profiling import dataset_overview
from .missing import missing_report
from .stats import numeric_summary
from .outliers import outlier_detect
from .interpret import interpret_distribution
from .alert import _generate_alerts
from .corr import (
    top_correlated_pairs,
    full_correlation_heatmap
)

def quick_eda(df):
    """
    Runs complete EDA pipeline.
    """
    stats = numeric_summary(df)

    return {
        "overview": dataset_overview(df),
        "missing": missing_report(df),
        "statistics": stats,
        "outliers": outlier_detect(df),
        "interpretation": interpret_distribution(stats),
        "alerts": _generate_alerts(df, stats, outlier_detect(df), missing_report(df)),
        "correlation": {
            "top_pairs": top_correlated_pairs(df),
            "full_correlation_heatmap": full_correlation_heatmap(df)
        }
    }
