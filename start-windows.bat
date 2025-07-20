@echo off
echo Team Pause Management System - Windows Startup Script
echo =====================================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dist folder exists
if not exist "dist\index.js" (
    echo Building application...
    call npm run build
    if %errorlevel% neq 0 (
        echo Error: Build failed
        pause
        exit /b 1
    )
)

:: Set environment variables
set NODE_ENV=production
set PORT=5000

:: Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo Warning: DATABASE_URL not set
    echo Please set DATABASE_URL environment variable or create a .env file
    echo Example: set DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
    echo.
    echo Continuing with default settings...
)

:: Display startup information
echo Starting Team Pause Management System...
echo Environment: %NODE_ENV%
echo Port: %PORT%
echo.

echo 🚀 Server is now running!
echo 📱 Access the application at: http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the application
node dist\index.js

echo.
echo Server stopped.
pause