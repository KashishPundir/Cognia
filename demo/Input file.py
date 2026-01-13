import os
from cognia import eda_report

html_path = eda_report(df)

# Open html file -> Directing to new page in browser
os.startfile(html_path)
