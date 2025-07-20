# Windows Setup Guide

This guide will help you run the Team Pause Management System on Windows.

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Database** - You'll need a PostgreSQL database

## Database Setup Options

### Option 1: Local PostgreSQL (Recommended)
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Create a database named `teampause`
3. Set your DATABASE_URL environment variable:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/teampause
   ```

### Option 2: Cloud Database (Neon, Railway, etc.)
1. Create a database on [Neon](https://neon.tech/) or [Railway](https://railway.app/)
2. Copy the connection string they provide
3. Set your DATABASE_URL environment variable

## Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo>
   cd myapp
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/teampause
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

5. **Start the Application**
   ```bash
   npm run start
   ```

## Troubleshooting

### Socket Binding Error (ENOTSUP)
If you get a socket binding error, try:
1. Run as administrator
2. Check if port 5000 is available
3. Use the Windows-specific startup script: `node start-windows.js`

### Database Connection Issues
1. Verify your DATABASE_URL is correctly formatted
2. Ensure PostgreSQL is running
3. Check firewall settings
4. Test the connection string in a database client

## Alternative Startup Methods

### Method 1: Using the Windows Startup Script
```bash
node start-windows.js
```

### Method 2: Manual Environment Variables
```bash
set NODE_ENV=production
set PORT=5000
set DATABASE_URL=postgresql://username:password@localhost:5432/teampause
node dist/index.js
```

### Method 3: PowerShell
```powershell
$env:NODE_ENV="production"
$env:PORT="5000"
$env:DATABASE_URL="postgresql://username:password@localhost:5432/teampause"
node dist/index.js
```

## Access the Application

Once running, open your browser to:
- **Application**: http://localhost:5000
- **WebSocket**: ws://localhost:5000/ws

## Common Issues

1. **Port already in use**: Change the PORT environment variable
2. **Database connection failed**: Verify DATABASE_URL and database server status
3. **Permission errors**: Run command prompt as administrator
4. **Build errors**: Ensure all dependencies are installed with `npm install`

## Production Deployment

For production deployment on Windows Server:
1. Use a process manager like PM2
2. Set up proper logging
3. Configure automatic startup
4. Use a reverse proxy (IIS, nginx)
5. Set up SSL certificates