const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Checking database schema...\n');
    
    // Check what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Existing tables:');
    tablesResult.rows.forEach(row => console.log('-', row.table_name));
    console.log('');
    
    // Check users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Users table columns:');
    usersColumns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    console.log('');
    
    // Check if any data exists
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users in database: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count > 0) {
      const existingUsers = await pool.query('SELECT * FROM users LIMIT 5');
      console.log('Existing users:');
      existingUsers.rows.forEach(user => {
        console.log(`- ${user.email || user.name || 'unnamed'} (ID: ${user.id})`);
      });
    }
    
  } catch (error) {
    console.error('Schema check error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();