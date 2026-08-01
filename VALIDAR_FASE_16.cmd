@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\validacao\validar-fase-16.ps1"
set "CODIGO=%ERRORLEVEL%"
echo.
pause
exit /b %CODIGO%
