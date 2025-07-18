-- Questo è lo script SQL definitivo, progettato per essere eseguito senza errori.
-- Risolve i problemi di RLS, tabelle mancanti e colonne mancanti.

-- Step 1: Assicura che le tabelle necessarie esistano.
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission NUMERIC(5, 2) NOT NULL,
    requested_commission NUMERIC(5, 2) NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT
);

-- Se la tabella payout_requests non esiste, la crea.
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_details JSONB
);

-- Step 2: Assicura che le colonne necessarie esistano.
ALTER TABLE public.advanced_settings ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Step 3: Abilita RLS sulle tabelle prima di creare le policy.
-- QUESTA È LA CORREZIONE CHIAVE PER L'ERRORE "syntax error at or near 'POLICY'".
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Crea o sostituisce le policy di sicurezza.
CREATE OR REPLACE POLICY "Admins can manage all commission requests" ON public.commission_increase_requests
    FOR ALL
    USING (public.is_admin());

CREATE OR REPLACE POLICY "Operators can view their own commission requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = operator_id);

CREATE OR REPLACE POLICY "Operators can create commission requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = operator_id);

CREATE OR REPLACE POLICY "Admins can manage all payout requests" ON public.payout_requests
    FOR ALL
    USING (public.is_admin());

CREATE OR REPLACE POLICY "Operators can view their own payout requests" ON public.payout_requests
    FOR SELECT
    USING (auth.uid() = operator_id);

-- Step 5: Inserisce o aggiorna le impostazioni finanziarie in modo sicuro.
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('platform_commission_rate', '20', 'Commissione standard della piattaforma (in percentuale)', 'financial'),
    ('call_forwarding_fee_client', '0.15', 'Costo al minuto per il trasferimento di chiamata addebitato al cliente', 'financial'),
    ('call_forwarding_fee_operator', '0.05', 'Costo al minuto per il trasferimento di chiamata addebitato all''operatore', 'financial'),
    ('payout_processing_fee', '2.50', 'Costo fisso per l''elaborazione di una richiesta di pagamento', 'financial')
ON CONFLICT (key) DO UPDATE
SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    type = EXCLUDED.type;
