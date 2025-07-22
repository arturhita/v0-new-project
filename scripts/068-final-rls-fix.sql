-- Step 1: Aggressively drop all existing policies on the 'profiles' table.
-- This ensures a completely clean slate, removing any conflicting or legacy policies that cause recursion.
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
DROP POLICY IF EXISTS "Profiles are viewable by owners and the public if active operator" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;


-- Step 2: Create a single, unified SELECT policy to prevent recursion.
-- A profile is viewable if:
-- 1. The viewer is the owner of the profile.
-- OR
-- 2. The profile belongs to an active operator (making it public).
CREATE POLICY "Profiles are viewable by owners and the public if active operator"
ON public.profiles FOR SELECT
USING (
  (auth.uid() = id) OR
  (role = 'operator' AND status = 'active')
);

-- Step 3: Create a simple, non-conflicting UPDATE policy.
-- A user can only update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Ensure RLS is enabled and forced on the table.
-- This is a safeguard to make sure the policies are active.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Step 5: Clean up old functions that are no longer needed or could cause issues.
DROP FUNCTION IF EXISTS get_my_profile();
DROP FUNCTION IF EXISTS get_user_profile(user_id uuid);
