-- Step 1: Clean up any previous, potentially incorrect, triggers and functions.
-- This ensures a clean slate and avoids conflicts from previous failed attempts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the function that will be executed by the trigger.
-- SECURITY DEFINER is the key to solving the permission issue. It allows this function
-- to run with the permissions of its owner (the 'postgres' user), which has the necessary
-- rights to insert into the 'public.profiles' table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record for the new user, taking the full_name from the metadata
  -- passed during the signUp call. The role defaults to 'client'.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'client'
  );
  RETURN new;
END;
$$;

-- Step 3: Create the trigger on the auth.users table.
-- This trigger will fire automatically after a new user is inserted into auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add a comment to the trigger for future reference.
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ensures every new user gets a profile in the public.profiles table.';
