@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\validacao\validar-fase-21.ps1"
exit /b %ERRORLEVEL%
