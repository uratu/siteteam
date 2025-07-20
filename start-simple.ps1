# Simple startup script using the working method
Write-Host "Starting E.ON Team Pause Management System..." -ForegroundColor Green
Write-Host ""

# Set environment variable and start server (exact working method)
$env:DATABASE_URL = "postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"
npm start

Read-Host "Press Enter to exit"