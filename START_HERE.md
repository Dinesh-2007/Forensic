# WinSentinel - FINAL LAUNCHER SETUP

## ✅ Status: COMPLETE AND WORKING

Your WinSentinel forensic analysis tool is now fully configured with:
- ✅ Admin privilege elevation
- ✅ Automatic server startup
- ✅ Frontend compiled and ready
- ✅ Localhost browser launch
- ✅ Admin access logging

---

## 🚀 HOW TO RUN WINSSENTINEL

### **OPTION 1: RECOMMENDED - Use the Shortcut (Easiest)**

**File:** `WinSentinel.lnk` (in your main folder)

1. Double-click **WinSentinel.lnk**
2. Click "Yes" when UAC prompt appears
3. A command window opens with green text
4. Browser automatically opens to http://localhost:5000
5. Your app loads!

✅ This is the most reliable method

---

### **OPTION 2: Use the Batch File Directly**

**File:** `launcher_no_uac.bat` (in your main folder)

1. Double-click **launcher_no_uac.bat**
2. Click "Yes" when UAC prompt appears
3. Green command window shows status
4. Browser opens to http://localhost:5000
5. App loads!

---

### **OPTION 3: Use the EXE (experimental)**

**File:** `launcher.exe` (in your main folder)

- If shortcut or batch don't work
- Double-click and follow prompts

---

## 📋 What Each Component Does

| Component | Purpose |
|-----------|---------|
| **WinSentinel.lnk** | Shortcut (launches batch file) |
| **launcher.exe** | Compiled executable (if batch fails) |
| **launcher_no_uac.bat** | Main batch file that starts everything |
| **backend/** | Python FastAPI server |
| **frontend/dist/** | Built React application |

---

## ⚙️ What Happens When You Launch

1. **UAC Prompt** → Click "Yes" for admin privileges
2. **Admin confirmed** → Green text shows "Admin Status: CONFIRMED"
3. **Dependencies check** → Shows Python version and pip status
4. **Server starts** → Black command window opens (the running server)
5. **Wait 10 seconds** → Server initializes
6. **Browser opens** → Automatically navigates to http://localhost:5000
7. **App loads** → Your WinSentinel dashboard appears
8. **Success message** → Shows "SUCCESS! Server is Running"

---

## 🛑 To Stop the Server

Simply close the **black command window** (the one showing uvicorn/Python server)

The launcher window will automatically close after 10 seconds.

---

## 📊 What Gets Logged

Admin privilege access is logged to:
- `backend/utils/privilege_checker.py` (Python logging)
- `%TEMP%\WinSentinel_Launcher.log` (Launcher debug log)

---

## 🔧 Port Information

- **Frontend:** Served on port **5000**
- **Backend API:** Available at http://localhost:5000/api/
- **Frontend URL:** http://localhost:5000

---

## ✨ Key Features

✅ **Admin Privileges** - Automatically elevated via UAC
✅ **Privilege Logging** - All admin access tracked
✅ **Live Scraping** - Windows event/process/registry capture
✅ **AI Analysis** - Anomaly detection on forensic data
✅ **Web Dashboard** - Modern React interface

---

## 📖 Usage Tips

### First Time Running
1. Use **WinSentinel.lnk** shortcut
2. Click "Yes" on UAC prompt
3. Wait for browser to open
4. Your app is ready to use!

### Troubleshooting

**Browser shows "Cannot reach server":**
- Wait another 5 seconds (server might still loading)
- Check the black server window for any errors
- Make sure no other app is using port 5000

**Python not found error:**
- Install Python from https://python.org
- During installation, check "Add Python to PATH"
- Restart your computer

**Dependencies won't install:**
- May need Admin Command Prompt
- Try running: `cd backend && pip install -r requirements.txt`

---

## 📂 File Structure

```
foren/
├── launcher.exe              ← Executable launcher
├── launcher_no_uac.bat      ← Batch file launcher  
├── WinSentinel.lnk          ← Shortcut (RECOMMENDED)
├── backend/                 ← Python FastAPI server
│   ├── main.py             ← Server entry point
│   └── requirements.txt     ← Dependencies
└── frontend/                ← React application
    ├── src/                ← Source code
    └── dist/               ← Compiled build
```

---

## 🎯 QUICK START

**Just want to run it?**

→ **Double-click WinSentinel.lnk**

That's it! Everything else happens automatically. ✨

---

**Version:** 1.2.0  
**Date:** January 31, 2026  
**Status:** ✅ PRODUCTION READY
