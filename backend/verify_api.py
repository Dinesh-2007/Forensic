
import requests
import json
import os

BASE_URL = "http://localhost:5006/api"

def test_live_scraping():
    print("\n[TEST] 1. Live Scraping Endpoint...")
    try:
        # Check privileges first
        r = requests.get(f"{BASE_URL}/scrape/privilege-status")
        print(f"Privilege Status: {r.status_code}")
        
        # Start a scrape (volatile only for speed)
        payload = {
            "scope": "volatile_only",
            "include_processes": True,
            "include_registry": False,
            "include_network": False,
            "include_event_logs": False
        }
        r = requests.post(f"{BASE_URL}/scrape/start", json=payload)
        if r.status_code == 200:
            print("Status: 200 OK")
            data = r.json()
            procs = len(data.get("artifacts", {}).get("processes", {}).get("root_processes", []))
            print(f"Finding: Captured {procs} root processes")
        else:
            print(f"FAILED: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"ERROR: {e}")

def test_dataset_management():
    print("\n[TEST] 2. Dataset Management Endpoint...")
    try:
        # Create dummy CSV
        csv_content = "Timestamp,EventID,Message,Severity\n2023-01-01 10:00:00,4624,Login Successful,Info\n2023-01-01 10:05:00,4625,Login Failed,High"
        files = {'file': ('test_log.csv', csv_content, 'text/csv')}
        
        # Upload
        r = requests.post(f"{BASE_URL}/dataset/upload", files=files)
        if r.status_code == 200:
            print("Upload Status: 200 OK")
            print(f"Response: {r.json()}")
            
            # Normalize
            norm_payload = {
                "dataset_name": "test_log.csv",
                "dataset_type": "csv", 
                "timestamp_column": "Timestamp"
            }
            r2 = requests.post(f"{BASE_URL}/dataset/normalize", json=norm_payload)
            print(f"Normalization Status: {r2.status_code}")
        else:
             print(f"Upload FAILED: {r.status_code} - {r.text}")

    except Exception as e:
        print(f"ERROR: {e}")

def test_ai_analysis():
    print("\n[TEST] 3. AI Forensic Engine Endpoint...")
    try:
        # Run analysis on the uploaded file
        # Note: This might mock the AI part if no API key, but should return a valid structure
        r = requests.post(f"{BASE_URL}/analysis/run", params={"dataset_name": "test_log.csv"})
        
        if r.status_code == 200:
            print("Analysis Status: 200 OK")
            data = r.json()
            print(f"Risk Score: {data.get('risk_score')}")
            print(f"Anomalies: {data.get('anomalies_detected')}")
            
            # Check Timeline
            r2 = requests.get(f"{BASE_URL}/analysis/timeline", params={"dataset_name": "test_log.csv"})
            print(f"Timeline Status: {r2.status_code}")
            
            # Check Risk Gauge
            r3 = requests.get(f"{BASE_URL}/analysis/risk-gauge", params={"dataset_name": "test_log.csv"})
            print(f"Risk Gauge Status: {r3.status_code}")
            
        else:
            print(f"Analysis FAILED: {r.status_code} - {r.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")

def test_export():
    print("\n[TEST] 4. Export & Chain of Custody...")
    try:
        payload = {
            "case_id": "TEST_CASE_001",
            "investigator_name": "Automated Tester",
            "export_format": "csv",
            "export_type": "timeline"
        }
        r = requests.post(f"{BASE_URL}/export/forensic-report", json=payload)
        if r.status_code == 200:
             print("Export Status: 200 OK")
             print(f"File Path: {r.json().get('file_path')}")
             
             # Verify Chain of Custody
             r2 = requests.get(f"{BASE_URL}/export/chain-of-custody")
             coc = r2.json().get('chain_of_custody', [])
             print(f"Chain of Custody Entries: {len(coc)}")
        else:
             print(f"Export FAILED: {r.status_code} - {r.text}")
             
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_live_scraping()
    test_dataset_management()
    test_ai_analysis()
    test_export()
