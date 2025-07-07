-- Step 1: Add the is_online column to the profiles table if it doesn't exist.
-- This is idempotent and safe to run multiple times.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Drop the existing view to avoid column name/order conflicts.
-- This is the key fix for the "cannot change name of view column" error.
DROP VIEW IF EXISTS public.admin_operators_view;

-- Step 3: Recreate the view with the correct and final column structure.
-- This view provides a comprehensive look at operator data for the admin panel.
CREATE VIEW public.admin_operators_view AS
SELECT
    u.id,
    u.email,
    u.created_at AS joined_at,
    p.full_name,
    p.stage_name,
    p.phone,
    p.bio,
    p.profile_image_url,
    p.status,
    p.is_available,
    p.is_online, -- Including the new column
    p.commission_rate,
    p.main_discipline,
    p.specialties,
    p.service_prices,
    p.availability_schedule,
    p.average_rating,
    p.review_count
FROM
    auth.users u
JOIN
    public.profiles p ON u.id = p.id
WHERE
    p.role = 'operator';

-- Step 4: Grant necessary permissions on the new view.
GRANT SELECT ON public.admin_operators_view TO authenticated;
GRANT SELECT ON public.admin_operators_view TO service_role;
