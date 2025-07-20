
const { Pool } = require('pg');

async function debugUserData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Noastadaparolafrate1@localhost:5432/myapp',
    ssl: false
  });

  try {
    console.log('🔍 Analyzing user data patterns...\n');
    
    // Get all users with their teams
    const users = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.team_id, t.name as team_name
      FROM users u 
      LEFT JOIN teams t ON u.team_id = t.id 
      ORDER BY u.id
    `);
    
    console.log(`Found ${users.rows.length} users:\n`);
    
    for (const user of users.rows) {
      console.log(`👤 User: ${user.email} (ID: ${user.id})`);
      console.log(`   Team: ${user.team_name || 'No team'}`);
      
      // Check active pause sessions
      const activeSessions = await pool.query(`
        SELECT id, pause_type, start_time, is_active
        FROM pause_sessions 
        WHERE user_id = $1 AND is_active = true
        ORDER BY start_time DESC
      `, [user.id]);
      
      // Check all recent sessions (today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const recentSessions = await pool.query(`
        SELECT id, pause_type, start_time, end_time, is_active
        FROM pause_sessions 
        WHERE user_id = $1 AND start_time >= $2
        ORDER BY start_time DESC
        LIMIT 5
      `, [user.id, today]);
      
      // Check daily tracking
      const todayStr = new Date().toISOString().split('T')[0];
      const tracking = await pool.query(`
        SELECT lunch_seconds_used, screen_seconds_used
        FROM daily_pause_tracking 
        WHERE user_id = $1 AND date = $2
      `, [user.id, todayStr]);
      
      console.log(`   Active sessions: ${activeSessions.rows.length}`);
      if (activeSessions.rows.length > 0) {
        activeSessions.rows.forEach(session => {
          console.log(`     - ${session.pause_type} started at ${session.start_time}`);
        });
      }
      
      console.log(`   Recent sessions today: ${recentSessions.rows.length}`);
      if (recentSessions.rows.length > 0) {
        recentSessions.rows.forEach((session, idx) => {
          const status = session.is_active ? 'ACTIVE' : 'ENDED';
          console.log(`     ${idx + 1}. ${session.pause_type} - ${status} - Started: ${session.start_time}`);
        });
      }
      
      console.log(`   Daily tracking: ${tracking.rows.length > 0 ? 
        `Lunch: ${tracking.rows[0].lunch_seconds_used}s, Screen: ${tracking.rows[0].screen_seconds_used}s` : 
        'None'}`);
      
      console.log(''); // Empty line between users
    }
    
    // Look for data anomalies
    console.log('\n🚨 Checking for data anomalies...');
    
    // Multiple active sessions for same user
    const multipleActive = await pool.query(`
      SELECT user_id, COUNT(*) as active_count
      FROM pause_sessions 
      WHERE is_active = true 
      GROUP BY user_id 
      HAVING COUNT(*) > 1
    `);
    
    if (multipleActive.rows.length > 0) {
      console.log('❌ Users with multiple active sessions:');
      multipleActive.rows.forEach(row => {
        console.log(`   User ID ${row.user_id}: ${row.active_count} active sessions`);
      });
    } else {
      console.log('✅ No users with multiple active sessions');
    }
    
    // Very old active sessions
    const oldActive = await pool.query(`
      SELECT user_id, id, start_time, pause_type
      FROM pause_sessions 
      WHERE is_active = true 
      AND start_time < NOW() - INTERVAL '2 hours'
    `);
    
    if (oldActive.rows.length > 0) {
      console.log('❌ Very old active sessions (>2 hours):');
      oldActive.rows.forEach(row => {
        console.log(`   User ID ${row.user_id}: ${row.pause_type} session from ${row.start_time}`);
      });
    } else {
      console.log('✅ No old hanging active sessions');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await pool.end();
  }
}

debugUserData();
