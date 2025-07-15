-- Questo script crea la tabella 'reviews' se non esiste e imposta le relazioni corrette.
-- È sicuro da eseguire più volte.

-- Crea la tabella 'reviews' solo se non esiste già.
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID,
    operator_id UUID,
    consultation_id UUID, -- Opzionale: per collegare la recensione a una specifica consulenza
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_approved BOOLEAN DEFAULT true, -- Per la moderazione
    
    -- Aggiunge le relazioni di chiave esterna (foreign key).
    CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT reviews_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Aggiunge indici per migliorare le performance delle query.
CREATE INDEX IF NOT EXISTS idx_reviews_operator_id ON public.reviews(operator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);

-- Commenti sullo schema per chiarezza
COMMENT ON TABLE public.reviews IS 'Contiene le recensioni lasciate dai clienti per gli operatori.';
COMMENT ON COLUMN public.reviews.rating IS 'Valutazione da 1 a 5 stelle.';
COMMENT ON COLUMN public.reviews.comment IS 'Testo della recensione.';
COMMENT ON COLUMN public.reviews.is_approved IS 'Indica se la recensione è stata approvata dalla moderazione.';
