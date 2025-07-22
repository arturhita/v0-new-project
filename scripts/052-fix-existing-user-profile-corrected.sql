-- Manually create a profile for the specific user from the error log.
-- This version is corrected to not include the non-existent 'email' column.
-- It takes the user ID and finds the corresponding full name
-- from the auth.users table, then creates the missing profile.
-- The ON CONFLICT clause ensures it does nothing if a profile somehow already exists.
INSERT INTO public.profiles (id, role, full_name)
SELECT
    '39236e50-1799-413b-ad33-182506694193',
    'client',
    u.raw_user_meta_data->>'full_name'
FROM auth.users u
WHERE u.id = '39236e50-1799-413b-ad33-182506694193'
ON CONFLICT (id) DO NOTHING;
