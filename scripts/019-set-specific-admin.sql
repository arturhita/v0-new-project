-- This script elevates a specific user to 'admin' role based on their email.
-- IMPORTANT: Run this script AFTER the user 'pagamenticonsulenza@gmail.com' has successfully registered.

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Find the user_id from the auth.users table using the email
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'pagamenticonsulenza@gmail.com';

  -- If the user exists, update their role in the public.profiles table
  IF admin_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = admin_user_id;

    -- Log the action for confirmation
    INSERT INTO public.logs (level, message, context)
    VALUES ('info', 'Admin role granted to pagamenticonsulenza@gmail.com', jsonb_build_object('script', '019-set-specific-admin.sql', 'userId', admin_user_id));
    
    RAISE NOTICE 'User pagamenticonsulenza@gmail.com has been promoted to admin.';
  ELSE
    RAISE WARNING 'User pagamenticonsulenza@gmail.com not found. Please register the user first.';
  END IF;
END $$;
