# WinSentinel Documentation Index

Welcome to **WinSentinel v1.2.0** - AI-Powered Windows Forensic Analysis Platform

## 📚 Documentation Files

### For First-Time Users
1. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** ⭐ **START HERE**
   - Project overview (5 min read)
   - What has been created (complete inventory)
   - Technology stack summary
   - Quick feature checklist
   - Learning outcomes

2. **[QUICKSTART.md](QUICKSTART.md)** 🚀 **5-Minute Setup**
   - Step-by-step installation
   - Start backend & frontend
   - First workflow example
   - API testing with cURL
   - Troubleshooting quick fixes

3. **[README.md](README.md)** 📖 **Complete User Guide**
   - Detailed overview (1,200 lines)
   - Installation instructions
   - Full API endpoint documentation
   - Feature explanations
   - Configuration options
   - References & resources

### For Developers & Architects
4. **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗️ **Technical Deep-Dive**
   - System architecture diagram
   - Data flow (Live Scraping → Analysis → Export)
   - AI models explained (Isolation Forest, Sequence Analyzer)
   - Network dataset features
   - Windows Event Log IDs
   - Forensic export schema
   - Configuration tuning guide
   - Database schema (PostgreSQL + TimescaleDB)

### For Operations & Deployment
5. **[DEPLOYMENT.md](DEPLOYMENT.md)** ⚙️ **Production Guide**
   - File structure reference
   - Feature checklist (verification)
   - Scaling strategies (single → multi-machine)
   - Docker deployment
   - Testing procedures
   - Maintenance tasks
   - Troubleshooting guide
   - Monitoring setup

---

## 🎯 Quick Navigation

### I want to...

**Get started quickly (5 minutes)**
→ Read [QUICKSTART.md](QUICKSTART.md)

**Understand the full system**
→ Read [README.md](README.md)

**Learn technical architecture**
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

**Deploy to production**
→ Read [DEPLOYMENT.md](DEPLOYMENT.md)

**Understand what was created**
→ Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**Find API endpoints**
→ See README.md section "API Endpoints"

**Configure AI models**
→ See ARCHITECTURE.md section "Configuration Tuning Guide"

**Troubleshoot issues**
→ See QUICKSTART.md section "Troubleshooting"

**Scale to multiple machines**
→ See DEPLOYMENT.md section "Scaling to Production"

---

## 📂 Project Structure

```
foren/
├── 📄 PROJECT_SUMMARY.md       ← Start here for overview
├── 📄 QUICKSTART.md            ← Start here for hands-on
├── 📄 README.md                ← Complete reference
├── 📄 ARCHITECTURE.md          ← Technical details
├── 📄 DEPLOYMENT.md            ← Production guide
├── 📄 INDEX.md (this file)     ← Navigation
├── .gitignore                  ← Git configuration
│
├── backend/                    ← Python FastAPI
│   ├── main.py                 ← API server (400 lines)
│   ├── config.py               ← Configuration
│   ├── requirements.txt        ← Dependencies
│   ├── scrapers/               ← Windows data collection
│   │   ├── process_scraper.py
│   │   ├── registry_scraper.py
│   │   ├── network_scraper.py
│   │   └── event_log_scraper.py
│   ├── ai_engine/              ← Machine learning
│   │   ├── anomaly_detector.py
│   │   └── sequence_analyzer.py
│   ├── data_normalization/     ← Schema unification
│   │   └── normalizer.py
│   ├── database/               ← Database integration
│   │   └── db_client.py
│   ├── exporters/              ← Forensic exports
│   │   └── export_manager.py
│   └── models/                 ← Pre-trained models (future)
│
└── frontend/                   ← React.js dashboard
    ├── package.json            ← NPM dependencies
    ├── vite.config.js          ← Build configuration
    ├── tailwind.config.js      ← CSS framework
    ├── postcss.config.js       ← PostCSS config
    ├── index.html              ← HTML entry point
    └── src/
        ├── main.jsx            ← React entry
        ├── App.jsx             ← Main component
        ├── index.css           ← Styles
        └── pages/
            ├── Page1LiveScraping.jsx          ← Live scraping
            ├── Page2DatasetManagement.jsx     ← Upload & normalize
            └── Page3AIForensicEngine.jsx      ← Analysis & timeline
```

---

## 🚀 Getting Started Path

### Step 1: Understand What You Have (10 min)
- Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- Review project structure above
- Check feature checklist

### Step 2: Install & Run (5 min)
- Follow [QUICKSTART.md](QUICKSTART.md)
- Start backend: `python backend/main.py`
- Start frontend: `npm run dev` in frontend/
- Open http://localhost:3000

### Step 3: Explore Features (20 min)
- **Page 1**: Try live scraping (requires admin)
- **Page 2**: Upload sample dataset (CSV)
- **Page 3**: Run AI analysis, view timeline

### Step 4: Deep Dive (1-2 hours)
- Read [README.md](README.md) for detailed docs
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Test API endpoints with cURL (in QUICKSTART.md)

