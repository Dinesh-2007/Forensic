@echo off
REM WinSentinel Startup Script for Windows
REM This script sets up and runs both backend and frontend

echo.
echo =====================================================
echo  WinSentinel v1.2.0 - Windows Forensic Analysis
echo =====================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python 3.11+ is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 18+ is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js are installed
echo.

REM Setup Backend
echo =====================================================
echo Setting up Backend...
echo =====================================================
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt -q

echo [OK] Backend setup complete
echo.

REM Setup Frontend
echo =====================================================
echo Setting up Frontend...
echo =====================================================
cd ..\frontend

if not exist node_modules (
    echo Installing Node dependencies...
    npm install
)

echo [OK] Frontend setup complete
echo.

REM Display instructions
echo =====================================================
echo SETUP COMPLETE!
echo =====================================================
echo.
echo To start WinSentinel:
echo.
echo Terminal 1 (Backend API on port 8000):
echo   cd backend
echo   python main.py
echo.
echo Terminal 2 (Frontend Dashboard on port 3000):
echo   cd frontend
echo   npm run dev
echo.
echo Then visit: http://localhost:3000
echo.
echo Documentation:
echo   - QUICKSTART.md for 5-minute setup
echo   - README.md for complete guide
echo   - ARCHITECTURE.md for technical details
echo.
echo =====================================================
echo.

pause
