const { Pool } = require('pg');

// Common PostgreSQL ports to test
const commonPorts = [5432, 5433, 9616, 3306, 1433];
const password = 'Noastadaparolafrate1';

async function findWorkingPort() {
  console.log('Searching for PostgreSQL on common ports...\n');
  
  for (const port of commonPorts) {
    console.log(`Testing port ${port}...`);
    
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres', // Try default database first
      password: password,
      port: port,
      ssl: false,
      connectionTimeoutMillis: 3000 // 3 second timeout
    });
    
    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESS! PostgreSQL found on port ${port}`);
      
      // Check available databases
      const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
      console.log('Available databases:', dbResult.rows.map(r => r.datname));
      
      client.release();
      await pool.end();
      
      console.log(`\n🎉 Use this connection string:`);
      console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:${port}/myapp`);
      console.log(`\nOr if 'myapp' database doesn't exist, use:`);
      console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:${port}/postgres`);
      
      return port;
      
    } catch (error) {
      console.log(`❌ Port ${port}: ${error.message}`);
      await pool.end();
    }
  }
  
  console.log('\n❌ No PostgreSQL found on common ports.');
  console.log('\nTroubleshooting steps:');
  console.log('1. Check if PostgreSQL service is running in Windows Services');
  console.log('2. In pgAdmin, right-click your server → Properties → Connection tab');
  console.log('3. Note the Host and Port shown there');
  console.log('4. Make sure the password is correct');
  
  return null;
}

findWorkingPort();