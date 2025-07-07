-- ============================================================================
-- SCRIPT DI CORREZIONE DEFINITIVO v047
-- Corregge l'errore "cannot use subquery in trigger WHEN condition".
-- La logica di controllo del ruolo viene spostata DENTRO la funzione.
-- ============================================================================

-- 1. CORREZIONE TABELLA MESSAGES (se non già fatto)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='consultation_id') THEN
        ALTER TABLE public.messages
        ADD COLUMN consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- 2. GESTIONE MESSAGGI GRATUITI (LOGICA CORRETTA)
DROP FUNCTION IF EXISTS public.check_free_message_limit() CASCADE;
CREATE OR REPLACE FUNCTION public.check_free_message_limit()
RETURNS TRIGGER AS $$
DECLARE
    sender_role TEXT;
    message_count INTEGER;
    free_message_limit INTEGER := 5; -- Limite di messaggi gratuiti
BEGIN
    -- Controlla il ruolo del mittente. Se non è 'client', esci.
    SELECT role INTO sender_role FROM public.profiles WHERE id = NEW.sender_id;
    IF sender_role <> 'client' THEN
        RETURN NEW;
    END IF;

    -- Se il messaggio fa parte di un consulto a pagamento, esci.
    IF NEW.consultation_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Se le condizioni sopra non sono soddisfatte, allora è un messaggio gratuito
    -- da un cliente. Procedi con il conteggio.
    SELECT count(*)
    INTO message_count
    FROM public.messages
    WHERE sender_id = NEW.sender_id
      AND receiver_id = NEW.receiver_id
      AND consultation_id IS NULL;

    -- Se il conteggio supera il limite, solleva un'eccezione.
    IF message_count >= free_message_limit THEN
        RAISE EXCEPTION 'Limite di messaggi gratuiti raggiunto. Avvia un consulto per continuare.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica il trigger a ogni inserimento. La logica interna gestirà le condizioni.
CREATE TRIGGER enforce_free_message_limit
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION check_free_message_limit();

-- Il resto dello script rimane per consolidamento e verifica
-- 3. GESTIONE STORIE (CONSOLIDATO)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours'
);
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operatori possono gestire le proprie storie" ON public.stories FOR ALL USING (auth.uid() = operator_id) WITH CHECK (auth.uid() = operator_id);
CREATE POLICY "Le storie attive sono visibili a tutti" ON public.stories FOR SELECT USING (expires_at > now());

-- 4. GESTIONE GUADAGNI (CONSOLIDATO)
CREATE OR REPLACE FUNCTION public.get_operator_earnings_summary(p_operator_id UUID)
RETURNS TABLE(total_earnings NUMERIC, pending_payout NUMERIC, last_payout_amount NUMERIC, last_payout_date TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(e.net_earning), 0.00) AS total_earnings,
        COALESCE(SUM(e.net_earning) FILTER (WHERE e.payout_id IS NULL), 0.00) AS pending_payout,
        (SELECT pr.amount FROM public.payout_requests pr WHERE pr.operator_id = p_operator_id AND pr.status = 'completed' ORDER BY pr.completed_at DESC LIMIT 1) AS last_payout_amount,
        (SELECT pr.completed_at FROM public.payout_requests pr WHERE pr.operator_id = p_operator_id AND pr.status = 'completed' ORDER BY pr.completed_at DESC LIMIT 1) AS last_payout_date
    FROM public.earnings e
    WHERE e.operator_id = p_operator_id;
END;
$$;

-- 5. GESTIONE TABELLE FINANZIARIE (CONSOLIDATO)
CREATE TABLE IF NOT EXISTS public.operator_tax_details (
    operator_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT, vat_number TEXT, tax_id TEXT, address TEXT, city TEXT, zip_code TEXT, country TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), operator_id UUID NOT NULL REFERENCES public.profiles(id),
    current_commission_rate NUMERIC(5, 2) NOT NULL, requested_commission_rate NUMERIC(5, 2) NOT NULL,
    reason TEXT, status TEXT NOT NULL DEFAULT 'pending', admin_notes TEXT, rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ
);
