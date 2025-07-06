-- Tabella per gestire i consulti scritti (epistolari)
CREATE TABLE public.written_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    operator_id UUID NOT NULL REFERENCES public.profiles(id),
    question TEXT NOT NULL,
    answer TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, answered, rejected
    price_at_request NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    answered_at TIMESTAMPTZ,
    CONSTRAINT check_status CHECK (status IN ('pending', 'answered', 'rejected'))
);

-- Abilita Row Level Security
ALTER TABLE public.written_consultations ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere i propri consulti
CREATE POLICY "Users can view their own written consultations"
ON public.written_consultations FOR SELECT
USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- Policy: I clienti possono creare nuovi consulti
CREATE POLICY "Clients can create written consultations"
ON public.written_consultations FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Policy: Gli operatori possono aggiornare i consulti (per aggiungere una risposta)
CREATE POLICY "Operators can update their written consultations to answer"
ON public.written_consultations FOR UPDATE
USING (auth.uid() = operator_id)
WITH CHECK (status = 'answered');
