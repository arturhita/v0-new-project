-- =================================================================
    -- FIX SCRIPT FOR USER REGISTRATION
    -- =================================================================
    -- This script corrects the database trigger responsible for creating
    -- a user profile when a new user signs up.
    --
    -- Problems Addressed:
    -- 1. The previous function incorrectly tried to insert an 'email'
    --    into the 'profiles' table, which does not have this column,
    --    causing all new registrations to fail.
    -- 2. The previous function hardcoded the role as 'client', which
    --    would have caused issues for operator sign-ups.
    --
    -- Solution:
    -- 1. The INSERT statement is corrected to only include columns
    --    that exist in the 'profiles' table (id, full_name, role).
    -- 2. The function now intelligently checks the user's metadata
    --    for a 'role'. If one is provided (e.g., 'operator'), it's used.
    --    Otherwise, it defaults to 'client'. This makes the registration
    --    process robust for both clients and operators.
    -- =================================================================

    -- Step 1: Replace the faulty function with the corrected version.
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      user_role public.user_role;
    BEGIN
      -- Check if role is provided in metadata, otherwise default to 'client'
      -- This handles both client registration (no role in metadata) and
      -- operator registration (role is 'operator' in metadata).
      user_role := (new.raw_user_meta_data->>'role');
      IF user_role IS NULL OR user_role NOT IN ('client', 'operator', 'admin') THEN
        user_role := 'client';
      END IF;

      -- Insert the new profile record without the non-existent 'email' column.
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (new.id, new.raw_user_meta_data->>'full_name', user_role);
      
      RETURN new;
    END;
    $$;

    -- Step 2: Re-apply the trigger to ensure it uses the updated function.
    -- This ensures that for every new user in `auth.users`, the corrected
    -- `handle_new_user` function is executed.
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
