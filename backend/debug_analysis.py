import sys
import os
import json
sys.path.append(os.getcwd())
from ai_engine.windows_event_analyzer import WindowsEventLogAnalyzer

test_file = "./datasets/System_logs_20260130_184841.csv"
if not os.path.exists(test_file):
    print(f"Error: File {test_file} not found")
    exit(1)

print(f"Testing analysis on {test_file}")

analyzer = WindowsEventLogAnalyzer()
results = analyzer.analyze_event_log(test_file)

if 'error' in results:
    print(f"Analysis FAILED: {results['error']}")
else:
    print("Analysis SUCCESS")
    print(f"Risk Score: {results.get('risk_score', 'N/A')}")
    print(json.dumps(results, indent=2, default=str)[:500]) # First 500 chars
