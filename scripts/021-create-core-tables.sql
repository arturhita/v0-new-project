-- =================================================================
-- SCRIPT 021: CREAZIONE TABELLE FONDAMENTALI
-- =================================================================
-- Questo script crea le tabelle mancanti che sono essenziali per
-- il funzionamento della piattaforma, come indicato dagli errori
-- nella dashboard di amministrazione.
-- Eseguire questo script una sola volta.
-- =================================================================

-- Estensione per generare UUID, se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella per le candidature degli operatori
CREATE TABLE IF NOT EXISTS public.operator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    application_data JSONB, -- Dati del form di candidatura
    notes TEXT, -- Note dell'amministratore
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli admin possono gestire le candidature" ON public.operator_applications FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
COMMENT ON TABLE public.operator_applications IS 'Registra le richieste per diventare operatore.';

-- Tabella per i servizi offerti dagli operatori
CREATE TABLE IF NOT EXISTS public.operator_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('chat', 'call', 'video_call', 'written_consultation')),
    price_per_minute NUMERIC(10, 2), -- Prezzo al minuto per servizi in tempo reale
    flat_rate NUMERIC(10, 2), -- Prezzo fisso per consulti scritti, etc.
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.operator_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutti possono vedere i servizi" ON public.operator_services FOR SELECT USING (true);
CREATE POLICY "Gli operatori possono gestire i propri servizi" ON public.operator_services FOR ALL USING (auth.uid() = operator_id);
COMMENT ON TABLE public.operator_services IS 'Servizi specifici offerti da ciascun operatore con i relativi prezzi.';


-- Tabella per le transazioni del portafoglio
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'bonus')),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    stripe_payment_intent_id TEXT UNIQUE, -- Per idempotenza con Stripe
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gli utenti possono vedere le proprie transazioni" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gli admin possono vedere tutte le transazioni" ON public.transactions FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
COMMENT ON TABLE public.transactions IS 'Cronologia di tutte le transazioni finanziarie (depositi, pagamenti, etc).';


-- Tabella per le consultazioni
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.operator_services(id),
    status TEXT NOT NULL CHECK (status IN ('requested', 'scheduled', 'ongoing', 'completed', 'cancelled_by_client', 'cancelled_by_operator', 'failed')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INT,
    cost NUMERIC(10, 2),
    recording_url TEXT,
    chat_log JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utenti e operatori possono vedere i propri consulti" ON public.consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
COMMENT ON TABLE public.consultations IS 'Registra ogni sessione di consulenza tra un cliente e un operatore.';


-- Tabella per le recensioni
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_votes INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutti possono vedere le recensioni approvate" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "I clienti possono creare recensioni" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Gli admin possono moderare le recensioni" ON public.reviews FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
COMMENT ON TABLE public.reviews IS 'Recensioni lasciate dai clienti per gli operatori dopo un consulto.';

-- Aggiungo la colonna wallet_balance a profiles se non esiste, necessaria per le transazioni
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
