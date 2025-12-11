-- Add INSERT policy for users table to allow profile creation on signup
CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
