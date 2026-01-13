
<h1 align="center"> Cognia</h1>

<h3><p align="center">
   <b>Automated Exploratory Data Analysis</b>
</p></h3>

<p align="center">
  Cognia is a Python library that automatically performs
  <b>Exploratory Data Analysis (EDA)</b> and generates a
  structured, insight-rich <b>HTML report</b>.
</p>

<p align="center">
  Instead of writing repetitive and error-prone EDA scripts,
  <b>Cognia thinks like a data analyst</b> and delivers clear insights,
  visualizations, and warnings instantly.
</p>


## ✨ Why Cognia?

Before building:

- Machine Learning models
- Statistical analyses
- Dashboards or business insights

You must understand your data.

However, traditional EDA is often:

❌ Time-consuming

❌ Repetitive


### 👉 Cognia automates this entire process.

## 📁 Project Structure:

```
COGNIA/
│
├── cognia/                     # Core Cognia package
│   ├── __init__.py             # Package initializer
│   ├── alert.py                # Data quality alerts & warnings
│   ├── corr.py                 # Correlation analysis utilities
│   ├── interpret.py            # Distribution & insight interpretation
│   ├── missing.py              # Missing value analysis
│   ├── outliers.py             # Outlier detection logic
│   ├── profiling.py            # Dataset profiling helpers
│   ├── quick_eda.py             # Fast high-level EDA summary
│   ├── report.py               # HTML report generation engine
│   └── stats.py                # Statistical computations
│
├── demo/                                  # Demo & example files
│   ├── EDA report on LaptopPrice Dataset  # Sample generated EDA report
│   ├── input_file.py                      # Example usage script
│   └── laptopPrice.csv                     # Sample dataset
│
├── pyproject.toml              # Build & dependency configuration
├── README.md                   # Project documentation
```

## 🔍 What Cognia Analyzes:

Cognia generates a complete EDA report covering:

**📊 Dataset Overview:**

-  Total rows & columns
-  Data types
- Duplicate records
- Numeric vs categorical features

**❓ Missing Value Analysis:**

- Column-wise missing counts
- Missing percentages
- Data completeness indicators

**📈 Statistical Summary:**

- Mean, median, standard deviation
- Min / Max values
- Distribution characteristics

**📉 Distribution & Shape Analysis:**

- Histograms for numeric features
- Skewness detection
- Interpretable insights

**🚨 Outlier Detection:**

- Outlier counts per column
- Severity-based alerts
- Early modeling risk detection

**🧩 Categorical Feature Analysis:**

- Top categories
- Frequency bar charts
- Color-coded visualizations

**🔗 Correlation Analysis (Smart & Scalable):**

- Top correlated feature pairs (for large datasets)
- Optional full correlation heatmap
- Human-readable layout (no clutter)

**⚠️ Alerts & Warnings:**

- High missing values
- Duplicate data risks
- Extreme skewness & outliers
- Potential modeling issues


## 🧪 How to Use Cognia?

```
from cognia import eda_report

eda_report(df)
```

✔️ That’s it.

✔️ An HTML EDA report is generated instantly.

✔️ No configuration required.


## 📦 Installation:

Clone the repository and install locally:

```
pip install -e .
```

## 🛠 Built With:

🐍 Python 3.8+

📦 pandas

🔢 numpy

📊 matplotlib

📂 HTML

Lightweight • Fast • Beginner-friendly • Extensible

## LICENSE:
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
## 🏁 Philosophy:

If you can load a DataFrame,
you should be able to understand it.

Cognia makes that possible.



If you find Cognia useful, don’t forget to ⭐ star the repository and share it with fellow data enthusiasts.




