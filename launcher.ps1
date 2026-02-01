# WinSentinel Launcher Script (PowerShell Version)
# This script will be converted to launcher.exe

# --- OPERATION 1: GET ADMIN PRIVILEGES ---
function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Host "Requesting Admin Privileges..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Definition
    Start-Process PowerShell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "WinSentinel Admin Launcher" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --- OPERATION 2: LOG ADMIN PRIVILEGE ACCESS ---
Write-Host "Admin privileges detected - Logging access..." -ForegroundColor Green

try {
    Push-Location "$PSScriptRoot\backend"
    
    # Import and call privilege checker
    python -c "from utils.privilege_checker import get_privilege_status; status = get_privilege_status(); print('Admin access logged')" 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Note: Could not log to privilege_checker (Python may not be initialized yet)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Note: Logging not available at startup" -ForegroundColor Gray
}

# --- OPERATION 3: START THE SERVER ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting WinSentinel Backend Server..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install/update dependencies
Write-Host "`nInstalling dependencies from requirements.txt..." -ForegroundColor Yellow
python -m pip install -q -r requirements.txt 2>$null
Write-Host "Dependencies installed" -ForegroundColor Green

# Start the server in a new window
Write-Host "`nLaunching server... waiting 8 seconds for initialization" -ForegroundColor Yellow
Start-Process "python" -ArgumentList "main.py" -WindowStyle Normal

Start-Sleep -Seconds 8

# --- OPERATION 4: OPEN LOCALHOST ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Opening Browser to Localhost..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$localhost = "http://localhost:5000"
Write-Host "Launching browser to $localhost..." -ForegroundColor Green

try {
    Start-Process $localhost
} catch {
    Write-Host "Could not auto-launch browser. Please manually open: $localhost" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Server Started Successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Browser opening at: $localhost" -ForegroundColor Cyan
Write-Host "Admin privileges active and logged" -ForegroundColor Cyan
Write-Host "To stop the server, close the Python window" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to close this launcher window"
Pop-Location
