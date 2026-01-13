import pandas as pd
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from datetime import datetime
import json

from .quick_eda import quick_eda
from .alert import _generate_alerts
from .corr import (
    top_correlated_pairs,
    full_correlation_heatmap
)



# ===================== HELPERS =====================

def _df_to_html(df: pd.DataFrame) -> str:
    if df is None or df.empty:
        return "<p><i>No ambiguity found.</i></p>"

    # Simplify column names
    df = df.copy()
    df.columns = [str(c).replace("_", " ").title() for c in df.columns]

    return df.to_html(
        classes="table",
        border=0,
        index=True,
        justify="center"
    )



def _encode_plot(fig):
    import io, base64

    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)

    return base64.b64encode(buf.read()).decode("utf-8")


def _categorical_charts(df):
    charts = {}
    valid_cols = []
    idx = 0

    for col in df.select_dtypes(exclude="number").columns:
        counts = df[col].value_counts().head(10)

        if counts.empty or counts.nunique() <= 1:
            continue

        fig, ax = plt.subplots(figsize=(7, 4))
        colors = plt.cm.Set3(range(len(counts)))

        ax.bar(counts.index.astype(str), counts.values, color=colors)
        ax.set_title(f"{col} – Category Distribution", fontsize=12)
        ax.set_ylabel("Count")

        ax.set_xticks(range(len(counts)))
        ax.set_xticklabels(counts.index.astype(str), rotation=45, ha="right")

        plt.tight_layout()

        charts[str(idx)] = _encode_plot(fig)
        valid_cols.append(col)

        plt.close(fig)
        idx += 1

    return charts, valid_cols


def _numeric_charts(df):
    charts = {}
    valid_cols = []
    idx = 0

    for col in df.select_dtypes(include="number").columns:
        data = df[col].dropna()
        if data.empty:
            continue

        fig, ax = plt.subplots(figsize=(7, 4))
        ax.hist(data, bins=30, edgecolor="black")
        ax.set_title(f"{col} – Distribution", fontsize=12)
        ax.set_xlabel(col)
        ax.set_ylabel("Frequency")

        plt.tight_layout()
        charts[str(idx)] = _encode_plot(fig)
        valid_cols.append(col)

        plt.close(fig)
        idx += 1

    return charts, valid_cols

def _column_overview_two_column(df: pd.DataFrame) -> str:
    """
    Displays column name & dtype in two side-by-side tables
    to avoid vertical scrolling for wide datasets.
    """
    if df is None or df.empty:
        return "<p><i>No column information available.</i></p>"

    df = df.copy()
    df.columns = ["Column Name", "Data Type"]

    mid = (len(df) + 1) // 2
    left = df.iloc[:mid]
    right = df.iloc[mid:]

    left_html = left.to_html(
        classes="table",
        border=0,
        index=False,
        justify="center"
    )

    right_html = right.to_html(
        classes="table",
        border=0,
        index=False,
        justify="center"
    )

    return f"""
    <div style="display:flex; gap:30px; align-items:flex-start;">
        <div style="flex:1;">{left_html}</div>
        <div style="flex:1;">{right_html}</div>
    </div>
    """


def _data_quality_summary(df):
    return {
        "duplicate_records": int(df.duplicated().sum()),
        "duplicate_percent": round(df.duplicated().mean() * 100, 2),
        "numeric_count": df.select_dtypes(include="number").shape[1],
        "categorical_count": df.select_dtypes(exclude="number").shape[1],
    }



# ===================== MAIN REPORT =====================

