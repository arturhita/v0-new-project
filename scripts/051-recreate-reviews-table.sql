-- Questo script è distruttivo. Elimina la tabella esistente per garantirne una ricreazione pulita.
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Ricrea la tabella delle recensioni con tutte le colonne e i vincoli necessari
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    operator_id UUID NOT NULL REFERENCES public.profiles(id),
    consultation_id UUID, -- Può provenire da consulti, consulti scritti, ecc.
    service_type TEXT NOT NULL, -- es. 'chat', 'call', 'written'
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Abilita la Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Chiunque può leggere le recensioni approvate
CREATE POLICY "Public can view approved reviews" ON public.reviews
FOR SELECT USING (status = 'approved');

-- Gli utenti possono vedere le proprie recensioni indipendentemente dallo stato
CREATE POLICY "Users can view their own reviews" ON public.reviews
FOR SELECT USING (auth.uid() = client_id);

-- Gli utenti possono inserire recensioni per se stessi
CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Gli amministratori possono fare qualsiasi cosa
CREATE POLICY "Admins can manage all reviews" ON public.reviews
FOR ALL USING (public.is_admin(auth.uid()));
