# Team Pause Management System - Deployment Guide

## Latest Updates (January 19, 2025)
✓ Fixed cross-device timer synchronization issues for hosted applications
✓ Timer now consistently starts at 00:00 regardless of which computer accesses the system
✓ Added cache-busting headers to prevent stale file loading across network devices
✓ Made pause/end break button more visible with red styling
✓ Enhanced timer logic for perfect timing consistency

## Deployment Files

### Production Build
- `dist/index.js` - Compiled server application
- `dist/public/` - Static frontend files (HTML, CSS, JS)
- `dist/public/index.html` - Main application page
- `dist/public/assets/` - Compiled CSS and JavaScript assets

### Required Files for Deployment
1. `dist/` - Complete production build
2. `package.json` - Dependencies list
3. `.env` - Environment configuration (you'll need to set this up)

### Environment Setup
Create a `.env` file with your database connection:
```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=production
```

### Installation Instructions
1. Copy the entire `dist/` folder to your deployment server
2. Copy `package.json` to the same directory
3. Copy the Windows startup scripts: `start-production.bat`, `start-production.ps1`, `start-windows.js`
4. Run `npm install` to install dependencies
5. Set up your PostgreSQL database
6. Create the `.env` file with your database credentials

### Windows Startup Options
Choose one of these methods to start the application:

**Option 1: Using Batch File**
```
start-production.bat
```

**Option 2: Using PowerShell**
```
.\start-production.ps1
```

**Option 3: Using Node.js Script**
```
node start-windows.js
```

**Option 4: Manual Command (in CMD)**
```
set NODE_ENV=production
node dist/index.js
```

**Option 5: Manual Command (in PowerShell)**
```
$env:NODE_ENV = "production"
node dist/index.js
```

### Key Features
- Real-time pause tracking with consistent timer across all devices
- Multi-team support with dynamic user management
- Secure authentication with admin and team role assignments
- WebSocket-enabled real-time updates
- PostgreSQL database with Drizzle ORM
- Cross-device compatibility for hosted applications

### Timer Fixes Applied
The timer now uses client-side timing only, ensuring:
- Consistent 00:00 start time regardless of device or network
- No timing drift between different computers
- Proper synchronization across your network
- Cache-busting to prevent old file loading

### Default Admin Account
- Email: admin@example.com
- Password: admin123
- Make sure to change this password after deployment!

### Support
This system has been tested and optimized for:
- Windows PostgreSQL environments
- Cross-device network access
- Multiple browser types
- Different timezone configurations