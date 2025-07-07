-- =============================================
-- Script to create the admin user if it doesn't exist
-- =============================================
DO $$
DECLARE
  admin_email TEXT := 'pagamenticonsulenza@gmail.com';
  admin_password TEXT := '@Annaadmin2025@#';
  admin_name TEXT := 'Admin';
  admin_user_id UUID;
BEGIN
  -- Check if the user already exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    -- User does not exist, so create them
    RAISE NOTICE 'Admin user % not found. Creating...', admin_email;

    -- Create the user in the auth schema
    admin_user_id := auth.admin_create_user(
      admin_email,
      admin_password,
      '{"name": "' || admin_name || '", "role": "admin"}'::jsonb
    );

    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;

    -- The trigger `on_auth_user_created` should have already created the profile.
    -- We will now explicitly set the role to 'admin' to be certain.
    UPDATE public.profiles
    SET role = 'admin', status = 'active'
    WHERE id = admin_user_id;

    RAISE NOTICE 'Profile for user % updated with admin role.', admin_email;
  ELSE
    -- User exists, ensure their role is 'admin'
    RAISE NOTICE 'Admin user % already exists with ID: %.', admin_email, admin_user_id;

    UPDATE public.profiles
    SET role = 'admin', status = 'active'
    WHERE id = admin_user_id AND role IS DISTINCT FROM 'admin';

    IF FOUND THEN
      RAISE NOTICE 'Profile for user % was not admin, updated successfully.', admin_email;
    ELSE
      RAISE NOTICE 'Profile for user % is already admin. No changes needed.', admin_email;
    END IF;
  END IF;
END $$;
