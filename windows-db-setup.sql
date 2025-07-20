-- Windows PostgreSQL Database Setup Script
-- Run this in pgAdmin 4 Query Tool connected to your 'myapp' database

-- 1. Clean up any existing data (optional)
DELETE FROM users WHERE email = 'admin@example.com';
DELETE FROM teams WHERE name = 'Default Team';

-- 2. Create admin user with password 'admin123'
INSERT INTO users (email, first_name, last_name, password, is_admin, team_id, is_break_limit_exceeded)
VALUES ('admin@example.com', 'Admin', 'User', '$2b$10$EIXj/T9VyIjBXjMZzOjnJ.hWfP8wjAJGcQWIGS2NfgYWIrJWcNOi2', true, null, false);

-- 3. Create default team
INSERT INTO teams (name, description, max_pause_limit)
VALUES ('Default Team', 'Default team for new users', 6);

-- 4. Verify everything was created correctly
SELECT 'VERIFICATION - Admin User:' as info, id, email, first_name, last_name, is_admin 
FROM users WHERE email = 'admin@example.com';

SELECT 'VERIFICATION - Default Team:' as info, id, name, description, max_pause_limit 
FROM teams WHERE name = 'Default Team';

SELECT 'VERIFICATION - Total Users:' as info, count(*) as count FROM users;
SELECT 'VERIFICATION - Total Teams:' as info, count(*) as count FROM teams;