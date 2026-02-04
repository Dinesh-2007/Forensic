# 🎯 Create launcher.exe - STEP BY STEP

## 📂 Current Status:

You now have these files ready:
- ✅ launcher_final.bat (recommended - cleanest version)
- ✅ launcher_with_logging.bat (logs admin access)
- ✅ launcher.ps1 (PowerShell version)

---

## 🚀 **OPTION 1: Free Online Converter (EASIEST - 2 minutes)**

### Step 1: Go to this website
👉 https://www.encodeconverter.com/batch-to-exe/

### Step 2: Upload your batch file
1. Click **"Choose File"**
2. Select: `launcher_final.bat` 
   (located at: C:\Users\dines\OneDrive\Desktop\foren\launcher_final.bat)

### Step 3: Enable Admin Mode
- ☑ Check "Require Administrator Privileges"
- ☑ Check "Invisible Mode" (optional - hides the console)

### Step 4: Download
- Click "Convert to EXE"
- You'll get: `launcher.exe`

### Step 5: Save the .exe
1. Save the downloaded file
2. Move it to: `C:\Users\dines\OneDrive\Desktop\foren\launcher.exe`

### Step 6: TEST IT
```powershell
cd "C:\Users\dines\OneDrive\Desktop\foren"
.\launcher.exe
```

What happens:
1. Windows asks for admin permission (click "Yes")
2. Console shows "Starting WinSentinel Server..."
3. Another window opens running the Python server
4. Browser opens to http://localhost:5000
5. Your WinSentinel app loads!

---

## 🛠️ **OPTION 2: Desktop Software (If online doesn't work)**

### Download Batch to EXE Converter
👉 https://www.ncCreations.net/utilities/batchtoexe

### Steps:
1. Download and install the tool
2. Open it
3. Click "**Open**" → Select `launcher_final.bat`
4. Check "**Require Administrator Privileges**"
5. Click "**Convert to EXE**"
6. Name it: `launcher.exe`
7. Save to: `C:\Users\dines\OneDrive\Desktop\foren\`

---

## 💻 **OPTION 3: Command Line (Advanced Users)**

If you have PowerShell installed (most Windows computers do):

### Step 1: Open PowerShell as Administrator
- Right-click Windows Start menu
- Select "Windows PowerShell (Admin)"

### Step 2: Run this command:
```powershell
cd "C:\Users\dines\OneDrive\Desktop\foren"

# Install the conversion tool
Install-Module ps2exe -Scope CurrentUser -Force

# Convert the batch file to exe
ps2exe -InputFile launcher_final.bat -OutputFile launcher.exe -RequireAdmin -Wait
```

### Step 3: Done!
You'll have `launcher.exe` in your foren folder

---

## ✅ Once You Have launcher.exe:

### Test it:
```powershell
cd "C:\Users\dines\OneDrive\Desktop\foren"
.\launcher.exe
```

### What it does:
1. **Windows UAC Popup** - Click "Yes"
2. **Server Starts** - You'll see a black console window
3. **Browser Opens** - Automatically navigates to http://localhost:5000
4. **App Ready** - Your WinSentinel tool is running!

### To stop the server:
- Close the black server console window

---

## 📋 What Each File Does:

| File | Purpose | Best For |
|------|---------|----------|
| launcher_final.bat | Clean, simple launcher | ✅ RECOMMENDED |
| launcher_with_logging.bat | Logs all admin access | Audit trail |
| launcher.ps1 | PowerShell version | Advanced users |
| launcher_wrapper.bat | Wrapper for PowerShell | If ps2exe fails |

---

## 🆘 Troubleshooting:

### "UAC prompt doesn't appear"
- You're already running as admin (this is OK)
- The script will still work normally

### "Python not found"
- Install Python from: https://python.org
- Make sure to check "Add Python to PATH" during installation

### "Server won't start"
- Make sure you're running launcher.exe FROM the correct folder
- The launcher needs to be in: `C:\Users\dines\OneDrive\Desktop\foren\`

### "Browser doesn't open"
- Manually open: http://localhost:5000
- Or check if your default browser is set in Windows

### "Connection refused on localhost:5000"
- Wait another 10 seconds (server might still be initializing)
- Check if Python server window has errors
- Make sure port 5000 isn't being used by another program

---

## 🎁 Bonus: For USB/Pen Drive

Once you have `launcher.exe`:

1. Copy these to your USB:
   - launcher.exe
   - backend/ folder (entire directory)
   - frontend/ folder (entire directory)

2. Plug USB into any Windows computer
3. Double-click launcher.exe
4. App runs instantly!

The script automatically finds files on any drive letter (D:, E:, F:, etc.)

---

## 📊 Progress Checklist:

- [x] Batch files created (launcher_final.bat, launcher_with_logging.bat)
- [x] PowerShell version created (launcher.ps1)
- [x] Privilege logging setup (privilege_checker.py updated)
- [x] Instructions ready (this file!)
- [ ] launcher.exe created (do Steps 1-5 above)
- [ ] launcher.exe tested (run it once)
- [ ] Ready for deployment!

---

**Next Step:** Choose Option 1, 2, or 3 above and create your launcher.exe!

Questions? All the tools are free and straightforward to use. 🚀
