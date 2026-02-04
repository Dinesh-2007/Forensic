# WinSentinel Admin Launcher - Complete Setup Guide

## Overview
This guide will help you create a single `.exe` file that automatically:
1. **Requests Administrator Privileges** (UAC prompt)
2. **Starts your Python backend server**
3. **Opens the application in localhost**
4. **Logs all admin privilege access**

---

## Files Created

### 1. `launcher.bat` (Basic Version)
- Simple batch script with admin privilege handling
- No logging integration
- Good for testing

### 2. `launcher_with_logging.bat` (Recommended)
- Includes admin privilege logging to your privilege_checker.py
- Tracks every time the launcher is run with admin rights
- Better for forensic auditing

### 3. `convert_to_exe.bat` (Conversion Tool)
- Automates the batch-to-exe conversion process

---

## Step-by-Step Instructions

### Method 1: Using the Conversion Script (Easiest)

1. **Navigate to your project folder:**
   ```powershell
   cd "c:\Users\dines\OneDrive\Desktop\foren"
   ```

2. **Run the conversion script:**
   ```powershell
   .\convert_to_exe.bat
   ```

3. **Follow the prompts** - The script will automatically:
   - Check for ps2exe converter
   - Convert launcher.bat to launcher.exe
   - Add admin manifest automatically
   - Create a final executable

4. **Test the executable:**
   ```powershell
   .\launcher.exe
   ```

---

### Method 2: Manual Conversion (Using PS2EXE)

1. **Install PS2EXE in PowerShell (as Admin):**
   ```powershell
   Install-Module -Name ps2exe -Force
   ```

2. **Convert the batch file:**
   ```powershell
   $source = "C:\Users\dines\OneDrive\Desktop\foren\launcher.bat"
   $dest = "C:\Users\dines\OneDrive\Desktop\foren\launcher.exe"
   ps2exe -InputFile $source -OutputFile $dest -RequireAdmin
   ```

3. **Test it:**
   ```powershell
   & "C:\Users\dines\OneDrive\Desktop\foren\launcher.exe"
   ```

---

### Method 3: Using Batch to EXE Converter Tool

1. **Download:** [Batch to EXE Converter](https://www.ncCreations.net/utilities/batchtoexe)

2. **Steps:**
   - Open the application
   - Select `launcher.bat` or `launcher_with_logging.bat`
   - Check "**Require Administrator Privileges**"
   - Click "Convert"
   - Save as `launcher.exe`

---

### Method 4: Using Resource Hacker (Most Control)

1. **Create initial .exe using any bat2exe tool**
2. **Download:** [Resource Hacker](http://www.angusj.com/resourcehacker/)
3. **Open launcher.exe in Resource Hacker**
4. **Add Admin Manifest:**
   - Right-click on "24" (Manifest folder)
   - Select "Add Resource"
   - Paste this XML:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <assemblyIdentity
    version="1.0.0.0"
    processorArchitecture="*"
    name="WinSentinel.Launcher"
    type="win32"
  />
  <description>WinSentinel Server Launcher</description>
  <trustInfo xmlns="urn:schemas-microsoft-com:security">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="requireAdministrator" uiAccess="false"/>
      </requestedPrivileges>
    </security>
  </trustInfo>
</assembly>
```

5. **Save** - Click File > Save

---

## What Happens When You Run launcher.exe

1. **Windows UAC Dialog Appears**
   - User clicks "Yes" to grant admin privileges

2. **Server Initializes** (8 second wait for startup)
   - Installs/updates Python dependencies from requirements.txt
   - Launches `python main.py` in a new window

3. **Admin Privilege Logged**
   - If using `launcher_with_logging.bat`, logs the access via privilege_checker.py
   - Timestamp, user, and status recorded

4. **Browser Opens Automatically**
   - Default browser navigates to http://localhost:5000

5. **Application Ready**
   - You can now use WinSentinel frontend
   - Close the black server window to stop the server

---

## For Pen Drive/USB Portability

1. **Copy these files to your USB:**
   - `launcher.exe` (or the batch file)
   - `backend/` folder (entire directory)
   - `frontend/` folder (entire directory)

2. **Run from any computer:**
   - Plug in USB
   - Double-click `launcher.exe`
   - The script automatically finds files regardless of drive letter (D:, E:, F:, etc.)

---

## Troubleshooting

### "Python is not installed or not in PATH"
- Install Python from https://python.org
- During installation, **check "Add Python to PATH"**

### "Module not found" errors
- The script automatically runs `pip install -r requirements.txt`
- If still failing, manually run:
  ```powershell
  cd backend
  pip install -r requirements.txt
  ```

### Browser doesn't open
- Ensure you have a default browser set (Chrome, Firefox, Edge, etc.)
- Manually navigate to http://localhost:5000

### UAC prompt doesn't appear
- The script checks for admin privileges
- If already running as admin, no prompt appears (this is normal)

### Firewall blocking port 5000
- Firewall should allow Python.exe through
- Admin privileges (which the launcher provides) help bypass some restrictions
- If still blocked, check Windows Defender Firewall settings

---

## Logging & Audit Trail

When using `launcher_with_logging.bat`, all admin privilege access is logged to:
- **Python logging system** (configured in `backend/utils/privilege_checker.py`)
- **Logs include:**
  - Timestamp of launch
  - Current Windows user
  - Admin status confirmation
  - Working directory
  - Python version

View logs by checking the console output when launching.

---

## Security Notes

⚠️ **Important:** This executable will request Administrator Privileges
- Only run on computers you trust
- Don't share the .exe with untrusted sources
- The batch script code is visible and auditable for security

---

## Next Steps

1. **Create the .exe:** Run one of the methods above
2. **Test locally:** Double-click launcher.exe
3. **Verify logging:** Check privilege_checker.py logs
4. **Deploy to USB:** Copy launcher.exe to your pen drive (optional)

---

## Quick Reference Commands

```powershell
# Navigate to project
cd "c:\Users\dines\OneDrive\Desktop\foren"

# Method 1: Run conversion script
.\convert_to_exe.bat

# Method 2: Manual PS2EXE conversion
ps2exe -InputFile "launcher.bat" -OutputFile "launcher.exe" -RequireAdmin

# Test the executable
.\launcher.exe

# View privilege logs
Get-Content "backend/privilege_access_log.txt" -Tail 50
```

---

**Created:** January 31, 2026
**Project:** WinSentinel Forensic Analysis Tool
**Version:** 1.0
