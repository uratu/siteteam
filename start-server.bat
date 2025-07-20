@echo off
echo ========================================
echo E.ON Team Pause Management System
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

:: Set environment variables (using the working method)
echo.
echo Setting environment variables...
set DATABASE_URL=postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp
set PORT=5000
set NODE_ENV=development
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo ✅ Environment variables set

:: Check and start ngrok with your domain
echo.
echo Checking ngrok availability...
ngrok --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ ngrok not found in PATH, checking for local installation...
    
    :: Check if ngrok executable exists in current directory
    if exist "ngrok.exe" (
        echo ✅ Found ngrok.exe in current directory
        echo Starting ngrok with your domain...
        start "" ngrok.exe http --url=many-quail-nationally.ngrok-free.app 5000
        echo ✅ ngrok started with domain: many-quail-nationally.ngrok-free.app
    ) else (
        echo ❌ ngrok not available - cannot start with custom domain
        echo Please run setup-ngrok.bat first or install ngrok manually
        echo.
        pause
        exit /b 1
    )
) else (
    echo ✅ ngrok found in PATH
    echo Starting ngrok with your domain...
    start "" ngrok http --url=many-quail-nationally.ngrok-free.app 5000
    echo ✅ ngrok started with domain: many-quail-nationally.ngrok-free.app
)

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
echo 🌐 Public URL: https://many-quail-nationally.ngrok-free.app
echo.
echo Press Ctrl+C to stop the server
echo.
npm start

echo.
echo Server stopped.
pause 