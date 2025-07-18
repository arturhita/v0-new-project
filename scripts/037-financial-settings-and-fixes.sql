-- Inserisce le impostazioni finanziarie di default se non esistono.
-- Questo centralizza la gestione delle commissioni e delle tariffe.
INSERT INTO public.advanced_settings (key, value, description, type)
VALUES
    ('financials', '{"platform_commission_percentage": 20, "call_transfer_fee_client": 0.50, "call_transfer_fee_operator": 0.25}', 'Impostazioni finanziarie globali (commissione piattaforma, tariffe trasferimento chiamata)', 'json')
ON CONFLICT (key) DO NOTHING;

-- Crea la tabella per le richieste di aumento commissione da parte degli operatori.
CREATE TABLE IF NOT EXISTS public.commission_increase_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_commission real NOT NULL,
    requested_commission real NOT NULL,
    reason text,
    status text DEFAULT 'pending'::text NOT NULL, -- pending, approved, rejected
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    admin_notes text
);

-- Abilita RLS (Row Level Security) per la nuova tabella
ALTER TABLE public.commission_increase_requests ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli admin di gestire le richieste
CREATE POLICY "Admin can manage commission requests" ON public.commission_increase_requests
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- Policy per permettere agli operatori di vedere le proprie richieste
CREATE POLICY "Operators can view their own requests" ON public.commission_increase_requests
    FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = operator_id));

-- Policy per permettere agli operatori di creare richieste
CREATE POLICY "Operators can create requests" ON public.commission_increase_requests
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = operator_id));

-- Commento per verifica: L'errore "Could not find a relationship between 'payout_requests' and 'profiles'"
-- è spesso legato alla cache dello schema di Supabase. Lo script 036 ha già definito la FK corretta.
-- Se l'errore persiste dopo aver eseguito questo script, ricaricare lo schema in Supabase (Admin API -> Reload Schema)
-- o modificare la query in `payouts.actions.ts` come fallback (che faremo nel codice).
