-- =================================================================
-- FINAL AUTH FIX SCRIPT
-- =================================================================
-- This script ensures the handle_new_user function and its trigger
-- are correctly configured to support server-side auth actions.
-- It correctly reads metadata to assign roles and create profiles.
-- =================================================================

-- Step 1: Define the user_role type if it doesn't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
END$$;


-- Step 2: Drop the old function to ensure a clean replacement.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create the corrected function.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role public.user_role;
  user_full_name TEXT;
BEGIN
  -- Extract role from metadata, default to 'client'.
  user_role := (new.raw_user_meta_data->>'role');
  IF user_role IS NULL OR user_role NOT IN ('client', 'operator', 'admin') THEN
    user_role := 'client';
  END IF;

  -- Extract full_name from metadata.
  user_full_name := new.raw_user_meta_data->>'full_name';

  -- Insert the new profile record.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, user_full_name, user_role);
  
  RETURN new;
END;
$$;

-- Step 4: Re-create the trigger to link it to the new function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
