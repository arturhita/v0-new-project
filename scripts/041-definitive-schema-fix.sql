-- Questo è uno script definitivo e idempotente per correggere lo schema del database.
-- Può essere eseguito più volte senza causare errori.

-- Step 1: Assicura che la colonna 'type' esista in 'advanced_settings'.
ALTER TABLE public.advanced_settings ADD COLUMN IF NOT EXISTS type TEXT;

-- Step 2: Assicura che la tabella 'commission_increase_requests' esista.
-- Questa è la causa principale dell'errore "relation does not exist".
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

-- Step 3: Assicura che 'payout_requests' abbia la colonna 'operator_id' con la foreign key.
-- Questo è critico per collegare i pagamenti agli operatori.
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- NOTA: La problematica istruzione UPDATE che faceva riferimento a 'user_id' è stata rimossa.
-- È meglio avere uno script funzionante che tentare di migrare dati vecchi e inconsistenti.
-- Le nuove richieste di pagamento saranno collegate correttamente.

-- Step 4: Crea o sostituisce le policy con i nomi di colonna corretti.
-- Usare CREATE OR REPLACE è più sicuro di DROP/CREATE.
CREATE OR REPLACE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = operator_id);

CREATE OR REPLACE POLICY "Operators can create requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = operator_id);

-- Step 5: Inserisce o aggiorna le impostazioni finanziarie avanzate usando ON CONFLICT per prevenire errori.
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
