const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Setting up admin user with correct schema...');
    
    // Hash the admin password
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    // Create admin user with correct column names
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, is_admin) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO UPDATE SET
        password = $2,
        first_name = $3,
        last_name = $4,
        is_admin = $5
    `, ['admin@example.com', adminPasswordHash, 'Admin', 'User', true]);

    // Create default team
    await pool.query(`
      INSERT INTO teams (name, description, max_pause_limit) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (name) DO UPDATE SET 
        description = $2,
        max_pause_limit = $3
    `, ['Default Team', 'Default team for new users', 6]);

    console.log('✅ Database setup complete!');
    console.log('🔑 Admin login: admin@example.com / admin123');
    
    // Verify setup
    const adminCheck = await pool.query('SELECT email, first_name, last_name, is_admin FROM users WHERE email = $1', ['admin@example.com']);
    const teamCheck = await pool.query('SELECT name, description, max_pause_limit FROM teams WHERE name = $1', ['Default Team']);
    
    console.log('👤 Admin user:', adminCheck.rows[0]);
    console.log('👥 Default team:', teamCheck.rows[0]);
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();