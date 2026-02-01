@echo off
REM WinSentinel Launcher Wrapper
REM This wrapper ensures the launcher runs properly and stays visible

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Log any errors
set "LOGFILE=%TEMP%\WinSentinel_Launcher_Debug.log"

echo. >> "%LOGFILE%"
echo [%date% %time%] Launcher wrapper started >> "%LOGFILE%"
echo Current directory: %cd% >> "%LOGFILE%"

REM Run the actual launcher batch file
call launcher_no_uac.bat

REM Check if batch file ran successfully
if '%errorlevel%' NEQ '0' (
    echo. >> "%LOGFILE%"
    echo [%date% %time%] ERROR: launcher_no_uac.bat failed with code %errorlevel% >> "%LOGFILE%"
    echo.
    echo ERROR: Launcher failed to start!
    echo Error code: %errorlevel%
    echo Check log: %LOGFILE%
    echo.
    pause
    exit /b %errorlevel%
)

echo [%date% %time%] Launcher wrapper completed successfully >> "%LOGFILE%"
exit /b 0
