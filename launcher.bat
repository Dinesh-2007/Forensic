@echo off
setlocal enabledelayedexpansion
color 0A

:: WinSentinel Admin Launcher
:: This script handles admin privileges, starts the server, and opens localhost

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

:: --- OPERATION 2: START THE SERVER ---
echo.
echo ========================================
echo    Starting WinSentinel Backend Server
echo ========================================
echo.

:: Check for portable python first
if exist "tools\python\python.exe" (
    set "PYTHON_CMD=tools\python\python.exe"
    set "PIP_CMD=tools\python\python.exe -m pip"
    set "PATH=%~dp0tools\python;%~dp0tools\python\Scripts;%PATH%"
    echo Found portable Python...
) else (
    python --version >nul 2>&1
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
    set "PYTHON_CMD=python"
    set "PIP_CMD=python -m pip"
)

echo Installing/updating dependencies...
cd /d "%~dp0backend"
%PIP_CMD% install -q -r requirements.txt
if errorlevel 1 (
    echo WARNING: Some dependencies failed to install
)

echo Starting server on port 5000...
start "WinSentinel Server" %PYTHON_CMD% main.py

echo.
echo Waiting for server to initialize...
timeout /t 8 /nobreak

:: --- OPERATION 3: OPEN LOCALHOST ---
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
echo Admin privileges: ACTIVE
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
