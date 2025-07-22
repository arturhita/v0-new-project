-- It's possible the previous trigger was created with a typo ('on_auth_Euser_created').
-- This script ensures any incorrect versions are dropped before creating the correct one.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_euser_created ON auth.users; -- Dropping the typo version just in case

-- Drop the function to ensure it's recreated with the correct logic.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- This function creates a profile for a new user.
-- It runs with the security rights of the user that defines it (the 'postgres' user).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserts a new row into the public.profiles table.
  -- It uses the ID and the full_name from the new user's metadata.
  -- The role is automatically set to 'client'.
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    'client',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- This trigger executes the handle_new_user function automatically
-- AFTER a new user is inserted into the auth.users table.
-- This is the correct trigger name.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Re-grant permissions just to be safe.
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres;
