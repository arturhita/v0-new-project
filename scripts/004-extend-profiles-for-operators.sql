-- Aggiunge una colonna per la biografia dell'operatore, se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Aggiunge una colonna per le specializzazioni (es. "Tarocchi", "Astrologia").
-- Usiamo un array di testo (TEXT[]) per permettere specializzazioni multiple.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Aggiunge una colonna per i servizi offerti.
-- Usiamo JSONB che è un formato flessibile per memorizzare dati strutturati come i prezzi.
-- Esempio: {"chat": {"enabled": true, "price": 2.5}, "call": {"enabled": false}}
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS services JSONB;

-- Aggiunge una colonna per lo stato online in tempo reale (la useremo in futuro).
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Aggiunge una colonna per il nickname, se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Aggiunge una colonna per la data di iscrizione, se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS joined_date TIMESTAMPTZ DEFAULT NOW();

-- Aggiunge una colonna per il link al profilo, se non esiste già.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_link TEXT;
