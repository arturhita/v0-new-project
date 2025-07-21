-- Rename columns to match application code
ALTER TABLE public.promotions
RENAME COLUMN start_hour TO start_time;

ALTER TABLE public.promotions
RENAME COLUMN end_hour TO end_time;

-- Ensure the columns are of type TIME, which is more appropriate
ALTER TABLE public.promotions
ALTER COLUMN start_time TYPE TIME USING start_time::TIME,
ALTER COLUMN end_time TYPE TIME USING end_time::TIME;
