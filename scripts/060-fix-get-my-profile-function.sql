-- This script corrects the return type of the get_my_profile function.
-- The 'profiles' table has a 'role' column of type 'text', but the function
-- was previously declared to return 'public.user_role', causing a mismatch.
-- This version aligns the function's return signature with the actual table schema.

-- Drop the old function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.get_my_profile();

-- Recreate the function with the correct return type for the 'role' column.
CREATE OR REPLACE FUNCTION public.get_my_profile()
-- The structure returned by the function. Note that 'role' is now 'text'.
RETURNS TABLE (
    id uuid,
    full_name text,
    avatar_url text,
    role text -- CORRECTED: Changed from public.user_role to text
)
LANGUAGE sql
SECURITY DEFINER
-- Set the search path to ensure the function can find tables in the 'public' schema.
SET search_path = public
AS $$
    -- The function's logic remains the same: select the profile for the authenticated user.
    SELECT
        p.id,
        p.full_name,
        p.avatar_url,
        p.role
    FROM
        public.profiles AS p
    WHERE
        p.id = auth.uid();
$$;

-- Re-grant execute permission to authenticated users so they can call this function.
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
