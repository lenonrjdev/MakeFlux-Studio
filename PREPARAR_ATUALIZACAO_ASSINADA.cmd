@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\atualizador\preparar-atualizacao-assinada.ps1" %*
exit /b %ERRORLEVEL%
