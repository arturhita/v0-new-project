-- Set a default value for the 'services' column for all future profiles
ALTER TABLE public.profiles
ALTER COLUMN services SET DEFAULT '{"chat": {"enabled": false, "price_per_minute": 0}, "call": {"enabled": false, "price_per_minute": 0}, "video": {"enabled": false, "price_per_minute": 0}}'::jsonb;

-- Update all existing profiles where 'services' is NULL to the new default value
-- This ensures that all current users have a valid services object.
UPDATE public.profiles
SET services = '{"chat": {"enabled": false, "price_per_minute": 0}, "call": {"enabled": false, "price_per_minute": 0}, "video": {"enabled": false, "price_per_minute": 0}}'::jsonb
WHERE services IS NULL;
