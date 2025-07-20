const { Pool } = require('pg');

async function assignAdminToTeam() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Assigning admin user to default team...');
    
    // Get the default team ID
    const teamResult = await pool.query('SELECT id FROM teams WHERE name = $1', ['Default Team']);
    
    if (teamResult.rows.length === 0) {
      console.log('❌ Default team not found. Creating it...');
      await pool.query(`
        INSERT INTO teams (name, description, max_pause_limit) 
        VALUES ($1, $2, $3)
      `, ['Default Team', 'Default team for new users', 6]);
      
      const newTeamResult = await pool.query('SELECT id FROM teams WHERE name = $1', ['Default Team']);
      teamId = newTeamResult.rows[0].id;
    } else {
      teamId = teamResult.rows[0].id;
    }
    
    // Assign admin user to the team
    await pool.query(`
      UPDATE users 
      SET team_id = $1 
      WHERE email = $2
    `, [teamId, 'admin@example.com']);

    console.log('✅ Admin user assigned to Default Team!');
    
    // Verify the assignment
    const verification = await pool.query(`
      SELECT u.email, u.first_name, u.last_name, t.name as team_name 
      FROM users u 
      LEFT JOIN teams t ON u.team_id = t.id 
      WHERE u.email = $1
    `, ['admin@example.com']);
    
    console.log('👤 Admin user details:', verification.rows[0]);
    
  } catch (error) {
    console.error('❌ Assignment error:', error.message);
  } finally {
    await pool.end();
  }
}

assignAdminToTeam();