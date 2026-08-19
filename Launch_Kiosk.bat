

@echo off
echo =======================================================
echo    QManagement - Silent Ticket Printing Kiosk Launcher
echo =======================================================
echo.
echo Closing any running Chrome background processes...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Launching Chrome in Silent Printing Kiosk mode...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing http://localhost:3000
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing http://localhost:3000
) else (
    start chrome --kiosk-printing http://localhost:3000
)

echo.
echo Done! Tickets will now print automatically without any print popup dialogs.
