-- =================================================================
-- MASTER SCRIPT FOR USERS, PROFILES, AND OPERATORS
-- This script resets and rebuilds the entire schema.
-- It is idempotent and can be run safely multiple times.
-- =================================================================

-- Step 1: Drop existing objects in reverse order of dependency to avoid errors.
DROP VIEW IF EXISTS public.operators_view;
DROP TABLE IF EXISTS public.operators;
DROP TABLE IF EXISTS public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.operator_status;

-- Step 2: Create custom ENUM types for roles and statuses.
CREATE TYPE public.user_role AS ENUM ('admin', 'client', 'operator');
CREATE TYPE public.operator_status AS ENUM ('active', 'pending', 'suspended');

-- Step 3: Create the 'profiles' table.
-- This table will store public information for all users.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    username text UNIQUE,
    email text UNIQUE,
    role public.user_role DEFAULT 'client'::public.user_role,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Add comments for clarity
COMMENT ON TABLE public.profiles IS 'Stores public profile data for all users.';
COMMENT ON COLUMN public.profiles.id IS 'Links to the corresponding user in auth.users.';

-- Step 4: Create the 'operators' table.
-- This table stores data specific to users with the 'operator' role.
CREATE TABLE public.operators (
    profile_id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio text,
    commission_rate integer DEFAULT 20 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
    status public.operator_status DEFAULT 'pending'::public.operator_status,
    main_discipline text,
    specializations text[],
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Add comments for clarity
COMMENT ON TABLE public.operators IS 'Stores additional data for users who are operators.';
COMMENT ON COLUMN public.operators.profile_id IS 'Links to the operator''s profile in the profiles table.';

-- Step 5: Create the function to handle new user sign-ups.
-- This function automatically creates a profile entry when a new user is created in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.email,
    (new.raw_user_meta_data->>'role')::public.user_role
  );
  RETURN new;
END;
$$;

-- Step 6: Create the trigger to call the function.
-- This trigger fires after a new user is inserted into auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 7: Create the 'operators_view' for easy data retrieval.
-- This view joins profiles and operators for a complete operator overview.
CREATE VIEW public.operators_view AS
SELECT
    p.id AS profile_id,
    p.full_name,
    p.username,
    p.email,
    p.role,
    p.created_at,
    o.commission_rate,
    o.status,
    o.bio,
    o.main_discipline,
    o.specializations,
    o.joined_at
FROM
    public.profiles p
JOIN
    public.operators o ON p.id = o.profile_id
WHERE
    p.role = 'operator';

-- Step 8: Set up Row Level Security (RLS) for all tables.
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles are visible to everyone.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);
-- Users can insert their own profile (handled by trigger).
-- Users can update their own profile.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Operators data is visible to everyone.
CREATE POLICY "Operator data is viewable by everyone." ON public.operators
  FOR SELECT USING (true);
-- Operators can update their own data.
CREATE POLICY "Operators can update their own data." ON public.operators
  FOR UPDATE USING (auth.uid() = profile_id);

-- Grant permissions to roles
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT UPDATE (full_name, username) ON TABLE public.profiles TO authenticated;

GRANT SELECT ON TABLE public.operators TO anon, authenticated;
GRANT UPDATE (bio, main_discipline, specializations) ON TABLE public.operators TO authenticated;

GRANT SELECT ON TABLE public.operators_view TO anon, authenticated;

-- Grant usage on types to roles
GRANT USAGE ON TYPE public.user_role TO anon, authenticated;
GRANT USAGE ON TYPE public.operator_status TO anon, authenticated;
