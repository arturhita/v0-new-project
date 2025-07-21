-- This script ensures the promotions table has the correct column names and types.
-- It's designed to be run safely even if parts of it have been run before.

DO $$
BEGIN
    -- 1. Rename 'start_hour' to 'start_time' if it exists
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='start_hour') THEN
        ALTER TABLE public.promotions RENAME COLUMN start_hour TO start_time;
    END IF;

    -- 2. Rename 'end_hour' to 'end_time' if it exists
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='end_hour') THEN
        ALTER TABLE public.promotions RENAME COLUMN end_hour TO end_time;
    END IF;

    -- 3. Ensure 'start_time' column exists and has the correct type
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='start_time') THEN
        ALTER TABLE public.promotions ADD COLUMN start_time TIME;
    ELSE
        -- If it exists, ensure it's the correct type
        ALTER TABLE public.promotions ALTER COLUMN start_time TYPE TIME USING start_time::text::TIME;
    END IF;

    -- 4. Ensure 'end_time' column exists and has the correct type
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='promotions' AND column_name='end_time') THEN
        ALTER TABLE public.promotions ADD COLUMN end_time TIME;
    ELSE
        -- If it exists, ensure it's the correct type
        ALTER TABLE public.promotions ALTER COLUMN end_time TYPE TIME USING end_time::text::TIME;
    END IF;
END $$;
