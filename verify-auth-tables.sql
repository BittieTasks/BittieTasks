-- Check the structure of key authentication tables
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if we have the auth.users table (Supabase built-in)
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'auth' 
  AND table_name = 'users'
) AS auth_users_exists;