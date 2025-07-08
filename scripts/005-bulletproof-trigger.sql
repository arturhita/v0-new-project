-- Step 1: Clean up any previous versions of the trigger and function for a fresh start.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Step 2: Create the new, simplified, and robust function.
-- This version is designed to be "bulletproof" by minimizing dependencies.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER is crucial. It runs the function with the permissions of the user who defined it (the postgres admin),
-- allowing it to bypass any RLS policies that would otherwise block the insert into the profiles table.
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert a new profile.
  -- It uses only data guaranteed to exist on the `new` user record (`id`, `email`).
  -- It uses COALESCE to safely access optional metadata without causing an error if it's missing.
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Nuovo Utente'), -- Safely gets the name, or uses a default.
    'client' -- Always assigns the 'client' role on signup for security and consistency.
  );
  RETURN new;
END;
$$;

-- Step 3: Re-create the trigger to call the new function after a user is inserted into auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 4: Explicitly grant permissions. This is a common source of failure and ensures the trigger can execute.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated;
