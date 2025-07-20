@echo off
echo ========================================
echo Stopping E.ON Team Pause Management System
echo ========================================
echo.

:: Stop ngrok processes
echo Stopping ngrok processes...
taskkill /f /im ngrok.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ngrok processes stopped
) else (
    echo ℹ️ No ngrok processes found
)

:: Stop Node.js processes
echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️ No Node.js processes found
)

:: Alternative method: Kill processes on port 5000
echo Checking for processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Stopping process PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ✅ Server stopped successfully!
echo.
pause 