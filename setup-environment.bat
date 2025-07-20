@echo off
echo Setting up environment variables for E.ON Team Pause Management System...
echo.

:: Set environment variables permanently
setx DATABASE_URL "postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"
setx PORT "5000"
setx NODE_ENV "development"
setx JWT_SECRET "your-super-secret-jwt-key-change-this-in-production"

echo.
echo ✅ Environment variables have been set permanently:
echo    DATABASE_URL = postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp
echo    PORT = 5000
echo    NODE_ENV = development
echo    JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
echo.
echo Note: You may need to restart your command prompt or computer for changes to take effect.
echo.
pause 