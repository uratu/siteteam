// Debug script to test login functionality
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:mypassword@localhost:9616/myapp';

console.log('Testing login functionality...');
console.log('Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testLogin() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Check if users table exists and has data
    const usersCheck = await client.query('SELECT count(*) as count FROM users');
    console.log('✅ Users in database:', usersCheck.rows[0].count);
    
    // Get the admin user
    const adminUser = await client.query(
      'SELECT id, email, first_name, last_name, password, is_admin FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (adminUser.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      // Create admin user with password 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, first_name, last_name, password, is_admin, team_id, is_break_limit_exceeded) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['admin@example.com', 'Admin', 'User', hashedPassword, true, null, false]
      );
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user found:', {
        id: adminUser.rows[0].id,
        email: adminUser.rows[0].email,
        name: `${adminUser.rows[0].first_name} ${adminUser.rows[0].last_name}`,
        isAdmin: adminUser.rows[0].is_admin
      });
      
      // Test password verification
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.rows[0].password);
      console.log(`✅ Password test for 'admin123':`, isValid ? 'VALID' : 'INVALID');
      
      if (!isValid) {
        console.log('❌ Password invalid, updating password...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await client.query(
          'UPDATE users SET password = $1 WHERE email = $2',
          [newHashedPassword, 'admin@example.com']
        );
        console.log('✅ Password updated successfully!');
      }
    }
    
    client.release();
    console.log('\n🎉 Login setup complete! Try logging in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLogin();