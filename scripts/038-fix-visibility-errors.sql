-- =================================================================
-- SCRIPT 038: FIX OPERATOR VISIBILITY AND ADMIN PANEL ERRORS
-- =================================================================

-- =================================================================
-- 1. RECREATE MISSING FUNCTION FOR CATEGORY PAGES
--    Fixes: "Could not find the function public.get_operators_by_category_case_insensitive"
-- =================================================================

-- Drop the function if it exists, to ensure a clean recreation
DROP FUNCTION IF EXISTS public.get_operators_by_category_case_insensitive(text);

-- Recreate the function, adding unaccent for better search with accented characters
CREATE OR REPLACE FUNCTION public.get_operators_by_category_case_insensitive(category_slug text)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.role = 'operator'
    AND p.status = 'Attivo'
    AND EXISTS (
      SELECT 1
      FROM unnest(p.categories) AS category
      WHERE lower(unaccent(category)) = lower(unaccent(category_slug))
    );
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 2. CREATE A NEW, CORRECT FUNCTION FOR THE ADMIN OPERATORS LIST
--    Fixes: "column profiles.email does not exist"
--    This function securely joins profiles with auth.users to get the email.
-- =================================================================

-- Drop the function if it exists, to ensure a clean recreation
DROP FUNCTION IF EXISTS public.get_operators_for_admin_list();

-- Define the return type for our new function. This makes the output predictable.
DROP TYPE IF EXISTS public.admin_operator_list_item;
CREATE TYPE public.admin_operator_list_item AS (
  id uuid,
  full_name text,
  stage_name text,
  email text, -- The missing email field
  status text,
  commission_rate numeric,
  avatar_url text,
  created_at timestamptz
);

-- Create the function that correctly fetches operator data including email
CREATE OR REPLACE FUNCTION public.get_operators_for_admin_list()
RETURNS SETOF public.admin_operator_list_item AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.stage_name,
    u.email, -- Get email from the correct table: auth.users
    p.status,
    p.commission_rate,
    p.avatar_url,
    p.created_at
  FROM
    public.profiles p
  JOIN
    auth.users u ON p.id = u.id
  WHERE
    p.role = 'operator'
  ORDER BY
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 3. GRANT PERMISSIONS TO USE THESE FUNCTIONS
-- =================================================================
GRANT EXECUTE ON FUNCTION public.get_operators_for_admin_list() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_operators_for_admin_list() TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_operators_by_category_case_insensitive(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_operators_by_category_case_insensitive(text) TO anon;

-- =================================================================
-- SCRIPT END
-- =================================================================
