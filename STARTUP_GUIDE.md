# E.ON Team Pause Management System - Startup Guide

## Quick Start (Recommended)

### Option 1: Simple Startup Scripts
1. **Double-click** `start-simple.bat` or `start-simple.ps1`
2. These scripts use the exact working method: set environment variable and run `npm start`

### Option 2: Manual Terminal Commands
```powershell
$env:DATABASE_URL="postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"
npm start
```

### Option 3: Full Automated Startup
1. **Double-click** `start-server.bat` or `start-server.ps1`
2. These scripts include additional checks and build steps

## Prerequisites

### 1. Node.js
- Download and install from: https://nodejs.org/
- Version 18 or higher recommended

### 2. PostgreSQL
- Download and install from: https://www.postgresql.org/download/windows/
- Default settings are fine
- **Important**: Remember the password you set during installation

### 3. Database Setup
The application uses these default settings:
- **Host**: localhost
- **Port**: 5432
- **Database**: myapp
- **Username**: postgres
- **Password**: Noastadaparolafrate1

## Working Method (Confirmed)

The application works reliably with this exact sequence:

```powershell
# Set the environment variable
$env:DATABASE_URL="postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"

# Start the server
npm start
```

## File Descriptions

| File | Purpose |
|------|---------|
| `start-simple.bat` | **Recommended** - Simple batch file using working method |
| `start-simple.ps1` | **Recommended** - Simple PowerShell script using working method |
| `start-server.bat` | Full automated startup with checks |
| `start-server.ps1` | Full automated PowerShell startup with checks |
| `setup-environment.bat` | Sets environment variables permanently |

## Troubleshooting

### Database Connection Issues

**Error**: "Cannot connect to PostgreSQL"

**Solutions**:
1. **Start PostgreSQL Service**:
   - Press `Win + R`, type `services.msc`
   - Find "postgresql-x64-15" (or similar)
   - Right-click → Start

2. **Check if database exists**:
   - Open pgAdmin or psql
   - Create database: `CREATE DATABASE myapp;`

3. **Verify credentials**:
   - Default: postgres/Noastadaparolafrate1
   - If different, update the connection string in the startup scripts

### Port Issues

**Error**: "Port 5000 is already in use"

**Solutions**:
1. **Find what's using the port**:
   ```
   netstat -ano | findstr :5000
   ```
2. **Kill the process** or change the port in the startup script

### Build Issues

**Error**: "Build failed"

**Solutions**:
1. **Clear node_modules and reinstall**:
   ```
   rmdir /s node_modules
   del package-lock.json
   npm install
   ```

2. **Check TypeScript errors**:
   ```
   npx tsc --noEmit
   ```

## Environment Variables

The application uses these environment variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `DATABASE_URL` | `postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp` | Database connection string |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | JWT signing key |

## Accessing the Application

Once the server is running:
- **URL**: http://localhost:5000
- **Admin Login**: admin@example.com / admin123

## Support

If you encounter issues:
1. Use the simple startup scripts (`start-simple.bat` or `start-simple.ps1`)
2. Check the console output for error messages
3. Verify PostgreSQL is running
4. Ensure the database exists and is accessible

## Development vs Production

- **Development**: Uses `NODE_ENV=development` (default)
- **Production**: Set `NODE_ENV=production` for optimized builds

For production deployment, remember to:
- Change the JWT_SECRET
- Use a proper database (not localhost)
- Set up proper SSL certificates
- Configure environment-specific settings 