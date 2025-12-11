-- Disable RLS on videos table to allow all uploads without restrictions
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable RLS on related tables for full compatibility
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE followers DISABLE ROW LEVEL SECURITY;
