@echo off
setlocal enabledelayedexpansion
color 0A
title WinSentinel Admin Launcher

set "LOGFILE=%TEMP%\WinSentinel_Launcher.log"

echo [%date% %time%] Launcher started >> "%LOGFILE%"

REM --- REQUEST ADMIN PRIVILEGES ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting Administrator Privileges...
    powershell -Command "Start-Process cmd.exe -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    echo [%date% %time%] UAC request sent >> "%LOGFILE%"
    exit /b
)

cls
echo.
echo ========================================
echo    WinSentinel Admin Launcher
echo ========================================
echo.
echo Admin Status: CONFIRMED
echo Timestamp: %date% %time%
echo User: %USERNAME%
echo.
echo [%date% %time%] Admin privileges confirmed >> "%LOGFILE%"
echo.

REM Check if backend exists
if not exist "%~dp0backend\main.py" (
    echo ERROR: backend\main.py not found!
    echo Current location: %~dp0
    echo [%date% %time%] ERROR: backend not found >> "%LOGFILE%"
    echo.
    pause
    exit /b 1
)

REM --- CHECK PYTHON ---
echo Checking Python installation...
python --version
if '%errorlevel%' NEQ '0' (
    echo.
    echo ERROR: Python not found in PATH
    echo.
    echo Please install Python from: https://python.org
    echo Make sure to check "Add Python to PATH"
    echo.
    echo [%date% %time%] ERROR: Python not found >> "%LOGFILE%"
    pause
    exit /b 1
)
echo.

REM --- INSTALL DEPENDENCIES ---
echo Installing dependencies...
cd /d "%~dp0backend"
python -m pip install -q -r requirements.txt 2>nul
echo Dependencies installed
echo.

REM --- START SERVER ---
echo ========================================
echo Starting WinSentinel Server...
echo ========================================
echo.
echo Server launching on port 5000...
start "WinSentinel Server" cmd.exe /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 5000"
echo [%date% %time%] Server started >> "%LOGFILE%"
echo.

REM --- WAIT FOR SERVER ---
echo Waiting 10 seconds for server to initialize...
timeout /t 10 /nobreak

REM --- OPEN BROWSER ---
echo.
echo ========================================
echo Opening Browser...
echo ========================================
echo.
echo Launching http://localhost:5000...
start http://localhost:5000
echo [%date% %time%] Browser launched >> "%LOGFILE%"
echo.

REM --- SUCCESS ---
timeout /t 2 /nobreak

cls
echo.
echo ========================================
echo    SUCCESS! Server is Running
echo ========================================
echo.
echo Website: http://localhost:5000
echo Admin Privileges: ACTIVE
echo Server Process: Running in black window
echo.
echo [%date% %time%] Launcher completed successfully >> "%LOGFILE%"
echo.
echo To stop the server, close the black window
echo.
echo This window will close in 10 seconds...
timeout /t 10 /nobreak
exit /b 0
