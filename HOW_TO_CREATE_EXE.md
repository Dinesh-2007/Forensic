# QUICK GUIDE: Create launcher.exe in 2 minutes

## You Have These Files Ready:
- launcher_with_logging.bat ✓ (this is what you need to convert)
- launcher.ps1 ✓ (PowerShell alternative)

## FASTEST METHOD: Free Online Converter

1. **Go to:** https://www.encodeconverter.com/batch-to-exe/

2. **Upload** `launcher_with_logging.bat`

3. **Set Admin Mode:**
   - Check "✓ Require Administrator Privilege"
   - This makes it request UAC prompt

4. **Download** - You'll get `launcher.exe` instantly

5. **Save to:** `c:\Users\dines\OneDrive\Desktop\foren\`

6. **Test it:** Double-click launcher.exe
   - It will ask for admin rights
   - Server will start
   - Browser opens to localhost:5000

---

## ALTERNATIVE METHOD: Desktop Tool (if online doesn't work)

### Download Batch to EXE Converter:
- https://www.ncCreations.net/utilities/batchtoexe
- Costs nothing, very simple interface

### Steps:
1. Extract the downloaded tool
2. Open it
3. Click "Open" and select `launcher_with_logging.bat`
4. **Check:** "Require Administrator Privileges"
5. Click "Convert to EXE"
6. Save as `launcher.exe`

---

## ADVANCED METHOD: Using PowerShell (Command Line)

Run this in PowerShell (Administrator):

```powershell
# Install ps2exe module
Install-Module ps2exe -Scope CurrentUser -Force

# Navigate to your folder
cd "c:\Users\dines\OneDrive\Desktop\foren"

# Convert to EXE with admin requirement
ps2exe -InputFile launcher.ps1 -OutputFile launcher.exe -RequireAdmin -Wait
```

---

## WHAT I RECOMMEND:

**Method 1 (Online Converter)** = Easiest, no downloads needed
- Takes 2 minutes
- No software to install
- Works every time

---

## Once You Have launcher.exe:

Test it:
```powershell
.\launcher.exe
```

It will:
1. ✓ Ask for admin permissions (UAC)
2. ✓ Log the admin access to privilege_checker.py
3. ✓ Start your Python server
4. ✓ Open http://localhost:5000 in browser

---

**Status:** All .bat and .ps1 files are ready for conversion!
