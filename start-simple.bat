@echo off
echo ========================================
echo E.ON Team Pause Management System - SIMPLE
echo ========================================
echo.

:: Set environment variable and start server (exact working method)
set DATABASE_URL=postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp

echo 🚀 Starting server...
echo 📱 Access the application at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

echo.
echo Server stopped.
pause 