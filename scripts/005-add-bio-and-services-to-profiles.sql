-- Aggiunge la colonna 'bio' di tipo TEXT se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Aggiunge la colonna 'services' di tipo JSONB se non esiste già.
-- JSONB è il tipo corretto per memorizzare oggetti strutturati come i servizi.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS services JSONB;
