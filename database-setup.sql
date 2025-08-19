-- UnblockEd Portal Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the required tables

-- Create license_keys table for managing access keys
CREATE TABLE IF NOT EXISTS license_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_license_keys_key ON license_keys(key);
CREATE INDEX IF NOT EXISTS idx_license_keys_active ON license_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_license_keys_expires_at ON license_keys(expires_at);

-- Insert some sample license keys for demo/testing
INSERT INTO license_keys (key, description, is_active) VALUES 
    ('DEMO-2024-FULL-ACCESS', 'Demo license key for testing', true),
    ('SCHOOL-ADMIN-2024', 'Administrator access key', true),
    ('STUDENT-TEMP-KEY', 'Temporary student access', true),
    ('TEACHER-PREMIUM-2024', 'Premium teacher access', true)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production security needs)
CREATE POLICY "Allow all operations on license_keys" 
ON license_keys 
FOR ALL 
USING (true);

-- Grant necessary permissions
GRANT ALL ON license_keys TO authenticated;
GRANT ALL ON license_keys TO anon;

-- Optional: Create a view for active keys only
CREATE OR REPLACE VIEW active_license_keys AS
SELECT * FROM license_keys 
WHERE is_active = true 
AND (expires_at IS NULL OR expires_at > now());