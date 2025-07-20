@echo off
echo ========================================
echo Setting up ngrok for E.ON Team Pause System
echo ========================================
echo.

:: Check if ngrok is already available
echo Checking if ngrok is already available...
ngrok --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ngrok is already installed and available in PATH
    echo.
    pause
    exit /b 0
)

:: Check if ngrok.exe already exists in current directory
if exist "ngrok.exe" (
    echo ✅ ngrok.exe already exists in current directory
    echo.
    pause
    exit /b 0
)

:: Check if ngrok zip file exists
if not exist "ngrok-v3-stable-windows-amd64.zip" (
    echo ❌ ngrok-v3-stable-windows-amd64.zip not found
    echo Please download ngrok from https://ngrok.com/download
    echo.
    pause
    exit /b 1
)

echo 📦 Found ngrok zip file, extracting...
echo.

:: Extract ngrok using PowerShell
powershell -command "Expand-Archive -Path 'ngrok-v3-stable-windows-amd64.zip' -DestinationPath '.' -Force"

if %errorlevel% neq 0 (
    echo ❌ Failed to extract ngrok
    echo Please extract the zip file manually
    echo.
    pause
    exit /b 1
)

:: Check if extraction was successful
if exist "ngrok.exe" (
    echo ✅ ngrok extracted successfully!
    echo.
    echo 🚀 ngrok is now ready to use
    echo 📱 You can now run start-server.bat
    echo.
) else (
    echo ❌ ngrok.exe not found after extraction
    echo Please check the zip file contents
    echo.
    pause
    exit /b 1
)

echo.
pause 