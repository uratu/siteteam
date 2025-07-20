const { Pool } = require('pg');

// Test different connection configurations
const configs = [
  {
    name: 'Standard connection',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'myapp',
      password: 'Noastadaparolafrate1',
      port: 5432,
    }
  },
  {
    name: 'With SSL disabled',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'myapp',
      password: 'Noastadaparolafrate1',
      port: 5432,
      ssl: false
    }
  },
  {
    name: 'With connection string',
    connectionString: 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp?sslmode=disable'
  }
];

async function testConnections() {
  console.log('Testing PostgreSQL connections...\n');
  
  for (const test of configs) {
    console.log(`Testing: ${test.name}`);
    
    let pool;
    try {
      if (test.connectionString) {
        pool = new Pool({ connectionString: test.connectionString });
      } else {
        pool = new Pool(test.config);
      }
      
      const client = await pool.connect();
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const result = await client.query('SELECT current_database(), version()');
      console.log('Database:', result.rows[0].current_database);
      console.log('Version:', result.rows[0].version.split(' ')[0], '\n');
      
      client.release();
      await pool.end();
      
      // If we get here, this connection works
      console.log('🎉 Use this connection string:');
      if (test.connectionString) {
        console.log(test.connectionString);
      } else {
        console.log(`postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp?sslmode=disable`);
      }
      return;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      if (pool) await pool.end();
    }
    console.log('---\n');
  }
  
  console.log('All connection attempts failed. Check:');
  console.log('1. PostgreSQL service is running');
  console.log('2. Username and password are correct');
  console.log('3. Database "myapp" exists');
  console.log('4. pg_hba.conf allows local connections');
}

testConnections();