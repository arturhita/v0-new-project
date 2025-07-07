-- ============================================================================
-- Script 044: Aggiunge la funzionalità Storie e corregge il calcolo dei guadagni
-- ============================================================================

-- Step 1: Creare lo spazio di archiviazione (Bucket) per le storie
-- Assicuriamoci che le policy permettano agli operatori di caricare e al pubblico di leggere.
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Story Images/Videos Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'stories');
CREATE POLICY "Story Images/Videos Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stories');
CREATE POLICY "Story Images/Videos Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'stories');
CREATE POLICY "Story Images/Videos Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'stories');


-- Step 2: Creare la tabella per le storie
CREATE TABLE IF NOT EXISTS public.stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    media_type text NOT NULL DEFAULT 'image', -- 'image' or 'video'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read stories" ON public.stories FOR SELECT USING (expires_at > now());
CREATE POLICY "Operators can manage their own stories" ON public.stories FOR ALL USING (auth.uid() = operator_id);
CREATE POLICY "Admin can manage all stories" ON public.stories FOR ALL USING (is_admin());


-- Step 3: Creare una funzione SQL robusta per i dati finanziari dell'operatore
-- Questo migliora le performance e la correttezza dei calcoli per la pagina "Guadagni".
CREATE OR REPLACE FUNCTION get_operator_financials(p_operator_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_earned numeric;
    v_total_withdrawn numeric;
    v_balance numeric;
    v_transactions json;
BEGIN
    -- Calcola guadagni totali
    SELECT COALESCE(SUM(net_earning), 0)
    INTO v_total_earned
    FROM public.earnings
    WHERE operator_id = p_operator_id;

    -- Calcola ritirato totale
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_withdrawn
    FROM public.payout_requests
    WHERE operator_id = p_operator_id AND status = 'completed';

    -- Calcola saldo
    v_balance := v_total_earned - v_total_withdrawn;

    -- Aggrega transazioni
    SELECT json_agg(t)
    INTO v_transactions
    FROM (
        SELECT
            id,
            created_at,
            'earning' as type,
            'Guadagno da consulto' as description,
            net_earning as amount
        FROM public.earnings
        WHERE operator_id = p_operator_id
        UNION ALL
        SELECT
            id,
            processed_at as created_at,
            'payout' as type,
            'Pagamento richiesto' as description,
            amount
        FROM public.payout_requests
        WHERE operator_id = p_operator_id AND status = 'completed'
        ORDER BY created_at DESC
    ) t;

    RETURN json_build_object(
        'balance', v_balance,
        'total_earned', v_total_earned,
        'total_withdrawn', v_total_withdrawn,
        'transactions', COALESCE(v_transactions, '[]'::json)
    );
END;
$$;

-- Step 4: Aggiungere un campo per l'URL dell'avatar alla tabella profiles se non esiste
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
