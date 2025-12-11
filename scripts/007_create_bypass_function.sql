-- Create a function that bypasses RLS for video insertion
-- SECURITY DEFINER runs the function with elevated privileges
CREATE OR REPLACE FUNCTION insert_video_no_rls(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_video_url TEXT,
  p_duration INT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_video_id UUID;
BEGIN
  -- Insert video directly, bypassing RLS
  INSERT INTO videos (
    user_id,
    title,
    description,
    video_url,
    duration,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_description,
    p_video_url,
    p_duration,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_video_id;

  RETURN json_build_object(
    'id', v_video_id,
    'success', true,
    'message', 'Video saved successfully'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_video_no_rls TO authenticated;
GRANT EXECUTE ON FUNCTION insert_video_no_rls TO service_role;
GRANT EXECUTE ON FUNCTION insert_video_no_rls TO anon;
