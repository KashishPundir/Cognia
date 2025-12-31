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
        return "<p><i>No data available</i></p>"

    # Simplify column names
    df = df.copy()
    df.columns = [str(c).replace("_", " ").title() for c in df.columns]

    return df.to_html(
        classes="table",
        border=0,
        index=True,
        justify="center"
    )


def _encode_plot() -> str:
    buffer = BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buffer.getvalue()).decode()


def _categorical_charts(df):
    charts = {}

    for col in df.select_dtypes(exclude="number").columns:
        counts = df[col].value_counts().head(10)

        plt.figure(figsize=(7, 4))

        # 🔹 Generate DIFFERENT colors dynamically
        colors = plt.cm.Set3(range(len(counts)))

        bars = plt.bar(
            counts.index.astype(str),
            counts.values,
            color=colors
        )

        plt.title(f"{col} – Category Distribution", fontsize=12)
        plt.ylabel("Count")
        plt.xticks(rotation=45, ha="right")

        # 🔹 Add padding at top so labels are visible
        max_val = counts.values.max()
        plt.ylim(0, max_val * 1.15)

        # 🔹 ADD COUNT LABELS ABOVE BARS
        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width() / 2,
                height + max_val * 0.02,   # push text above bar
                f"{int(height)}",
                ha="center",
                va="bottom",
                fontsize=9,
                fontweight="bold"
            )

        plt.tight_layout()
        charts[col] = _encode_plot()

    return charts



def _numeric_charts(df):
    charts = {}
    for col in df.select_dtypes(include="number").columns:
        plt.figure(figsize=(7, 4))
        plt.hist(
            df[col].dropna(),
            bins=30,
            color="#4C72B0",
            edgecolor="black"
        )
        plt.title(f"{col} – Distribution", fontsize=12)
        plt.xlabel(col)
        plt.ylabel("Frequency")
        plt.tight_layout()
        charts[col] = _encode_plot()

    return charts


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
    cat_charts = _categorical_charts(df)
    num_charts = _numeric_charts(df)
    numeric_cols = df.select_dtypes(include="number").columns.tolist() 

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
            {_df_to_html(overview["column_overview"])}
            <p><b>Duplicate Records:</b> {dq["duplicate_records"]} ({dq["duplicate_percent"]}%)</p>
            <p><b>Numeric Columns:</b> {dq["numeric_count"]}</p>
            <p><b>Categorical Columns:</b> {dq["categorical_count"]}</p>
        </div>

        <div class="section">
            <h2>2️⃣ Missing Value Analysis</h2>
            {_df_to_html(missing)}
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
            {_df_to_html(outliers)}
        </div>

        <div class="section">
            <h2>6️⃣ Categorical Column Explorer</h2>
            <div style="text-align:center;">
                <select onchange="document.getElementById('catImg').src = catCharts[this.value]">
                    {''.join([f"<option value='{c}'>{c}</option>" for c in cat_charts])}
                </select>
            </div>
            <img id="catImg" />
        </div>

        <div class="section">
            <h2>7️⃣ Numeric Column Explorer</h2>
            <div style="text-align:center;">
                <select onchange="document.getElementById('numImg').src = numCharts[this.value]">
                    {''.join([f"<option value='{c}'>{c}</option>" for c in num_charts])}
                </select>
            </div>
            <img id="numImg" />
        </div>

        <div class="section">
            <h2>Correlation Analysis</h2>
            {corr_section_html}
        </div>


        <div class="section">
            <h2>⚠️ Alerts & Warnings</h2>

            {"".join([
                f"<p style='color:#b71c1c;font-weight:600;'>⚠️ {alert}</p>"
                for alert in alerts
            ]) if alerts else "<p style='color:green;font-weight:600;'>✅ No major data quality issues detected</p>"}
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

