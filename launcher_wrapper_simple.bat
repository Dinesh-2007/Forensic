@echo off
REM This wrapper just calls the batch file
REM It's designed to be a simple cmd.exe launcher
cd /d "%~dp0"
call launcher_no_uac.bat
pause
