@echo off
:: --- Convert launcher.bat to launcher.exe with Admin Manifest ---
:: This script uses PS2EXE to convert the batch file

echo.
echo =========================================================
echo WinSentinel Launcher - Batch to EXE Converter
echo =========================================================
echo.

:: Check if we're in the correct directory
if not exist "launcher.bat" (
    echo ERROR: launcher.bat not found in current directory
    echo Please run this script from: c:\Users\dines\OneDrive\Desktop\foren\
    pause
    exit /b
)

:: Install ps2exe if not already installed
echo Checking for ps2exe converter...
powershell -Command "if (-not (Get-Module -ListAvailable -Name ps2exe)) { Install-Module -Name ps2exe -Force -Scope CurrentUser }" 2>nul

:: Alternative: Download ps2exe if PowerShell install fails
if not exist "%TEMP%\ps2exe.ps1" (
    echo Downloading ps2exe...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/MScholtes/PS2EXE/raw/master/ps2exe.ps1' -OutFile '%TEMP%\ps2exe.ps1'" 2>nul
)

echo.
echo Converting launcher.bat to launcher.exe...
echo This may take a minute...
echo.

:: Create a VBS script to run batch as executable
setlocal enabledelayedexpansion
set "scriptPath=%~dp0launcher.bat"

:: Create the executable wrapper using a simple method
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $batch = Get-Content '%scriptPath%'; $ps = @' `$batch = @' `n!$batch!`n'@ `; powershell -NoProfile -Command `$batch '@'; [System.IO.File]::WriteAllText('%~dp0launcher.ps1', `$ps)" 2>nul

echo.
echo =========================================================
echo Conversion Complete!
echo =========================================================
echo.
echo Created files:
echo  - launcher.ps1 (PowerShell version)
echo.
echo To create a standalone .exe with Admin Manifest:
echo.
echo OPTION 1 - Using PS2EXE (Recommended):
echo   powershell -ExecutionPolicy Bypass -File "%TEMP%\ps2exe.ps1" -inputFile "%~dp0launcher.ps1" -outputFile "%~dp0launcher.exe" -requireAdmin
echo.
echo OPTION 2 - Using Batch to Exe Converter Tool:
echo   Download: https://www.ncCreations.net/utilities/batchtoexe
echo   Open launcher.bat with the tool and check "Admin Privilege"
echo.
echo OPTION 3 - Manual Method (Resource Hacker):
echo   1. Create launcher.exe with any bat2exe tool
echo   2. Download Resource Hacker: http://www.angusj.com/resourcehacker/
echo   3. Open launcher.exe in Resource Hacker
echo   4. Add admin manifest to make it require admin privileges
echo.
echo For best results, use OPTION 1:
pause

powershell -ExecutionPolicy Bypass -File "%TEMP%\ps2exe.ps1" -inputFile "%~dp0launcher.ps1" -outputFile "%~dp0launcher.exe" -requireAdmin -wait

if exist "%~dp0launcher.exe" (
    echo.
    echo SUCCESS! launcher.exe created successfully!
    echo You can now use launcher.exe to start your WinSentinel server
    echo.
    echo Next steps:
    echo  1. Copy launcher.exe to your pen drive (optional)
    echo  2. Double-click launcher.exe to start the server
    echo  3. It will request admin privileges automatically
    echo  4. Browser will open to http://localhost:5000
    echo.
) else (
    echo.
    echo Conversion via PowerShell may have failed. 
    echo Please try OPTION 2 or OPTION 3 above.
    echo.
)

pause
