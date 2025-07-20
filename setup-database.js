const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Setting up database...');
    
    // Create tables (should already exist from schema push)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_admin BOOLEAN DEFAULT false,
        team_id INTEGER,
        break_limit_flag BOOLEAN DEFAULT false
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        pause_limit_minutes INTEGER DEFAULT 30
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pause_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        duration_minutes INTEGER,
        pause_type VARCHAR(50) DEFAULT 'break'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_pause_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date DATE DEFAULT CURRENT_DATE,
        total_pause_minutes INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
      );
    `);

    // Hash the admin password
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    await pool.query(`
      INSERT INTO users (email, password_hash, name, role, is_admin) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        name = $3,
        role = $4,
        is_admin = $5
    `, ['admin@example.com', adminPasswordHash, 'Administrator', 'admin', true]);

    // Create default team
    await pool.query(`
      INSERT INTO teams (name, pause_limit_minutes) 
      VALUES ($1, $2) 
      ON CONFLICT (name) DO UPDATE SET pause_limit_minutes = $2
    `, ['Default Team', 30]);

    console.log('✅ Database setup complete!');
    console.log('Admin login: admin@example.com / admin123');
    
    // Verify setup
    const adminCheck = await pool.query('SELECT email, name, role, is_admin FROM users WHERE email = $1', ['admin@example.com']);
    const teamCheck = await pool.query('SELECT name, pause_limit_minutes FROM teams WHERE name = $1', ['Default Team']);
    
    console.log('Admin user:', adminCheck.rows[0]);
    console.log('Default team:', teamCheck.rows[0]);
    
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();