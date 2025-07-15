-- Questo script corregge la relazione mancante tra le tabelle 'reviews' e 'profiles'.
-- È sicuro da eseguire più volte.

-- Assicura che le colonne necessarie per le chiavi esterne esistano nella tabella 'reviews'.
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS client_id UUID,
ADD COLUMN IF NOT EXISTS operator_id UUID;

-- Aggiunge la relazione di chiave esterna per 'client_id' se non esiste già.
-- Questa collega una recensione al profilo del cliente che l'ha scritta.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_client_id_fkey' AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.profiles(id)
    ON DELETE SET NULL; -- Se un profilo viene cancellato, la recensione rimane ma senza autore.
  END IF;
END;
$$;

-- Aggiunge la relazione di chiave esterna per 'operator_id' se non esiste già.
-- Questa collega una recensione al profilo dell'operatore che l'ha ricevuta.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_operator_id_fkey' AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_operator_id_fkey
    FOREIGN KEY (operator_id) REFERENCES public.profiles(id)
    ON DELETE SET NULL; -- Se un operatore viene cancellato, la recensione rimane.
  END IF;
END;
$$;
