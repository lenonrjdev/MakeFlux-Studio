@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\beta\preparar-release-candidate.ps1" %*
exit /b %ERRORLEVEL%
