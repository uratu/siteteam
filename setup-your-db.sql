-- Database setup for your PostgreSQL on port 9616
-- Connect to your 'myapp' database in pgAdmin 4 and run these commands:

-- First, let's check if we can connect to your database
SELECT current_database(), current_user, inet_server_addr(), inet_server_port();

-- Create the initial admin user (password: 'password')
INSERT INTO users (email, first_name, last_name, password, is_admin, team_id, is_break_limit_exceeded)
VALUES ('admin@example.com', 'Admin', 'User', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, null, false)
ON CONFLICT (email) DO NOTHING;

-- Create a default team
INSERT INTO teams (name, description, max_pause_limit)
VALUES ('Default Team', 'Default team for new users', 6)
ON CONFLICT (name) DO NOTHING;

-- Verify the setup worked
SELECT 'Users created:' as info, count(*) as count FROM users;
SELECT 'Teams created:' as info, count(*) as count FROM teams;
SELECT 'Admin user:' as info, email, first_name, last_name, is_admin FROM users WHERE email = 'admin@example.com';