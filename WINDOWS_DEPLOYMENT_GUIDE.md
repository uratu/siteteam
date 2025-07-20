# Windows Deployment Guide - Team Pause Management System

## Current System Status ✅
- **Database**: PostgreSQL successfully configured
- **Admin User**: Created (admin@example.com / password: password)
- **Windows Compatibility**: Fixed server binding issues
- **Build**: Ready for deployment

## Quick Start for Windows

### 1. Set Up Database Connection
The application requires a PostgreSQL database. You have several options:

#### Option A: Local PostgreSQL (Recommended)
1. Download and install PostgreSQL from: https://www.postgresql.org/download/windows/
2. Create a database named `teampause`
3. Set your environment variable:
   ```
   set DATABASE_URL=postgresql://username:password@localhost:5432/teampause
   ```

#### Option B: Cloud Database (Neon - Free Tier)
1. Sign up at https://neon.tech/
2. Create a new database
3. Copy the connection string they provide

#### Option C: Railway (Easy Setup)
1. Sign up at https://railway.app/
2. Create a PostgreSQL database
3. Copy the provided connection string

### 2. Environment Setup
Create a `.env` file in your project root:
```
DATABASE_URL=postgresql://username:password@localhost:5432/teampause
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secure-secret-key-change-this
```

### 3. Install Dependencies and Build
```bash
npm install
npm run build
```

### 4. Run Database Migrations
```bash
npm run db:push
```

### 5. Start the Application
Choose one of these methods:

#### Method 1: Windows Batch File
```batch
start-windows.bat
```

#### Method 2: PowerShell Script (Recommended)
```powershell
powershell -ExecutionPolicy Bypass -File start-windows.ps1
```

#### Method 3: Manual Start
```bash
set NODE_ENV=production
set PORT=5000
node dist/index.js
```

## Initial Login Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `password`

**⚠️ Important**: Change the admin password immediately after first login!

## Accessing the Application

Once running, open your browser to:
- **Main Application**: http://localhost:5000
- **Admin Panel**: Login with admin credentials to access management features

## Windows-Specific Fixes Applied

1. **Socket Binding**: Changed from `0.0.0.0` to `localhost` for Windows compatibility
2. **WebSocket Configuration**: Added Windows-friendly settings
3. **Environment Variables**: Proper handling with cross-env package
4. **Startup Scripts**: Created batch, PowerShell, and Node.js startup options

## Features Available

### For Regular Users:
- Register new accounts
- Join teams
- Start/stop pause sessions (lunch breaks, screen breaks)
- View team member status
- Real-time updates via WebSocket

### For Administrators:
- Create and manage teams
- Add/remove users
- Set pause limits per team
- View system statistics
- Password reset functionality
- User team assignments

## Troubleshooting

### Common Issues:

1. **Port 5000 already in use**
   - Change PORT in .env file to another port (e.g., 3000, 8080)

2. **Database connection failed**
   - Verify DATABASE_URL format
   - Ensure PostgreSQL is running
   - Check firewall settings

3. **Permission denied**
   - Run command prompt as Administrator
   - Check file permissions

4. **Build errors**
   - Delete node_modules and run `npm install` again
   - Ensure Node.js version 18 or higher

### Windows-Specific Solutions:

If you encounter the original socket error:
```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000
```

This has been fixed by changing the server binding to localhost. The updated code now uses:
- `localhost` instead of `0.0.0.0` for better Windows compatibility
- Enhanced WebSocket configuration
- Proper environment variable handling

## Production Deployment

For production Windows Server deployment:

1. **Use a Process Manager**: Install PM2 for process management
2. **Set up SSL**: Configure reverse proxy with IIS or nginx
3. **Environment Variables**: Set system environment variables
4. **Automatic Startup**: Configure Windows service for auto-start
5. **Monitoring**: Set up logging and monitoring

## Support

If you encounter any issues:
1. Check the Windows setup documentation
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check Windows Firewall settings

The system is now fully compatible with Windows and ready for deployment!