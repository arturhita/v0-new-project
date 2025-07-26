-- Questo script aggiunge una colonna 'status' alla tabella 'reviews' per permettere la moderazione.

-- Passo 1: Crea un tipo personalizzato per gli stati delle recensioni per garantire l'integrità dei dati.
-- Usiamo 'DO $$ BEGIN ... END $$;' per evitare errori se il tipo esiste già.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
        CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END$$;

-- Passo 2: Aggiunge la colonna 'status' alla tabella 'reviews'.
-- Le nuove recensioni avranno come default 'pending' per forzare la moderazione.
-- Usiamo una transazione per garantire che l'operazione sia atomica.
BEGIN;

-- Aggiunge la colonna solo se non esiste per rendere lo script rieseguibile.
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS status review_status DEFAULT 'pending';

-- Passo 3: Per tutte le recensioni esistenti create prima di questa migrazione,
-- le impostiamo come 'approved' in modo che appaiano sul sito.
-- Questo è un aggiornamento una tantum.
UPDATE public.reviews
SET status = 'approved'
WHERE status IS NULL;

-- Passo 4: Rende la colonna 'status' non nulla dopo aver aggiornato le righe esistenti.
ALTER TABLE public.reviews
ALTER COLUMN status SET NOT NULL;

COMMIT;

-- NOTA: Dopo aver eseguito questo script, la funzione 'get_operator_public_profile'
-- che abbiamo creato in precedenza funzionerà correttamente senza bisogno di ulteriori modifiche.
