-- Step 1: Aggressively drop all existing policies on the 'profiles' table.
-- This ensures a completely clean slate, removing any conflicting or legacy policies.
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

-- Step 2: Create a single, unified SELECT policy.
-- This is the most important step to prevent recursion. Combining conditions with OR
-- is safer than having multiple SELECT policies that might interact unexpectedly.
-- A row in 'profiles' can be selected if:
--   a) It belongs to an active operator (for public listings).
--   b) The person viewing the row is the owner of the profile (for personal dashboard/login).
CREATE POLICY "Unified Select Policy for Profiles"
ON public.profiles FOR SELECT
USING (
  (role = 'operator' AND status = 'Attivo') OR (auth.uid() = id)
);

-- Step 3: Create a simple, secure UPDATE policy.
-- A user can only update their own profile.
CREATE POLICY "Allow profile update for owners"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Ensure RLS is enabled and forced on the table.
-- This is a safeguard to make sure the policies are active.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- The existing trigger for profile creation on sign-up is assumed to be correct and remains in effect.
-- Admin actions should continue to use the service_role key to bypass RLS.
