-- Aggiunge la colonna 'total' alla tabella invoice_items per memorizzare il totale calcolato per ogni riga.
-- Questo risolve l'errore "column does not exist" e ottimizza le query evitando calcoli dinamici.

ALTER TABLE public.invoice_items
ADD COLUMN total NUMERIC(10, 2);

-- Aggiorna la colonna 'total' per le righe esistenti calcolando quantity * unit_price
UPDATE public.invoice_items
SET total = quantity * unit_price;

-- Ora che la colonna è popolata, la rendiamo non nulla per le nuove righe
ALTER TABLE public.invoice_items
ALTER COLUMN total SET NOT NULL;

-- Aggiungiamo un commento per chiarezza
COMMENT ON COLUMN public.invoice_items.total IS 'Il totale per la riga (quantity * unit_price)';
