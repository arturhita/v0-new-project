-- Abilita l'estensione per UUID se non è già abilitata
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella per tracciare i singoli consulti
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INT,
    cost NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    type TEXT NOT NULL, -- chat, call, video, written
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabella per tracciare i guadagni di ogni operatore per consulto
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    net_earning NUMERIC(10, 2) NOT NULL,
    payout_status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, paid
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_consultations_operator_id ON public.consultations(operator_id);
CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON public.consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_earnings_operator_id ON public.earnings(operator_id);

-- Funzione per aggiornare 'updated_at'
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare 'updated_at' sulla tabella consultations
DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Commenti per chiarezza
COMMENT ON TABLE public.consultations IS 'Registra ogni sessione di consulenza tra un cliente e un operatore.';
COMMENT ON TABLE public.earnings IS 'Traccia i guadagni di un operatore per ogni consulenza, al netto delle commissioni.';
