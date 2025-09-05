-- Create users table to track license key users
CREATE TABLE IF NOT EXISTS public.license_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_key_id UUID REFERENCES public.license_keys(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT,
    ip_address INET,
    user_agent TEXT,
    is_banned BOOLEAN DEFAULT false,
    first_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(license_key_id, username)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_license_users_key_id ON public.license_users(license_key_id);
CREATE INDEX IF NOT EXISTS idx_license_users_username ON public.license_users(username);
CREATE INDEX IF NOT EXISTS idx_license_users_banned ON public.license_users(is_banned);

-- Enable Row Level Security
ALTER TABLE public.license_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production security needs)
CREATE POLICY "Allow all operations on license_users" 
ON public.license_users 
FOR ALL 
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.license_users TO authenticated;
GRANT ALL ON public.license_users TO anon;

-- Insert some sample users for demo/testing
INSERT INTO public.license_users (license_key_id, username, email) 
SELECT 
    lk.id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 1 THEN 'john_doe'
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 2 THEN 'admin_user'
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 3 THEN 'temp_student'
        ELSE 'premium_teacher'
    END,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 1 THEN 'john@school.edu'
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 2 THEN 'admin@school.edu'
        WHEN ROW_NUMBER() OVER (ORDER BY lk.created_at) = 3 THEN 'student@school.edu'
        ELSE 'teacher@school.edu'
    END
FROM public.license_keys lk
WHERE NOT EXISTS (
    SELECT 1 FROM public.license_users lu 
    WHERE lu.license_key_id = lk.id
)
LIMIT 4;