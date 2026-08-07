@echo off
setlocal
cd /d "%~dp0"
start "" powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0OPEN_POC.ps1"
