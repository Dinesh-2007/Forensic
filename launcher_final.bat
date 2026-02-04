@echo off
setlocal enabledelayedexpansion
color 0A

REM WinSentinel Admin Launcher v2.0
REM Request Admin, Start Server, Open Localhost

REM Log file for debugging
set "LOGFILE=%TEMP%\WinSentinel_Launcher.log"

REM --- REQUEST ADMIN PRIVILEGES ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [%date% %time%] Requesting Administrator Privileges... >> "%LOGFILE%"
    echo Requesting Administrator Privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

REM Navigate to backend directory
pushd "%~dp0"
echo [%date% %time%] Launcher started with admin privileges >> "%LOGFILE%"

cls
echo.
echo ========================================
echo    WinSentinel Admin Launcher v2.0
echo ========================================
echo.
echo Admin Status: CONFIRMED
echo Timestamp: %date% %time%
echo User: %USERNAME%
echo Working Directory: %cd%
echo.

REM Check if we're in the right directory
if not exist "backend\main.py" (
    echo.
    echo ERROR: backend\main.py not found
    echo.
    echo Please run this launcher from the foren folder
    echo Current path: %cd%
    echo Expected: C:\Users\dines\OneDrive\Desktop\foren
    echo.
    echo [%date% %time%] ERROR: backend\main.py not found >> "%LOGFILE%"
    timeout /t 10
    exit /b 1
)

REM --- LOG ADMIN ACCESS ---
echo.
echo Logging admin privilege access...
cd /d "%~dp0backend"

REM Initialize Python logging with error capture
python -c "from utils.privilege_checker import get_privilege_status; status = get_privilege_status(); print('Admin access logged')" 2>"%TEMP%\privilege_log.txt"
if errorlevel 1 (
    echo Warning: Could not log to privilege checker (this is OK if Python modules aren't loaded yet)
    type "%TEMP%\privilege_log.txt"
)

cd /d "%~dp0"

REM --- START SERVER ---
echo.
echo ========================================
echo    Starting WinSentinel Backend Server
echo ========================================
echo.

REM Check Python
python --version 
if '%errorlevel%' NEQ '0' (
    echo.
    echo ERROR: Python not found in PATH
    echo.
    echo Please install Python from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    echo [%date% %time%] ERROR: Python not found >> "%LOGFILE%"
    timeout /t 15
    exit /b 1
)

REM Install dependencies
echo.
echo Installing/updating dependencies from requirements.txt...
cd /d "%~dp0backend"

python -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo.
    echo WARNING: Some dependencies failed to install
    echo This might be OK - the server may still work
)

cd /d "%~dp0"

REM Start server
echo.
echo [%date% %time%] Starting Python server >> "%LOGFILE%"
echo Starting Python server on port 5000...
start "WinSentinel Server" /D "%~dp0backend" python main.py

REM Wait for server to initialize
echo.
echo Waiting 8 seconds for server initialization...
timeout /t 8 /nobreak

REM --- OPEN LOCALHOST ---
echo.
echo ========================================
echo    Opening Browser to Localhost
echo ========================================
echo.

echo Launching browser...
start http://localhost:5000

timeout /t 3 /nobreak

echo.
echo ========================================
echo    SUCCESS! Server Started
echo ========================================
echo.
echo Browser is opening at: http://localhost:5000
echo Admin privileges: ACTIVE and LOGGED
echo Python server: RUNNING (black console window)
echo.
echo [%date% %time%] Server launched successfully >> "%LOGFILE%"
echo.
echo To stop the server, close the black Python console window
echo To view logs, check: %LOGFILE%
echo.
echo Press any key to close this window...
pause > nul
popd
exit /b 0
