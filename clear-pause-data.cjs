const { Pool } = require('pg');

async function clearPauseData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Clearing old pause data...');
    
    // Get admin user ID
    const adminUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    if (adminUser.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const userId = adminUser.rows[0].id;
    
    // Clear pause sessions
    const deletedSessions = await pool.query('DELETE FROM pause_sessions WHERE user_id = $1', [userId]);
    console.log(`✅ Deleted ${deletedSessions.rowCount} pause sessions`);
    
    // Clear daily tracking
    const deletedTracking = await pool.query('DELETE FROM daily_pause_tracking WHERE user_id = $1', [userId]);
    console.log(`✅ Deleted ${deletedTracking.rowCount} daily tracking records`);
    
    console.log('\n🎉 All pause data cleared! Timer should now start at 0:00 for new sessions.');
    
  } catch (error) {
    console.error('❌ Clear error:', error.message);
  } finally {
    await pool.end();
  }
}

clearPauseData();