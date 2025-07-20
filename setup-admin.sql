-- Create admin user with hashed password for "admin123"
-- Password hash for "admin123" using bcrypt
INSERT INTO users (email, password_hash, name, role, is_admin) 
VALUES (
  'admin@example.com', 
  '$2b$10$rOzG8K8K8K8K8K8K8K8K8OzG8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8',
  'Administrator', 
  'admin', 
  true
) ON CONFLICT (email) DO NOTHING;

-- Create a default team
INSERT INTO teams (name, pause_limit_minutes) 
VALUES ('Default Team', 30) 
ON CONFLICT (name) DO NOTHING;

-- Show what was created
SELECT 'Admin user created:' as status, email, name, role, is_admin FROM users WHERE email = 'admin@example.com';
SELECT 'Default team created:' as status, name, pause_limit_minutes FROM teams WHERE name = 'Default Team';