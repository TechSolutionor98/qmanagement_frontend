@echo off
title QManagement - Live Silent Printing Launcher
color 0B

echo =======================================================
echo   QManagement - Live Silent Ticket Printing Launcher
echo =======================================================
echo.

REM --------------------------------------------------------
REM Live Domain URL
REM --------------------------------------------------------
set "LIVE_URL=https://qtech.techsolutionor.com"

if "%~1" neq "" (
    set "LIVE_URL=%~1"
)

echo Target Live URL: %LIVE_URL%
echo.
echo Closing any running Chrome background processes...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Launching Chrome in Silent Printing Kiosk mode...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "%LIVE_URL%"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing "%LIVE_URL%"
) else (
    start chrome --kiosk-printing "%LIVE_URL%"
)

echo.
echo =======================================================
echo  Chrome launched successfully for https://qtech.techsolutionor.com!
echo  Tickets will print automatically without print popups.
echo =======================================================
timeout /t 3 >nul
