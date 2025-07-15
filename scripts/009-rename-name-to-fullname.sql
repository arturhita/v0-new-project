-- Rinomina la colonna 'name' in 'full_name' per coerenza con i metadati di Supabase Auth
ALTER TABLE public.profiles
RENAME COLUMN name TO full_name;
