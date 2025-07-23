-- This script patches existing user data.
-- It finds all profiles where the 'services' column is NULL
-- and updates it with a default, valid JSONB structure.
-- This is a critical one-time fix to ensure data consistency for all users.
UPDATE public.profiles
SET services = '{
  "chat": {"enabled": false, "price_per_minute": 0},
  "call": {"enabled": false, "price_per_minute": 0},
  "video": {"enabled": false, "price_per_minute": 0}
}'::jsonb
WHERE services IS NULL;
