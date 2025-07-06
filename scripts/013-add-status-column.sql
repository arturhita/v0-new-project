-- SCRIPT 1: AGGIUNGI LA COLONNA MANCANTE
-- Esegui solo questo script per primo.

-- Crea un tipo di dato per lo status, se non esiste già.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operator_status') THEN
        CREATE TYPE public.operator_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'suspended'
        );
    END IF;
END$$;

-- Aggiungi la colonna 'status' alla tabella 'profiles', se non esiste.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status public.operator_status;

-- Imposta un valore di default per i nuovi utenti.
ALTER TABLE public.profiles
ALTER COLUMN status SET DEFAULT 'pending';

-- Aggiorna tutti gli utenti esistenti che non hanno uno status.
-- Diamo 'approved' a tutti per non bloccare nessuno.
UPDATE public.profiles
SET status = 'approved'
WHERE status IS NULL;

-- Rendi la colonna obbligatoria (non può essere vuota).
ALTER TABLE public.profiles
ALTER COLUMN status SET NOT NULL;

-- Messaggio di successo da cercare nei log se necessario.
SELECT 'Step 1 completato: Colonna "status" aggiunta e popolata con successo.' as result;
