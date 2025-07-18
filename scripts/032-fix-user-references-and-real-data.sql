-- =================================================================
-- 1. FIX CRITICO: RIMOZIONE VECCHI VINCOLI ERRATI
-- Rimuove i vincoli di chiave esterna che puntavano alla tabella inesistente "public.users".
-- Questo previene errori durante la creazione dei nuovi vincoli corretti.
-- =================================================================

-- Tentativo di rimozione del vincolo errato da support_tickets (ignora l'errore se non esiste)
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_user_id_fkey') THEN
      ALTER TABLE public.support_tickets DROP CONSTRAINT support_tickets_user_id_fkey;
   END IF;
END;
$$;

-- Tentativo di rimozione del vincolo errato da ticket_replies (ignora l'errore se non esiste)
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_replies_user_id_fkey') THEN
      ALTER TABLE public.ticket_replies DROP CONSTRAINT ticket_replies_user_id_fkey;
   END IF;
END;
$$;


-- =================================================================
-- 2. CREAZIONE E CORREZIONE TABELLE CON RIFERIMENTI CORRETTI
-- Assicura che tutte le tabelle necessarie esistano e che i riferimenti puntino a `auth.users(id)`.
-- =================================================================

-- Tabella per i profili utente (assicuriamoci che il riferimento sia corretto)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tabella per i Ticket di Supporto
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Chi ha risposto (utente o admin)
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le Transazioni (per visibilità pagamenti)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status TEXT NOT NULL, -- succeeded, pending, failed
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- 3. CREAZIONE DI UNA VIEW PER SEMPLIFICARE LE QUERY SUGLI UTENTI
-- Questa VIEW unisce auth.users e public.profiles per un accesso ai dati più semplice e sicuro.
-- =================================================================
CREATE OR REPLACE VIEW public.detailed_users AS
SELECT
    u.id AS user_id,
    u.email,
    u.last_sign_in_at,
    p.full_name,
    p.avatar_url,
    p.role,
    p.created_at AS profile_created_at
FROM
    auth.users u
JOIN
    public.profiles p ON u.id = p.user_id;


-- =================================================================
-- 4. APPLICAZIONE DELLE POLICY DI SICUREZZA (RLS)
-- Riapplica le policy per garantire che tutto sia sicuro dopo le modifiche.
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

-- Policy per le transazioni
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own transactions" ON public.transactions;
CREATE POLICY "Users can see their own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can see all transactions" ON public.transactions;
CREATE POLICY "Admins can see all transactions" ON public.transactions
FOR ALL USING (public.is_admin());

-- Policy per le recensioni (Punto 9)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.reviews;
CREATE POLICY "Users can manage their own reviews" ON public.reviews
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can see approved reviews" ON public.reviews;
CREATE POLICY "Public can see approved reviews" ON public.reviews
FOR SELECT USING (status = 'approved');
