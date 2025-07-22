-- Step 1: Clean up any previous attempts to fix this.
-- Drop existing RLS policies on the profiles table to avoid conflicts.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;


-- Drop the old trigger and function if they exist.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_my_profile();


-- Step 2: Create a new, clean function to handle new user creation.
-- This function will be called by the trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial. It runs the function with the permissions of the definer (usually postgres admin).
SET search_path = public
AS $$
BEGIN
  -- Insert a new row into the public.profiles table.
  -- It copies the id and email from the new user in auth.users.
  -- It sets a default role of 'client'.
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  RETURN new;
END;
$$;

-- Step 3: Create the trigger.
-- This trigger will fire automatically after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Set up the definitive, simple Row Level Security (RLS) policy.
-- First, ensure RLS is enabled on the table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- This policy allows a user to read ONLY their own profile.
-- This is the key to fixing the login issue.
CREATE POLICY "Users can read their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- This policy allows a user to update ONLY their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Note: We don't need an INSERT policy for users, because the trigger handles it.
