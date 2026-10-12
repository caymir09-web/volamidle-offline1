@echo off
rem ============================== VOM LAM IDLE - OFFLINE ==============================
rem Chay game tren localhost (khuyen nghi: am thanh + toan bo chuc nang hoat dong)
chcp 65001 >nul
title Vo Lam Idle - Offline
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0server.ps1"
timeout /t 2 >nul
for /f "usebackq delims=" %%i in ("%~dp0server_url.txt") do set "URL=%%i"
if "%URL%"=="" set "URL=http://localhost:8765/"
echo Dang mo game tai %URL%
start "" "%URL%"
echo.
echo (Lua chon 2) Mo truc tiep file index.html van choi duoc,
echo nhung am thanh SFX co the tat vi trinh duyet chan file://.
timeout /t 4 >nul
