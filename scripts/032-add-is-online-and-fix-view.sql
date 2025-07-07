-- Step 1: Add the is_online column to the profiles table if it doesn't exist.
-- This column will track the real-time presence of an operator.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Recreate or update the admin_operators_view to include the new is_online column.
-- This view provides a comprehensive look at operator data for the admin panel.
CREATE OR REPLACE VIEW public.admin_operators_view AS
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

-- Grant usage to the authenticated role so it can be accessed by logged-in users.
GRANT SELECT ON public.admin_operators_view TO authenticated;
GRANT SELECT ON public.admin_operators_view TO service_role;
