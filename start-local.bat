@echo off
echo ========================================
echo E.ON Team Pause Management System - LOCAL ONLY
echo ========================================
echo.

:: Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

:: Set environment variables
echo.
echo Setting environment variables...
set DATABASE_URL=postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp
set PORT=5000
set NODE_ENV=development
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo ✅ Environment variables set

:: Install dependencies if not already installed
echo.
echo Installing dependencies (if needed)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error: npm install failed
    echo Please check your network connection or npm setup.
    echo.
    pause
    exit /b 1
)
echo ✅ Dependencies checked/installed

:: Build the client application
echo.
echo Building client application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Client build failed
    echo Please check the client/src directory for errors.
    echo.
    pause
    exit /b 1
)
echo ✅ Client build complete

:: Start the server
echo.
echo Starting the server...
echo.
echo 🚀 Server is now running!
echo 📱 Access the application at: http://localhost:5000
echo ℹ️ Local access only - no public URL
echo.
echo Press Ctrl+C to stop the server
echo.
npm start

echo.
echo Server stopped.
pause 