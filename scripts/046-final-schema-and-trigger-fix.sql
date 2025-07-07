-- ============================================================================
-- SCRIPT DI CORREZIONE DEFINITIVO
-- Questo script corregge l'errore "column new.consultation_id does not exist"
-- e consolida tutte le correzioni necessarie per la dashboard operatore.
-- 1. Aggiunge la colonna `consultation_id` alla tabella `messages`.
-- 2. Ricrea la funzione e il trigger `check_free_message_limit` in modo corretto.
-- 3. Consolida le definizioni per `stories`, `earnings`, e tabelle finanziarie.
-- ESEGUIRE QUESTO SCRIPT PER RISOLVERE L'ERRORE E STABILIZZARE IL DATABASE.
-- ============================================================================

-- 1. CORREZIONE TABELLA MESSAGES
-- Aggiunge la colonna `consultation_id` se non esiste, collegandola a `consultations`.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='consultation_id') THEN
        ALTER TABLE public.messages
        ADD COLUMN consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- 2. GESTIONE MESSAGGI GRATUITI (CORRETTA)
-- Ricrea la funzione e il trigger con la logica corretta
DROP FUNCTION IF EXISTS public.check_free_message_limit();
CREATE OR REPLACE FUNCTION public.check_free_message_limit()
RETURNS TRIGGER AS $$
DECLARE
    message_count INTEGER;
    free_message_limit INTEGER := 5; -- Limite di messaggi gratuiti
BEGIN
    -- Conta solo i messaggi inviati dal cliente (sender) all'operatore (receiver)
    -- che non fanno parte di una consultazione a pagamento.
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

-- Applica il trigger solo ai messaggi gratuiti da cliente a operatore
DROP TRIGGER IF EXISTS enforce_free_message_limit ON public.messages;
CREATE TRIGGER enforce_free_message_limit
BEFORE INSERT ON public.messages
FOR EACH ROW
-- Esegui il trigger solo se il messaggio è da un cliente a un operatore e non fa parte di un consulto
WHEN (NEW.consultation_id IS NULL AND (SELECT role FROM public.profiles WHERE id = NEW.sender_id) = 'client')
EXECUTE FUNCTION check_free_message_limit();


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
DROP POLICY IF EXISTS "Operatori possono gestire le proprie storie" ON public.stories;
CREATE POLICY "Operatori possono gestire le proprie storie" ON public.stories FOR ALL USING (auth.uid() = operator_id) WITH CHECK (auth.uid() = operator_id);
DROP POLICY IF EXISTS "Le storie attive sono visibili a tutti" ON public.stories;
CREATE POLICY "Le storie attive sono visibili a tutti" ON public.stories FOR SELECT USING (expires_at > now());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stories', 'stories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- 4. GESTIONE GUADAGNI (CONSOLIDATO)
DROP FUNCTION IF EXISTS public.get_operator_earnings_summary(uuid);
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
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), operator_id UUID REFERENCES public.profiles(id), payout_id UUID REFERENCES public.payout_requests(id),
    invoice_number TEXT UNIQUE NOT NULL, issue_date DATE NOT NULL, due_date DATE, amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'issued', pdf_url TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), operator_id UUID NOT NULL REFERENCES public.profiles(id),
    current_commission_rate NUMERIC(5, 2) NOT NULL, requested_commission_rate NUMERIC(5, 2) NOT NULL,
    reason TEXT, status TEXT NOT NULL DEFAULT 'pending', admin_notes TEXT, rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ
);

-- 6. AGGIUNTA COLONNA IMMAGINE PROFILO (CONSOLIDATO)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_image_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_image_url TEXT;
    END IF;
END
$$;
