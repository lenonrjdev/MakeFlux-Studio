@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\validacao\validar-fase-17.ps1"
set "CODIGO=%ERRORLEVEL%"
pause
exit /b %CODIGO%
