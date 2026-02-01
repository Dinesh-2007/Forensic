




>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)


pushd "%~dp0backend"


echo.
Write-Host ========================================
Write-Host Admin Privilege Elevation Detected
Write-Host ========================================
echo.


python -c "from utils.privilege_checker import get_privilege_status; get_privilege_status(); print('Admin access logged successfully')" 2>nul


echo.
Write-Host ========================================
Write-Host Starting WinSentinel Backend Server...
Write-Host ========================================
echo.


python --version >nul 2>&1
if '%errorlevel%' NEQ '0' (
    Write-Host ERROR: Python is not installed or not in PATH
    Write-Host Please install Python 3.8+ and ensure it's added to PATH
    pause
    exit /b
)


Write-Host Installing/updating dependencies...
python -m pip install -q -r requirements.txt >nul 2>&1


start "WinSentinel Server" python main.py


echo.
Write-Host Waiting for server to initialize...
timeout /t 8 /nobreak >nul


echo.
Write-Host ========================================
Write-Host Opening Browser to Localhost...
Write-Host ========================================
echo.

start http://localhost:5000

echo.
Write-Host ========================================
Write-Host Server Started Successfully!
Write-Host ========================================
Write-Host Browser opening at: http://localhost:5000
Write-Host Admin privilege access has been logged
Write-Host To stop the server, close the black server window
echo.
pause

