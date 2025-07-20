-- Add preferred_pause_times column to users table
ALTER TABLE users ADD COLUMN preferred_pause_times JSONB DEFAULT '[]'::jsonb; 