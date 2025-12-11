-- Allow service role to bypass RLS checks for videos INSERT
-- This enables server-side video uploads without auth.uid() requirement
CREATE POLICY "Service role can create videos" ON videos
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Also allow service role for other operations
CREATE POLICY "Service role can update videos" ON videos
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete videos" ON videos
  FOR DELETE USING (auth.role() = 'service_role');
