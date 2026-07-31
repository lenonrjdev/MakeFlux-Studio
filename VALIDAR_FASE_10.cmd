@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\validacao\validar-fase-10.ps1"
set "CODIGO=%ERRORLEVEL%"
pause
exit /b %CODIGO%
