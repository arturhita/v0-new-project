-- =================================================================
-- SCRIPT 039: FIX ALL OPERATOR VISIBILITY ISSUES
-- =================================================================

-- =================================================================
-- 1. FIX ADMIN PANEL FUNCTION
--    Fixes: "structure of query does not match function result type"
--    Method: Use RETURNS TABLE for a more robust function definition.
-- =================================================================

-- Clean up previous attempts
DROP FUNCTION IF EXISTS public.get_operators_for_admin_list();
DROP TYPE IF EXISTS public.admin_operator_list_item;

-- Recreate the function using the safer RETURNS TABLE syntax
CREATE OR REPLACE FUNCTION public.get_operators_for_admin_list()
RETURNS TABLE(
  id uuid,
  full_name text,
  stage_name text,
  email text,
  status text,
  commission_rate numeric,
  avatar_url text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.stage_name,
    u.email,
    p.status,
    p.commission_rate,
    p.avatar_url,
    p.created_at
  FROM
    public.profiles p
  LEFT JOIN -- Use LEFT JOIN to ensure operators are shown even if something is wrong with auth.users entry
    auth.users u ON p.id = u.id
  WHERE
    p.role = 'operator'
  ORDER BY
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 2. FIX CATEGORY PAGE FUNCTION
--    Fixes: Operators not appearing on category pages.
--    Method: Make the function more robust against NULL values in the categories array.
-- =================================================================

-- Recreate the function with a check for NULL categories
CREATE OR REPLACE FUNCTION public.get_operators_by_category_case_insensitive(category_slug text)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.role = 'operator'
    AND p.status = 'Attivo'
    AND p.categories IS NOT NULL -- Important: ensure the array exists
    AND EXISTS (
      SELECT 1
      FROM unnest(p.categories) AS category
      WHERE lower(unaccent(category)) = lower(unaccent(category_slug))
    );
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- 3. FIX HOMEPAGE OPERATOR LIST
--    Fixes: Operators not appearing on the homepage.
--    Method: Create a dedicated, public-facing function and update the server action.
-- =================================================================

-- Create a new function to get featured operators
CREATE OR REPLACE FUNCTION public.get_featured_operators_public()
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.profiles
  WHERE role = 'operator'
    AND status = 'Attivo'
  ORDER BY random() -- Or some other logic like rating, etc.
  LIMIT 8;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- 4. GRANT PERMISSIONS
-- =================================================================
-- Admin function
GRANT EXECUTE ON FUNCTION public.get_operators_for_admin_list() TO service_role;

-- Public functions
GRANT EXECUTE ON FUNCTION public.get_operators_by_category_case_insensitive(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_featured_operators_public() TO anon, authenticated;

-- =================================================================
-- SCRIPT END
-- =================================================================
