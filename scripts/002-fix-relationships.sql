-- Questo script aggiunge le relazioni (foreign keys) mancanti tra le tabelle.
-- Eseguire questo codice una sola volta nell'SQL Editor del vostro progetto Supabase.

-- Assicura che la colonna operator_id esista nella tabella services
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='operator_id') THEN
        ALTER TABLE public.services ADD COLUMN operator_id UUID;
    END IF;
END $$;

-- Aggiunge la relazione tra services e operators se non esiste
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_operator_id_fkey') THEN
        ALTER TABLE public.services
        ADD CONSTRAINT services_operator_id_fkey
        FOREIGN KEY (operator_id)
        REFERENCES public.operators(id)
        ON DELETE CASCADE;
    END IF;
END $$;


-- Assicura che la colonna operator_id esista nella tabella reviews
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='operator_id') THEN
        ALTER TABLE public.reviews ADD COLUMN operator_id UUID;
    END IF;
END $$;

-- Aggiunge la relazione tra reviews e operators se non esiste
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_operator_id_fkey') THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT reviews_operator_id_fkey
        FOREIGN KEY (operator_id)
        REFERENCES public.operators(id)
        ON DELETE CASCADE;
    END IF;
END $$;


-- Assicura che la colonna client_id esista nella tabella reviews
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='client_id') THEN
        ALTER TABLE public.reviews ADD COLUMN client_id UUID;
    END IF;
END $$;

-- Aggiunge la relazione tra reviews e profiles (per i clienti) se non esiste
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_client_id_fkey') THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT reviews_client_id_fkey
        FOREIGN KEY (client_id)
        REFERENCES public.profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;
