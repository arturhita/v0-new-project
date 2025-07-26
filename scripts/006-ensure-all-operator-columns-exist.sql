-- Questo script assicura che tutte le colonne necessarie per un profilo operatore esistano nella tabella 'profiles'.
-- È progettato per essere eseguito più volte senza causare errori.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS surname TEXT,
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS services JSONB,
ADD COLUMN IF NOT EXISTS availability JSONB;

-- Nota: Questo non modifica la colonna 'avatar_url', che si presume esista come TEXT.
-- Anche la colonna 'role' si presume esista.
