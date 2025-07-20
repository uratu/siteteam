# Windows Startup Guide - Team Pause Management System

## Quick Fix for Your Current Issue

You're getting the error because Windows doesn't recognize the `NODE_ENV=production` syntax. Here are your options:

### Option 1: Use the Batch File (Easiest)
Just double-click on `start-production.bat` or run in Command Prompt:
```
start-production.bat
```

### Option 2: Use PowerShell Script
In PowerShell, run:
```
.\start-production.ps1
```

### Option 3: Use Node.js Startup Script
```
node start-windows.js
```

### Option 4: Manual Commands

**In Command Prompt (CMD):**
```
set NODE_ENV=production
node dist/index.js
```

**In PowerShell:**
```
$env:NODE_ENV = "production"
node dist/index.js
```

## What Files You Need

Make sure you have these files in your project folder:
- `dist/` folder (with index.js and public folder)
- `package.json`
- `start-production.bat`
- `start-production.ps1` 
- `start-windows.js`
- `.env` file with your database settings

## Database Setup

Create a `.env` file with:
```
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
NODE_ENV=production
```

Replace with your actual PostgreSQL credentials.

## Troubleshooting

If you get module errors, run:
```
npm install
```

Then use any of the startup methods above.

## Default Admin Login
- Email: admin@example.com
- Password: admin123

The application will be available at: http://localhost:3000