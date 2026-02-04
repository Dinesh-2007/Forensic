# How to Create launcher.exe Using Online Converter (BEST METHOD)

Since ps2exe is causing issues, here's the easiest solution:

## STEP 1: Use Online Converter

Go to: **https://www.sourcecodester.com/batch-to-exe-converter/**

Or alternative: **https://www.ncreations.net/utilities/batchtoexe**

## STEP 2: Upload File

1. Click "Choose File"
2. Select: `launcher_no_uac.bat`
   (Location: C:\Users\dines\OneDrive\Desktop\foren\launcher_no_uac.bat)

## STEP 3: Settings

- **Check:** ✓ Require Administrator Privileges  
- **Window Style:** Leave as default (Normal)
- **Compression:** Enabled (optional)

## STEP 4: Convert

Click "Convert to EXE" button

## STEP 5: Download & Save

- Save the downloaded file
- Place it in: `C:\Users\dines\OneDrive\Desktop\foren\launcher.exe`

## STEP 6: Test

```powershell
cd "C:\Users\dines\OneDrive\Desktop\foren"
.\launcher.exe
```

---

## Alternative: Run Batch File Directly

If you don't want to wait for online converter, just run the batch file:

```powershell
cd "C:\Users\dines\OneDrive\Desktop\foren"
cmd.exe /c launcher_no_uac.bat
```

This works exactly the same as the .exe and does everything automatically!

---

## What Both Do:

✅ Request Admin Privileges (UAC)
✅ Check Python installation
✅ Install dependencies  
✅ Start server on port 5000
✅ Open browser to http://localhost:5000
✅ Show success message

---

**The batch file itself is working perfectly! The issue is just the exe conversion.**
