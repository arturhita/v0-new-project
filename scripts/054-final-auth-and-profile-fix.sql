-- Step 1: Clean up any previous, potentially incorrect, triggers and functions.
-- This handles various names that might have been used in previous attempts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Step 2: Create the function that will be executed by the trigger.
-- This function inserts a new row into public.profiles when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record for the new user.
  -- It takes the user ID from the 'new' record in auth.users.
  -- It takes 'full_name' from the metadata provided during signup.
  -- It assigns a default role of 'client'.
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
-- This trigger will fire AFTER a new row is inserted (i.e., after a user signs up).
-- It will execute the handle_new_user() function for each new row.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add a comment to confirm the script's purpose and completion.
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ensures every new user gets a profile in the public.profiles table.';
