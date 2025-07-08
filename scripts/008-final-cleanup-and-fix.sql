-- Step 1: Clean up all previous, faulty trigger functions.
-- This will remove the clutter of failed attempts.
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();
DROP FUNCTION IF EXISTS public.setup_new_user();
DROP FUNCTION IF EXISTS public.handle_user_signup();

-- Step 2: Add the missing 'email' column to the 'profiles' table.
-- This was a primary cause of the registration failure.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Step 3: Create a single, robust, and simple function to handle new user creation.
-- This function is designed to be "bulletproof".
CREATE OR REPLACE FUNCTION public.handle_new_user_profile_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a new profile row, using default values for role and name if not provided.
  -- It only relies on the new user's ID and email from the auth event.
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  RETURN new;
END;
$$;

-- Step 4: Drop any existing trigger on the auth.users table to avoid conflicts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 5: Create the trigger that executes the new function after a user signs up.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile_creation();

-- Step 6: Grant necessary permissions.
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile_creation() TO postgres, anon, authenticated, service_role;