def eda_report(
    df: pd.DataFrame,
    output_file="cognia_eda_report.html",
    show_full_correlation=False
) -> str:

    result = quick_eda(df)

    overview = result["overview"]
    missing = result["missing"]
    stats = result["statistics"]
    outliers = result["outliers"]
    interpretation = result["interpretation"]

    dq = _data_quality_summary(df)
    alerts = _generate_alerts(df, stats, outliers, missing)
    num_charts, num_cols = _numeric_charts(df)
    first_num = "0" if num_charts else None
    cat_charts, cat_cols = _categorical_charts(df)
    first_cat = "0" if cat_charts else None


    # ---------- Correlation logic ----------
    corr_section_html = ""
    numeric_cols = df.select_dtypes(include="number").columns.tolist()

    if len(numeric_cols) > 10:
        corr_section_html += "<h3>🔝 Top Correlated Feature Pairs</h3>"
        corr_section_html += _df_to_html(top_correlated_pairs(df))

        if show_full_correlation:
            full_img = full_correlation_heatmap(df)
            if full_img:
                corr_section_html += f"""
                <details style="margin-top:25px;">
                    <summary style="cursor:pointer;font-weight:600;">
                        Show Full Correlation Heatmap (Advanced)
                    </summary>
                    <img src="data:image/png;base64,{full_img}" />
                </details>
                """
    else:
        full_img = full_correlation_heatmap(df)
        if full_img:
            corr_section_html += f"""
            <img src="data:image/png;base64,{full_img}" />
            """



    cat_explorer_html = (
        f"""
        <div class="section">
            <h2>6️⃣ Categorical Column Explorer</h2>

            <div style="text-align:center;">
                <select onchange="document.getElementById('catImg').src = catCharts[this.value]">
                    {''.join([f"<option value='{i}'>{col}</option>" for i, col in enumerate(cat_cols)])}
                </select>
            </div>

            <img id="catImg" src="data:image/png;base64,{cat_charts[first_cat]}" />
        </div>
        """
        if cat_charts else
        """
        <div class="section">
            <h2>6️⃣ Categorical Column Explorer</h2>
            <p style="text-align:center;color:#777;font-size:16px;">
                🚫 No categorical columns exist in this dataset.
            </p>
        </div>
        """
    )

    num_explorer_html = (
        f"""
        <div class="section">
            <h2>7️⃣ Numeric Column Explorer</h2>

            <div style="text-align:center;">
                <select onchange="document.getElementById('numImg').src = numCharts[this.value]">
                    {''.join([f"<option value='{i}'>{col}</option>" for i, col in enumerate(num_cols)])}
                </select>
            </div>

            <img id="numImg" src="data:image/png;base64,{num_charts[first_num]}" />
        </div>
        """
        if num_charts else
        """
        <div class="section">
            <h2>7️⃣ Numeric Column Explorer</h2>
            <p style="text-align:center;color:#777;font-size:16px;">
                🚫 No numerical columns exist in this dataset.
            </p>
        </div>
        """
    )





    correlation_html = (
    f"""
    <div class="section">
        <h2>8️⃣ Correlation Analysis</h2>
        {corr_section_html if corr_section_html else "<p><i>No correlation data available</i></p>"}
    </div>
    """
)

    missing_section_html = (
        """
        <p style="text-align:center;color:green;font-size:16px;font-weight:600;">
            No missing values exist in the dataset.
        </p>
        """
        if missing is None or missing.empty
        else _df_to_html(missing)
    )


    outlier_section_html = (
        """
        <p style="text-align:center;color:green;font-size:16px;font-weight:600;">
            No outliers exist in the dataset.
        </p>
        """
        if outliers is None or outliers.empty
        else _df_to_html(outliers)
    )

    html = f"""
    <html>
    <head>
        <title>Cognia EDA Report</title>
        <style>
            body {{
                font-family: "Segoe UI", Arial, sans-serif;
                margin: 40px;
                background: #f4f6f9;
            }}

            h1 {{
                text-align: center;
                color: #2c3e50;
                margin-bottom: 30px;
            }}

            h2 {{
                color: #34495e;
                border-bottom: 2px solid #dfe6e9;
                padding-bottom: 6px;
                margin-bottom: 20px;
            }}

            .section {{
                background: #ffffff;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                margin-bottom: 40px;
            }}

            .info-box {{
                background: #ffffff;
                padding: 20px;
                border-left: 6px solid #0d6efd;
                border-radius: 8px;
                margin-bottom: 30px;
                text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            }}

            .table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 15px;
                font-size: 14px;
                
            }}

            .table th,
            .table td {{
                border: 1px solid #dee2e6;
                padding: 12px;
                text-align: center !important;
                vertical-align: middle !important;
            }}

            .table th {{
                background-color: #f1f3f5;
                font-weight: 600;
            }}

            .table tr:nth-child(even) {{
                background-color: #fafafa;
            }}

            select {{
                width: 320px;
                height: 42px;
                padding: 6px 12px;
                font-size: 15px;
                border-radius: 10px;
                border: 1px solid #ccc;
                margin-bottom: 20px;
            }}

            img {{
                display: block;
                margin: 0 auto;
                max-width: 100%;
            }}
        </style>
    </head>

    <body>

        <h1>📊 Cognia – Exploratory Data Analysis Report</h1>

        <div class="info-box">
            <b>Generated:</b> {datetime.now().strftime("%d %b %Y, %H:%M")} <br>
            <b>Total Rows:</b> {overview["rows"]} |
            <b>Total Columns:</b> {overview["columns"]}
        </div>

        <div class="section">
            <h2>1️⃣ Dataset Overview</h2>
            {_column_overview_two_column(overview["column_overview"])}
            <p><b>Duplicate Records:</b> {dq["duplicate_records"]} ({dq["duplicate_percent"]}%)</p>
            <p><b>Numeric Columns:</b> {dq["numeric_count"]}</p>
            <p><b>Categorical Columns:</b> {dq["categorical_count"]}</p>
        </div>

        <div class="section">
            <h2>2️⃣ Missing Value Analysis</h2>
            {missing_section_html}
        </div>


        <div class="section">
            <h2>3️⃣ Statistical Summary</h2>
            {_df_to_html(stats)}
        </div>

        <div class="section">
            <h2>4️⃣ Distribution Interpretation</h2>
            {_df_to_html(interpretation)}
        </div>

        <div class="section">
            <h2>5️⃣ Outlier Analysis</h2>
            {outlier_section_html}
        </div>

        {cat_explorer_html}
        {num_explorer_html}
        {correlation_html}


        <div class="section">
            <h2>⚠️ Alerts & Warnings</h2>

            {"".join([
                f"<p style='color:#b71c1c;font-weight:600;'>⚠️ {alert}</p>"
                for alert in alerts
            ]) if alerts else "<p style='color:green;font-weight:600;'> No major data quality issues detected</p>"}
        </div>

        <script>
            const catCharts = {json.dumps({k: "data:image/png;base64," + v for k, v in cat_charts.items()})};
            const numCharts = {json.dumps({k: "data:image/png;base64," + v for k, v in num_charts.items()})};
        </script>

        <p style="text-align:center;color:gray;">
            Generated by <b>Cognia</b> · Kashish Pundir
        </p>

    </body>
    </html>
    """

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)

    return output_file
