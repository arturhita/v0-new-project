-- Step 1: Grant the 'supabase_auth_admin' role to 'postgres'.
-- This is the crucial step to resolve the "must be owner of relation users" (42501) error.
-- It gives the 'postgres' user (who runs scripts in the SQL Editor) the necessary permissions
-- to add a trigger to the 'auth.users' table, which is owned by 'supabase_auth_admin'.
GRANT supabase_auth_admin TO postgres;

-- Step 2: Clean up any previous, potentially incorrect, triggers and functions.
-- This ensures a clean slate and avoids conflicts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create the function that will be executed by the trigger.
-- SECURITY DEFINER allows this function to run with the permissions of the user who created it (postgres),
-- which is necessary to write to the 'public.profiles' table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record for the new user.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'client'
  );
  RETURN new;
END;
$$;

-- Step 4: Create the trigger on the auth.users table.
-- This will now succeed because the 'postgres' role has the required permissions.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Add a comment to confirm the script's purpose and completion.
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ensures every new user gets a profile in the public.profiles table.';
