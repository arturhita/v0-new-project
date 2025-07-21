-- Questo script forza Supabase a ricaricare la relazione tra fatture e voci di fattura.

-- 1. Rimuove il vincolo di chiave esterna esistente, se presente.
-- Usiamo un nome generico che Supabase di solito assegna.
ALTER TABLE public.invoice_items
DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_fkey;

-- 2. Ricrea il vincolo di chiave esterna con un nome esplicito e chiaro.
-- Questo assicura che la relazione sia correttamente registrata nella cache dello schema.
ALTER TABLE public.invoice_items
ADD CONSTRAINT fk_invoice_items_to_invoices
FOREIGN KEY (invoice_id)
REFERENCES public.invoices(id)
ON DELETE CASCADE;
