// Test database connection for Windows PostgreSQL
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:mypassword@localhost:9616/myapp';

console.log('Testing database connection...');
console.log('Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query test successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version);
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name));
    
    // Check users
    const users = await client.query('SELECT count(*) as count FROM users');
    console.log('✅ Users in database:', users.rows[0].count);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();