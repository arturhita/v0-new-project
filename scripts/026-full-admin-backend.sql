-- Questo script è progettato per essere eseguito in sicurezza più volte.
-- Aggiunge tabelle e colonne solo se non esistono già.

-- 1. Tabella per le richieste di modifica commissione
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    current_rate NUMERIC(5, 2) NOT NULL,
    requested_rate NUMERIC(5, 2) NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES public.profiles(user_id)
);

-- 2. Tabella per le richieste di pagamento (payout)
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, paid, rejected
    payment_details JSONB, -- Es. { "method": "PayPal", "email": "..." } o { "method": "IBAN", "value": "..." }
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- 3. Tabella per le consulenze (fondamentale per fatture e pagamenti)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- 'chat', 'call', 'email'
    duration_minutes INTEGER,
    cost NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    operator_earning NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed', -- completed, refunded
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- Abilita Row Level Security per le nuove tabelle
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Policy di sicurezza: solo gli admin possono gestire queste tabelle
DROP POLICY IF EXISTS "Allow admin full access on commission_requests" ON public.commission_requests;
CREATE POLICY "Allow admin full access on commission_requests"
    ON public.commission_requests FOR ALL
    TO authenticated
    USING (is_claims_admin())
    WITH CHECK (is_claims_admin());

DROP POLICY IF EXISTS "Allow admin full access on payout_requests" ON public.payout_requests;
CREATE POLICY "Allow admin full access on payout_requests"
    ON public.payout_requests FOR ALL
    TO authenticated
    USING (is_claims_admin())
    WITH CHECK (is_claims_admin());

DROP POLICY IF EXISTS "Allow admin read access on consultations" ON public.consultations;
CREATE POLICY "Allow admin read access on consultations"
    ON public.consultations FOR SELECT
    TO authenticated
    USING (is_claims_admin());

-- Funzione per calcolare le statistiche della dashboard admin
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    total_users BIGINT;
    total_operators BIGINT;
    total_revenue NUMERIC;
    total_consultations BIGINT;
BEGIN
    SELECT count(*) INTO total_users FROM auth.users;
    SELECT count(*) INTO total_operators FROM public.profiles WHERE role = 'operator';
    SELECT COALESCE(sum(cost), 0) INTO total_revenue FROM public.consultations;
    SELECT count(*) INTO total_consultations FROM public.consultations;

    RETURN jsonb_build_object(
        'totalUsers', total_users,
        'totalOperators', total_operators,
        'totalRevenue', total_revenue,
        'totalConsultations', total_consultations
    );
END;
$$ LANGUAGE plpgsql;

-- Aggiungiamo dati di esempio per le consulenze per testare le statistiche
-- Inserisci solo se la tabella è vuota per evitare duplicati
DO $$
DECLARE
    client_user_id UUID;
    operator_user_id UUID;
BEGIN
    -- Trova un utente cliente e un operatore
    SELECT id INTO client_user_id FROM public.profiles WHERE role = 'client' LIMIT 1;
    SELECT user_id INTO operator_user_id FROM public.profiles WHERE role = 'operator' LIMIT 1;

    -- Se esistono entrambi, e non ci sono consulenze, inserisci dati di esempio
    IF client_user_id IS NOT NULL AND operator_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.consultations) THEN
        INSERT INTO public.consultations (client_id, operator_id, service_type, duration_minutes, cost, platform_fee, operator_earning, status)
        VALUES
            (client_user_id, operator_user_id, 'chat', 20, 40.00, 8.00, 32.00, 'completed'),
            (client_user_id, operator_user_id, 'call', 15, 45.00, 9.00, 36.00, 'completed');
    END IF;
END $$;
