-- Creates a secure function to grant admin privileges to a user.
-- This is safer than manually updating the auth.users table.
-- The function can only be called by a database admin (e.g., from the Supabase dashboard).
CREATE OR REPLACE FUNCTION public.grant_admin_role(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
-- SECURITY DEFINER allows this function to modify the protected auth.users table
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find the user's ID from their email
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;

  IF user_id IS NULL THEN
    RETURN 'Error: User not found with email ' || email_address;
  END IF;

  -- Update the user's metadata in the auth table to include the admin role claim
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"user_role": "admin"}'::jsonb
  WHERE id = user_id;

  -- Also update the public profiles table for consistency within the app
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = user_id;

  RETURN 'Success: Admin role granted to ' || email_address;
END;
$$;

-- Grant execute permission to the 'postgres' role (the default superuser)
-- This ensures you can run it from the Supabase SQL editor.
GRANT EXECUTE ON FUNCTION public.grant_admin_role(TEXT) TO postgres;


-- =====================================================================================
-- IMPORTANT: Call the function to grant admin rights to YOUR user.
-- Replace 'your-email@example.com' with the email you use to log in to the app.
-- =====================================================================================
SELECT public.grant_admin_role('your-email@example.com');
