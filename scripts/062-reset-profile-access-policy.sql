-- Step 1: Clean up previous attempts to avoid conflicts.
-- Drop the RPC function as we will now use direct table access with RLS.
DROP FUNCTION IF EXISTS public.get_my_profile();

-- Step 2: Remove all existing RLS policies on the 'profiles' table.
-- This ensures we have a clean slate and no old policies are interfering.
-- We get the policy names dynamically to drop them.
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles;';
    END LOOP;
END;
$$;

-- Step 3: Ensure RLS is enabled on the table.
-- This is crucial; without this, policies are not enforced.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create the definitive, simple RLS policy for reading profiles.
-- This is the standard and most secure way to allow users to read their own data.
-- It grants SELECT permission to any 'authenticated' user, but the USING clause
-- filters the rows, ensuring they can only see the row where the 'id' column
-- matches their own session UID.
CREATE POLICY "Allow authenticated users to read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 5: Grant necessary table-level permissions.
-- RLS policies work in conjunction with table-level grants.
-- We need to ensure authenticated users have the base permission to SELECT from the table.
-- The RLS policy then filters which rows they are allowed to see.
GRANT SELECT ON public.profiles TO authenticated;
-- Only backend/admin roles should be able to modify profiles directly.
GRANT INSERT, UPDATE, DELETE ON public.profiles TO service_role;