### Step 5: Production Deployment (As needed)
- Read [DEPLOYMENT.md](DEPLOYMENT.md)
- Configure database (PostgreSQL + TimescaleDB)
- Deploy with Docker or Gunicorn
- Set up monitoring & backups

---

## 📊 File Statistics

| Document | Lines | Read Time | Purpose |
|----------|-------|-----------|---------|
| PROJECT_SUMMARY.md | 500 | 15 min | Project overview |
| QUICKSTART.md | 300 | 10 min | Hands-on setup |
| README.md | 1,200 | 45 min | Complete reference |
| ARCHITECTURE.md | 1,000 | 40 min | Technical details |
| DEPLOYMENT.md | 500 | 20 min | Operations guide |
| **Total** | **3,500** | **2 hours** | Full mastery |

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend runs on http://localhost:8000/health
- [ ] Frontend loads on http://localhost:3000
- [ ] Page 1 (Live Scraping) accessible
- [ ] Page 2 (Dataset Management) accessible
- [ ] Page 3 (AI Engine) accessible
- [ ] Can upload CSV file
- [ ] Can run analysis
- [ ] Can export report

All checked? 🎉 **You're ready to use WinSentinel!**

---

## 🔧 Common Tasks

### Run Backend
```bash
cd backend
python main.py
```

### Run Frontend
```bash
cd frontend
npm run dev
```

### Test API
```bash
curl http://localhost:8000/health
```

### Upload Dataset
```bash
curl -X POST http://localhost:8000/api/dataset/upload \
  -F "file=@your_dataset.csv"
```

### Run Analysis
```bash
curl http://localhost:8000/api/analysis/run?dataset_name=your_dataset.csv
```

### Download Report
```bash
curl -X POST http://localhost:8000/api/export/forensic-report \
  -H "Content-Type: application/json" \
  -d '{"case_id":"TEST_001","investigator_name":"You","export_format":"csv","export_type":"timeline"}'
```

---

## 📞 Finding Help

| Question | Answer Location |
|----------|-----------------|
| "How do I install this?" | [QUICKSTART.md](QUICKSTART.md) |
| "What features does it have?" | [README.md](README.md) or [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| "How do I use Page 3?" | [README.md](README.md) → "Page 3: AI Forensic Engine" |
| "What are the API endpoints?" | [README.md](README.md) → "API Endpoints" |
| "How do the AI models work?" | [ARCHITECTURE.md](ARCHITECTURE.md) → "AI Models Deep Dive" |
| "How do I configure detection?" | [ARCHITECTURE.md](ARCHITECTURE.md) → "Configuration Tuning" |
| "How do I deploy to production?" | [DEPLOYMENT.md](DEPLOYMENT.md) |
| "What do I do if something breaks?" | [QUICKSTART.md](QUICKSTART.md) → "Troubleshooting" |
| "What technologies are used?" | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) → "Technology Stack" |

---

## 🎓 Learning Resources

### In This Project
- 5,900+ lines of production code
- 3,500 lines of documentation
- 35+ Python/JavaScript files
- Code examples in every guide
- API demos with cURL

### External Resources
- **Windows Forensics**: https://www.sans.org/
- **MITRE ATT&CK**: https://attack.mitre.org/
- **UNSW-NB15 Dataset**: https://www.unsw.adfa.edu.au/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

---

## 📈 Next Steps

### Immediate (Today)
1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Follow [QUICKSTART.md](QUICKSTART.md)
3. Run backend + frontend
4. Explore all 3 pages

### Short-term (This Week)
1. Read [README.md](README.md)
2. Download UNSW-NB15 dataset
3. Upload and analyze
4. Export forensic report
5. Review results

### Medium-term (This Month)
1. Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. Customize AI parameters
3. Test with real incident data
4. Create custom scrapers
5. Integrate with your SIEM

### Long-term (Ongoing)
1. Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. Deploy to production
3. Set up database
4. Configure monitoring
5. Train incident response team

---

## 🏆 Success Metrics

✅ **You've successfully set up WinSentinel if:**

- Backend API responding on :8000
- Frontend dashboard loading on :3000
- Can upload CSV dataset
- Can run AI analysis
- Can export forensic report
- Can view risk gauge + timeline
- Can read XAI explanations

**Estimated Time: 30 minutes from start to first analysis**

---

## 📞 Support

For issues or questions:
1. Check [QUICKSTART.md](QUICKSTART.md) → "Troubleshooting"
2. Review [README.md](README.md) → "Troubleshooting"
3. Search [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production issues

---

## 📋 Document Purposes

| Document | Best For | Audience |
|----------|----------|----------|
| PROJECT_SUMMARY.md | Overview | Everyone |
| QUICKSTART.md | Getting started | First-time users |
| README.md | Reference | End users |
| ARCHITECTURE.md | Deep learning | Developers |
| DEPLOYMENT.md | Production | DevOps/Operators |

---

**WinSentinel v1.2.0** ✅ Production Ready
**Total Documentation**: 3,500 lines across 5 files
**Status**: Complete & Ready for Use
**Last Updated**: 2026-01-31

👉 **Start with [QUICKSTART.md](QUICKSTART.md) for immediate use**
👉 **Or read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for overview**

Good luck! 🚀
