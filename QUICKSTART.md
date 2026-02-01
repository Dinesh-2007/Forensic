# WinSentinel Quick Start Guide

## 5-Minute Setup

### Step 1: Install Backend Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Start Backend (Terminal 1)
```bash
cd backend
python main.py
```
✅ API available at `http://localhost:8000`

### Step 4: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Dashboard available at `http://localhost:3000`

---

## Using WinSentinel

### Page 1: Live Scraping
1. Click **Live Scraping** tab
2. Select collectors (Processes, Registry, Network, Events)
3. Click **Start Live Scraping**
4. View real-time telemetry and integrity hashes
5. Data is automatically SHA-256 hashed

### Page 2: Dataset Management
1. Click **Dataset Management** tab
2. Drag-and-drop your CSV/JSON/EVTX file
3. Configure column mappings:
   - **Timestamp Column**: (e.g., `Stime` for UNSW-NB15)
   - **Source IP Column**: (e.g., `srcip`)
4. Click **Normalize Dataset**
5. Click **Deduplicate** to remove duplicates

### Page 3: AI Forensic Engine
1. Click **AI Forensic Engine** tab
2. Enter dataset name (from Page 2)
3. Click **Run Analysis**
4. View:
   - 📊 Risk Gauge (0-100%)
   - 📈 Infection Timeline (Golden Thread)
   - 🎯 Parameter Breakdown
   - 🤖 AI Explanations (XAI)
5. Click **Download Forensic CSV Report**

---

## Example Workflow

### Scenario: Analyzing UNSW-NB15 Dataset

```bash
# 1. Download UNSW-NB15 from:
# https://www.unsw.adfa.edu.au/unsw-canberra-cyber/cybersecurity/UNSW-NB15-Datasets/

# 2. Extract UNSW_NB15_training-set.csv

# 3. Upload via Page 2:
#    - Drag UNSW_NB15_training-set.csv
#    - Timestamp Column: "Stime"
#    - Source IP Column: "srcip"
#    - Click Normalize

# 4. Analyze via Page 3:
#    - Dataset Name: "UNSW_NB15_training-set.csv"
#    - Click "Run Analysis"
#    - Wait 30-60 seconds for results

# 5. Export Report:
#    - Click "Download Forensic CSV Report"
#    - File saved to ./forensic_exports/
```

---

## API Testing with cURL

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Start Live Scrape
```bash
curl -X POST http://localhost:8000/api/scrape/start \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "full_system",
    "include_processes": true,
    "include_registry": true,
    "include_network": true,
    "include_event_logs": true
  }'
```

### Upload Dataset
```bash
curl -X POST http://localhost:8000/api/dataset/upload \
  -F "file=@UNSW_NB15_training-set.csv"
```

### Normalize Dataset
```bash
curl -X POST http://localhost:8000/api/dataset/normalize \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_name": "UNSW_NB15_training-set.csv",
    "dataset_type": "csv",
    "timestamp_column": "Stime",
    "source_ip_column": "srcip"
  }'
```

### Run AI Analysis
```bash
curl http://localhost:8000/api/analysis/run?dataset_name=UNSW_NB15_training-set.csv
```

### Export Forensic Report
```bash
curl -X POST http://localhost:8000/api/export/forensic-report \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "CASE_2026_001",
    "investigator_name": "Jane Investigator",
    "export_format": "csv",
    "export_type": "timeline"
  }'
```

---

## Key Windows Forensic Data Points

WinSentinel focuses on these critical artifacts:

### Process Forensics
- **Parent/Child Relationships**: Detect cmd.exe spawned from explorer.exe
- **Suspicious Paths**: Processes in TEMP, AppData, ProgramData
- **Command Line Arguments**: Base64 encoding, -nop (PowerShell)

### Registry Forensics
- **Run Keys**: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
- **User Assist**: Program execution history
- **Services**: Unusual service installations

### Network Forensics
- **Non-Standard Ports**: 4444, 5555, 6666, 31337
- **C2 Beacons**: Regularly timed connections
- **Data Exfiltration**: Large transfers on small requests

### Event Log Forensics
- **Event 4688**: Process creation (shows command lines)
- **Event 4624/4625**: Logon activity (brute force detection)
- **Event 4104**: PowerShell script block (fileless malware)
- **Event 1102**: Audit log cleared (evidence tampering)

---

## MITRE ATT&CK Mapping

WinSentinel detects these attack techniques:

- **T1547.001**: Boot or Logon Autostart Execution (Registry Run)
- **T1059.001**: PowerShell execution
- **T1021**: Lateral Movement
- **T1134**: Access Token Manipulation (Privilege Escalation)
- **T1105**: Ingress Tool Transfer (File downloads)
- **T1566**: Phishing
- **T1566.001**: Phishing: Spearphishing

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'pywin32'"
```bash
pip install pywin32
python Scripts/pywin_postinstall.py -install
```

### "Cannot connect to localhost:8000"
Check that backend is running:
```bash
netstat -ano | findstr :8000
```

### "Cannot import win32evtlog"
Reinstall pywin32:
```bash
pip uninstall pywin32 -y
pip install pywin32
```

### React "Failed to fetch API"
Ensure backend CORS is enabled (it is by default):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Allows frontend on :3000
    allow_credentials=True,
)
```

---

## Performance Tips

- **Large Datasets**: Deduplicate first to reduce rows
- **Slow Analysis**: Lower `contamination` in anomaly detector for faster results
- **Memory Issues**: Process in chunks (`chunksize=50000`)
- **Database**: Use TimescaleDB for production (automatic compression)

---

## Next Steps

1. ✅ Try **Live Scraping** on your Windows system
2. ✅ Upload a public dataset (UNSW-NB15 or CICIDS2017)
3. ✅ Run AI analysis and review timeline
4. ✅ Export forensic report (court-ready)
5. ✅ Customize AI models in `config.py`

---

## Support Resources

- **Windows Forensics**: https://www.sans.org/white-papers/
- **MITRE ATT&CK**: https://attack.mitre.org/
- **UNSW-NB15**: https://www.unsw.adfa.edu.au/unsw-canberra-cyber/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Scikit-Learn**: https://scikit-learn.org/

---

**WinSentinel v1.2.0** - AI-Powered Windows Forensic Analysis
Status: ✅ Ready to Use | Last Updated: 2026-01-31
