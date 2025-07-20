# Quick Fix Guide - PostgreSQL Connection

## Immediate Steps to Try

### Step 1: Find PostgreSQL Port
Run this command to scan for PostgreSQL:
```powershell
node find-postgres-port.js
```

### Step 2: Check pgAdmin Connection Details
1. Open pgAdmin 4
2. Right-click on your PostgreSQL server (in the left panel)
3. Select "Properties"
4. Go to "Connection" tab
5. Note the exact Host and Port values

### Step 3: Common Solutions

**Try Default Port (Most Common)**
```powershell
$env:DATABASE_URL = "postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp"
node dist\index.js
```

**Try with Default Database**
```powershell
$env:DATABASE_URL = "postgresql://postgres:Noastadaparolafrate1@localhost:5432/postgres"
node dist\index.js
```

**Try Different Host**
```powershell
$env:DATABASE_URL = "postgresql://postgres:Noastadaparolafrate1@127.0.0.1:5432/myapp"
node dist\index.js
```

### Step 4: PostgreSQL Service Check
1. Press `Windows + R`
2. Type `services.msc`
3. Look for "postgresql" service
4. Make sure it's running (Status = "Running")
5. If stopped, right-click → Start

### Step 5: Network Check
```powershell
# Check what's listening on PostgreSQL ports
netstat -an | findstr 5432
netstat -an | findstr 9616
```

## Most Likely Issues

1. **Wrong Port**: PostgreSQL usually runs on 5432, not 9616
2. **Wrong Database**: Database might be named "postgres" not "myapp"
3. **Service Not Running**: PostgreSQL Windows service might be stopped
4. **Firewall**: Windows Firewall might be blocking the connection

## If Nothing Works

Create the "myapp" database:
1. Open pgAdmin 4
2. Right-click "Databases"
3. Create → Database
4. Name: "myapp"
5. Save