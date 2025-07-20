const { Pool } = require('pg');

async function checkPauseData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('Checking pause session data...\n');
    
    // Get admin user ID
    const adminUser = await pool.query('SELECT id, email FROM users WHERE email = $1', ['admin@example.com']);
    if (adminUser.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const userId = adminUser.rows[0].id;
    console.log(`👤 Admin user ID: ${userId}\n`);
    
    // Check pause sessions
    const pauseSessions = await pool.query('SELECT * FROM pause_sessions WHERE user_id = $1 ORDER BY start_time DESC', [userId]);
    console.log(`📋 Pause sessions for admin (${pauseSessions.rows.length} total):`);
    pauseSessions.rows.forEach(session => {
      console.log(`- ID: ${session.id}, Type: ${session.pause_type}, Active: ${session.is_active}, Start: ${session.start_time}, End: ${session.end_time}`);
    });
    
    // Check daily tracking
    const today = new Date().toISOString().split('T')[0];
    const dailyTracking = await pool.query('SELECT * FROM daily_pause_tracking WHERE user_id = $1 ORDER BY date DESC', [userId]);
    console.log(`\n📊 Daily tracking for admin (${dailyTracking.rows.length} total):`);
    dailyTracking.rows.forEach(tracking => {
      console.log(`- Date: ${tracking.date}, Lunch: ${tracking.lunch_seconds_used}s, Screen: ${tracking.screen_seconds_used}s`);
    });
    
    // Check today's specific data
    const todayTracking = await pool.query('SELECT * FROM daily_pause_tracking WHERE user_id = $1 AND date = $2', [userId, today]);
    console.log(`\n📅 Today's tracking (${today}):`);
    if (todayTracking.rows.length > 0) {
      const tracking = todayTracking.rows[0];
      console.log(`- Lunch seconds used: ${tracking.lunch_seconds_used} (${Math.floor(tracking.lunch_seconds_used / 60)}:${(tracking.lunch_seconds_used % 60).toString().padStart(2, '0')})`);
      console.log(`- Screen seconds used: ${tracking.screen_seconds_used} (${Math.floor(tracking.screen_seconds_used / 60)}:${(tracking.screen_seconds_used % 60).toString().padStart(2, '0')})`);
    } else {
      console.log('- No tracking data for today');
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPauseData();