-- STEP 1: COMPLETE TEARDOWN of old auth mechanisms to prevent conflicts.
-- Drop the trigger from the auth.users table.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the associated function that handles new user creation.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all known RLS policies on the 'profiles' table to ensure a clean slate.
-- This is the most critical step to solving the recursion issue.
DROP POLICY IF EXISTS "Profiles are viewable by owners and the public if active operator" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to active operators" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Unified Select Policy for Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update for owners" ON public.profiles;


-- STEP 2: REBUILD the user profile creation logic from scratch.
-- Create a clean, simple function to handle new user creation.
-- It sets the default role to 'client'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'client');
  RETURN new;
END;
$$;

-- Create a clean trigger on the auth.users table to call the function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 3: REBUILD Row Level Security (RLS) policies from scratch with non-recursive rules.
-- First, ensure RLS is enabled on the table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Create a single, unified SELECT policy. This is the key to preventing recursion.
-- A profile is viewable if:
-- 1. The viewer is the owner of the profile (auth.uid() = id).
-- OR
-- 2. The profile belongs to an active operator, making it public.
CREATE POLICY "Profiles are viewable by owners and public operators"
ON public.profiles FOR SELECT
USING (
  (auth.uid() = id) OR
  (role = 'operator' AND status = 'active')
);

-- Create a simple, non-conflicting UPDATE policy.
-- A user can only update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- NOTE on Admin Access: Admin access to view ALL profiles should be handled
-- in server-side code (e.g., Server Actions) using the Supabase Admin Client,
-- which bypasses RLS. Do NOT create an RLS policy for admin SELECT access
-- on the profiles table itself, as it is a common source of recursion.
