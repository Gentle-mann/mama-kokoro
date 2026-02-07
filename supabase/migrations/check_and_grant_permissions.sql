-- Check current permissions for anon and authenticated roles
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant permissions to anon role (for public read access)
GRANT SELECT ON users TO anon;
GRANT SELECT ON conversations TO anon;
GRANT SELECT ON messages TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON tips TO anon;
GRANT SELECT ON tip_ratings TO anon;

-- Grant full permissions to authenticated role (for logged-in users)
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON conversations TO authenticated;
GRANT ALL PRIVILEGES ON messages TO authenticated;
GRANT ALL PRIVILEGES ON categories TO authenticated;
GRANT ALL PRIVILEGES ON tips TO authenticated;
GRANT ALL PRIVILEGES ON tip_ratings TO authenticated;

-- Verify permissions after granting
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;