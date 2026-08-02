@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\atualizador\preparar-atualizacao-1.9.1.ps1" %*
exit /b %ERRORLEVEL%
