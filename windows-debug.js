// Simple debug script for Windows PostgreSQL connection
const { Pool } = require('pg');

// Your database connection string
const DATABASE_URL = 'postgresql://postgres:mypassword@localhost:9616/myapp';

console.log('Testing Windows PostgreSQL connection...');
console.log('Attempting to connect to:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('SUCCESS: Connected to PostgreSQL!');
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables found:', tablesResult.rows.map(r => r.table_name));
    
    // Check if users table exists and has data
    if (tablesResult.rows.some(r => r.table_name === 'users')) {
      const usersResult = await client.query('SELECT count(*) as count FROM users');
      console.log('Users in database:', usersResult.rows[0].count);
      
      // Check for admin user
      const adminResult = await client.query(
        "SELECT email, first_name, last_name, is_admin FROM users WHERE email = 'admin@example.com'"
      );
      
      if (adminResult.rows.length > 0) {
        console.log('Admin user found:', adminResult.rows[0]);
      } else {
        console.log('Admin user NOT found - need to create it');
      }
    } else {
      console.log('Users table does not exist - need to run database setup');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('CONNECTION ERROR:', error.message);
    console.error('Details:', error.code, error.errno);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nTroubleshooting:');
      console.log('1. Check if PostgreSQL is running on port 9616');
      console.log('2. Verify the password is correct');
      console.log('3. Check if the database "myapp" exists');
    }
  }
}

testConnection();