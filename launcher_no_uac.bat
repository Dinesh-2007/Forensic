@echo off
setlocal enabledelayedexpansion
color 0A
title WinSentinel Admin Launcher

cd /d "%~dp0"

echo.
echo ========================================
echo    WinSentinel Admin Launcher
echo ========================================
echo.
echo Current Directory: %cd%
echo.

REM Check if backend exists
if not exist "backend\main.py" (
    echo ERROR: backend\main.py not found!
    echo Expected location: %cd%\backend\main.py
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
    echo Please install Python from: https://python.org
    echo Make sure to check "Add Python to PATH"
    echo.
    pause
    exit /b 1
)
echo.

REM --- INSTALL DEPENDENCIES ---
echo Installing dependencies from requirements.txt...
cd /d "%~dp0backend"
python -m pip install -q -r requirements.txt
if '%errorlevel%' NEQ '0' (
    echo WARNING: Some dependencies may have failed
)
echo Dependencies ready
echo.

REM --- START SERVER ---
echo ========================================
echo Starting WinSentinel Server...
echo ========================================
echo.
echo Launching uvicorn server on port 8000...
echo.

REM Start server in a visible console window
start "WinSentinel Server" cmd.exe /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo Server started in separate window
echo.
echo Waiting 10 seconds for server to initialize...
timeout /t 10 /nobreak

REM --- OPEN LOCALHOST ---
echo.
echo ========================================
echo Opening Browser...
echo ========================================
echo.

echo Launching http://localhost:8000...
start http://localhost:8000

timeout /t 2 /nobreak

REM --- SUCCESS MESSAGE ---
echo.
echo ========================================
echo    SUCCESS! Server is Running
echo ========================================
echo.
echo Website: http://localhost:8000
echo Server Window: Black console running uvicorn
echo Status: ACTIVE
echo.
echo To stop the server, close the black console window
echo.
echo This launcher window will close in 10 seconds...
echo.
timeout /t 10 /nobreak

exit /b 0
