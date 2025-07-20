# Team Pause Management System - Windows PowerShell Startup Script
# Run this script as Administrator for best results

Write-Host "Team Pause Management System - Windows Startup Script" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dist folder exists
if (!(Test-Path "dist\index.js")) {
    Write-Host "Building application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Build completed successfully" -ForegroundColor Green
}

# Set environment variables
$env:NODE_ENV = "production"
$env:PORT = "5000"

# Check if DATABASE_URL is set or use the one already provided
if (-not $env:DATABASE_URL) {
    Write-Host "Warning: DATABASE_URL not set" -ForegroundColor Yellow
    Write-Host "Please set DATABASE_URL environment variable or create a .env file" -ForegroundColor Yellow
    Write-Host "Example: `$env:DATABASE_URL='postgresql://user:pass@localhost:5432/dbname'" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if .env file exists
    if (Test-Path ".env") {
        Write-Host "Found .env file, attempting to load..." -ForegroundColor Cyan
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^=]+)=(.+)$") {
                $key = $matches[1]
                $value = $matches[2]
                [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "Set $key" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "No .env file found. Copy .env.example to .env and configure your database." -ForegroundColor Yellow
    }
} else {
    Write-Host "Using existing DATABASE_URL: $($env:DATABASE_URL -replace 'postgresql://[^@]+@', 'postgresql://***@')" -ForegroundColor Green
}

# Display startup information
Write-Host ""
Write-Host "Starting Team Pause Management System..." -ForegroundColor Green
Write-Host "Environment: $($env:NODE_ENV)" -ForegroundColor Cyan
Write-Host "Port: $($env:PORT)" -ForegroundColor Cyan
Write-Host "Database: $($env:DATABASE_URL -replace 'postgresql://[^@]+@', 'postgresql://***@')" -ForegroundColor Cyan
Write-Host ""

# Start the application
try {
    node dist\index.js
} catch {
    Write-Host "Error starting application: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to exit"