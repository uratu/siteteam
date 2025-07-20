# E.ON Team Pause Management System - PowerShell Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E.ON Team Pause Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Set environment variables (using the working method)
Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"
$env:PORT = "5000"
$env:NODE_ENV = "development"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
Write-Host "✅ Environment variables set" -ForegroundColor Green

# Check if dist folder exists and build if needed
Write-Host ""
Write-Host "Checking application build..." -ForegroundColor Yellow
if (-not (Test-Path "dist\index.js")) {
    Write-Host "Building application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Application built successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "✅ Application already built" -ForegroundColor Green
}

# Display startup information
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting E.ON Team Pause Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment: $env:NODE_ENV" -ForegroundColor White
Write-Host "Port: $env:PORT" -ForegroundColor White
Write-Host "Database: $env:DATABASE_URL" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Application will be available at: http://localhost:$env:PORT" -ForegroundColor Green
Write-Host "👤 Admin login: admin@example.com / admin123" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Start the application using the working method
try {
    npm start
} catch {
    Write-Host ""
    Write-Host "Server stopped with error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Server stopped. Press Enter to exit..." -ForegroundColor Yellow
Read-Host 