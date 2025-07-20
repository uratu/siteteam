# PostgreSQL Connection Troubleshooting Guide

## Current Issue
Your application cannot connect to PostgreSQL on port 9616. The error shows:
```
Error: connect ECONNREFUSED ::1:9616
Error: connect ECONNREFUSED 127.0.0.1:9616
```

## Step 1: Check if PostgreSQL is Running

### Option A: Windows Services
1. Press `Windows + R`, type `services.msc`, press Enter
2. Look for "postgresql" service
3. Check if it's running (status should be "Running")
4. If stopped, right-click → Start

### Option B: Command Line Check
```cmd
# Check if PostgreSQL is listening on any port
netstat -an | findstr 5432
netstat -an | findstr 9616

# Check PostgreSQL service status
sc query postgresql*
```

## Step 2: Find the Correct Port

Your PostgreSQL might be running on the default port 5432 instead of 9616.

### Check in pgAdmin 4:
1. Open pgAdmin 4
2. Look at your server connection
3. Right-click your server → Properties
4. Check the "Connection" tab for the correct port number

### Check PostgreSQL Configuration:
1. Find your `postgresql.conf` file (usually in PostgreSQL installation directory)
2. Look for the line: `port = 5432` (or whatever port it's set to)

## Step 3: Test Connection

Try connecting with the standard PostgreSQL port first:

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/myapp
```

If that doesn't work, try these common PostgreSQL ports:
- 5432 (default)
- 5433 (alternative)
- 9616 (your current setting)

## Step 4: Update Your Environment

Once you find the correct port, update your PowerShell command:

```powershell
# Try the default PostgreSQL port first
$env:DATABASE_URL = "postgresql://postgres:mypassword@localhost:5432/myapp"
$env:NODE_ENV = "production"
$env:PORT = "5000"
node dist\index.js
```

## Step 5: Create Database if Needed

If the database "myapp" doesn't exist:

1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name it "myapp"
5. Click Save

## Quick Test Commands

Test each of these connection strings until one works:

```powershell
# Test 1: Default port
$env:DATABASE_URL = "postgresql://postgres:mypassword@localhost:5432/myapp"

# Test 2: Alternative port
$env:DATABASE_URL = "postgresql://postgres:mypassword@localhost:5433/myapp"

# Test 3: Your original port
$env:DATABASE_URL = "postgresql://postgres:mypassword@localhost:9616/myapp"

# Test 4: Different database name
$env:DATABASE_URL = "postgresql://postgres:mypassword@localhost:5432/postgres"
```

## Most Likely Solutions

1. **Wrong Port**: Change 9616 to 5432 (the PostgreSQL default)
2. **Wrong Database**: Use "postgres" instead of "myapp"
3. **Wrong Password**: Verify your postgres user password
4. **Service Not Running**: Start PostgreSQL service in Windows Services