-- This script is designed to clean up any previous, faulty attempts to create a profile trigger.
-- It will remove the function and the trigger to restore the auth.users table to its default state.

-- Drop the trigger from the auth.users table if it exists.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that the trigger calls if it exists.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- We also drop any potential mistyped versions from previous attempts to be safe.
DROP TRIGGER IF EXISTS on_auth_Euser_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
