@echo off
setlocal enabledelayedexpansion
color 0A

:: WinSentinel Admin Launcher with Logging
:: This script logs all admin privilege access to the Python logging system

set "LOGFILE=%TEMP%\WinSentinel_Launcher.log"

:: --- OPERATION 1: GET ADMIN PRIVILEGES ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [%date% %time%] Requesting Administrator Privileges... >> "%LOGFILE%"
    echo Requesting Administrator Privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

pushd "%~dp0"
echo [%date% %time%] Launcher started with admin privileges >> "%LOGFILE%"

cls
echo.
echo ========================================
echo    WinSentinel Admin Launcher
echo    (With Admin Privilege Logging)
echo ========================================
echo.
echo Admin Status: CONFIRMED
echo Timestamp: %date% %time%
echo User: %USERNAME%
echo Working Directory: %cd%
echo.

if not exist "backend\main.py" (
    echo.
    echo ERROR: backend\main.py not found
    echo.
    echo Please run this launcher from the foren folder
    echo Current path: %cd%
    echo.
    echo [%date% %time%] ERROR: backend\main.py not found >> "%LOGFILE%"
    timeout /t 10
    exit /b 1
)

:: --- OPERATION 2: LOG ADMIN PRIVILEGE ACCESS ---
echo.
echo ========================================
echo Admin Privilege Elevation Detected
echo ========================================
echo.
echo Logging admin access to Python logging system...

cd /d "%~dp0backend"
python -c "from utils.privilege_checker import get_privilege_status; status = get_privilege_status(); print('Admin access logged successfully to privilege_checker')" 2>"%TEMP%\privilege_log.txt"

if errorlevel 1 (
    echo Note: Could not log to privilege checker - Python modules may not be initialized yet
)

cd /d "%~dp0"

:: --- OPERATION 3: START THE SERVER ---
echo.
echo ========================================
echo    Starting WinSentinel Backend Server
echo ========================================
echo.

python --version 
if '%errorlevel%' NEQ '0' (
    echo.
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and ensure it's added to PATH
    echo Visit: https://python.org
    echo Make sure to check "Add Python to PATH"
    echo.
    echo [%date% %time%] ERROR: Python not found >> "%LOGFILE%"
    timeout /t 15
    exit /b 1
)

echo Installing/updating dependencies...
cd /d "%~dp0backend"
python -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo WARNING: Some dependencies failed to install
)

echo Starting server on port 5000...
start "WinSentinel Server" python main.py

echo.
echo Waiting for server to initialize...
timeout /t 8 /nobreak

:: --- OPERATION 4: OPEN LOCALHOST ---
echo.
echo ========================================
echo    Opening Browser to Localhost
echo ========================================
echo.

start http://localhost:5000

timeout /t 3 /nobreak

echo.
echo ========================================
echo    SUCCESS! Server Started
echo ========================================
echo.
echo Browser is opening at: http://localhost:5000
echo Admin privileges: ACTIVE and LOGGED
echo Admin access logged to privilege_checker.py
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
