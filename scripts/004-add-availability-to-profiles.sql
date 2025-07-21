-- Aggiunge la colonna 'availability' alla tabella 'profiles' per memorizzare gli orari di disponibilità.
-- Questa colonna è di tipo JSONB per flessibilità.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}'::jsonb;

-- Aggiunge un commento alla nuova colonna per chiarezza.
COMMENT ON COLUMN public.profiles.availability IS 'Orari di disponibilità settimanale dell''operatore, es. {"monday": ["09:00-12:00"], "tuesday": []}';
