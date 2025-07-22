-- Step 1: Clean up all existing policies on the profiles table to avoid conflicts.
DROP POLICY IF EXISTS "Allow public read access to active operators" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;


-- Step 2: Create a simple, non-recursive policy for public read access.
-- This allows anyone (including logged-out users) to view active operator profiles.
-- This is crucial for the homepage and operator listing pages.
CREATE POLICY "Allow public read access to active operators"
ON public.profiles FOR SELECT
USING (role = 'operator' AND status = 'Attivo');


-- Step 3: Create a policy for authenticated users to access their own data.
-- This allows a logged-in user to read their own profile, which is essential for the dashboard and auth context.
CREATE POLICY "Allow individual read access"
ON public.profiles FOR SELECT
USING (auth.uid() = id);


-- Step 4: Create a policy for authenticated users to update their own profile.
CREATE POLICY "Allow individual update access"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- NOTE: Admin access should be handled server-side using the service_role key,
-- which bypasses RLS. This is safer than creating a broad admin policy.
-- The existing trigger for profile creation on sign-up remains in effect.
