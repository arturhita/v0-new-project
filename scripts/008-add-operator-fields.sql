-- Aggiunge colonne specifiche per gli operatori alla tabella dei profili
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stage_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS services JSONB,
ADD COLUMN IF NOT EXISTS availability JSONB,
ADD COLUMN IF NOT EXISTS average_rating REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Aggiunge un indice per la ricerca testuale su nome d'arte e specialità
CREATE INDEX IF NOT EXISTS profiles_search_idx ON public.profiles USING gin (to_tsvector('italian', stage_name || ' ' || array_to_string(specialties, ' ')));
