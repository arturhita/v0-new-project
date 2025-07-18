-- =================================================================
-- 1. FIX CRITICO: CREAZIONE DELLA FUNZIONE is_admin()
-- Questa funzione è essenziale per tutte le policy di sicurezza.
-- =================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    is_admin_user boolean;
BEGIN
    -- Controlla se l'utente autenticato ha il ruolo 'admin' nella tabella profiles
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO is_admin_user;
    RETURN is_admin_user;
END;
$$;

-- =================================================================
-- 2. CREAZIONE TABELLE MANCANTI
-- Crea le tabelle che erano state omesse negli script precedenti.
-- L'uso di "IF NOT EXISTS" previene errori se eseguito più volte.
-- =================================================================

-- Tabella per i Ticket di Supporto
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, closed
    priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le Risposte ai Ticket
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Chi ha risposto (utente o admin)
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le Promozioni
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value NUMERIC NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- =================================================================
-- 3. APPLICAZIONE DELLE POLICY DI SICUREZZA (RLS)
-- Applica le regole di accesso corrette alle nuove tabelle.
-- =================================================================

-- Policy per i ticket di supporto
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage their own tickets" ON public.support_tickets
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can access all tickets" ON public.support_tickets;
CREATE POLICY "Admins can access all tickets" ON public.support_tickets
FOR ALL USING (public.is_admin());

-- Policy per le risposte ai ticket
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage replies for their tickets" ON public.ticket_replies;
CREATE POLICY "Users can manage replies for their tickets" ON public.ticket_replies
FOR ALL USING (
    (auth.uid() = user_id) OR
    (ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Admins can access all replies" ON public.ticket_replies;
CREATE POLICY "Admins can access all replies" ON public.ticket_replies
FOR ALL USING (public.is_admin());

-- Policy per le promozioni
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions" ON public.promotions
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
CREATE POLICY "Public can view active promotions" ON public.promotions
FOR SELECT USING (is_active = true AND start_date <= now() AND end_date >= now());
