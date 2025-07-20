@echo off
echo ========================================
echo E.ON Team Pause Management System - PRODUCTION
echo ========================================
echo.

:: Set environment variables
set NODE_ENV=production
set PORT=5000

echo 🚀 Starting production server...
echo 📱 Access the application at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

node dist/index.js

echo.
echo Server stopped.
pause