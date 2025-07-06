-- This script elevates a specific user to the 'admin' role.
-- IMPORTANT: Run this script ONLY AFTER the user 'pagamenticonsulenza@gmail.com'
-- has successfully registered on the platform.

-- Find the user's ID from their email
-- and update their role in the 'profiles' table.
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'pagamenticonsulenza@gmail.com';

-- Log the action for auditing purposes
INSERT INTO public.logs (level, message, context)
VALUES ('info', 'Admin role assigned to user.', '{"email": "pagamenticonsulenza@gmail.com", "script": "021-set-specific-admin.sql"}');

-- You can verify the change with this query:
-- SELECT id, email, role FROM public.profiles WHERE email = 'pagamenticonsulenza@gmail.com';
