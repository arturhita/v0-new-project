-- Drop the old function to ensure a clean slate and avoid any conflicts.
DROP FUNCTION IF EXISTS public.get_my_profile();

-- Recreate the function to return a single JSON object.
-- This approach is more robust as it avoids potential column type mismatches
-- between the function's declared return type and the actual table schema.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json -- The function will now return a single JSON object.
LANGUAGE sql
SECURITY DEFINER
-- Setting the search_path is crucial for SECURITY DEFINER functions
-- to find tables in the correct schema (in this case, 'public').
SET search_path = public
AS $$
  -- Select the profile row for the currently authenticated user
  -- and convert the entire row into a single JSON object.
  -- Using row_to_json is a standard and efficient way to do this.
  SELECT row_to_json(p.*)
  FROM public.profiles AS p
  WHERE p.id = auth.uid();
$$;

-- Grant permission to call this new, simplified function to any authenticated user.
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
