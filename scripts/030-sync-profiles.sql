-- File: scripts/030-sync-profiles.sql
-- Purpose: Creates missing profiles for users that exist in the authentication system.
-- This script is safe to run multiple times and will fix users in a "broken" state.

INSERT INTO public.profiles (id, full_name, username, role)
SELECT
    u.id,
    u.raw_user_meta_data->>'full_name',
    -- Use the email as the default username, as it's guaranteed to be unique among users.
    u.email,
    'client' -- Assign a default role
FROM
    auth.users u
WHERE
    -- Only select users that do NOT have an existing profile.
    NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
