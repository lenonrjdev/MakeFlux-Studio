@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\distribuicao\assinar-instaladores-windows.ps1"
set "codigo=%ERRORLEVEL%"
echo.
pause
exit /b %codigo%
