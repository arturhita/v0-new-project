-- Abilita l'estensione per le funzioni di testo avanzate, se non già fatto
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";

-- =================================================================
-- 1. TABELLA IMPOSTAZIONI PIATTAFORMA (Punti 13, 14, 15)
-- Una singola riga per contenere tutte le impostazioni in un oggetto JSONB.
-- =================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id INT PRIMARY KEY DEFAULT 1,
    settings JSONB,
    CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Inizializza con valori di default se la tabella è vuota
INSERT INTO platform_settings (id, settings)
VALUES (1, '{
    "siteName": "Unveilly",
    "siteDescription": "Consulenza professionale al minuto",
    "supportEmail": "support@unveilly.com",
    "maintenanceMode": false,
    "privacyPolicy": "",
    "cookiePolicy": "",
    "termsConditions": "",
    "companyDetails": { "name": "", "vat": "", "address": "" },
    "analytics": { "googleId": "", "facebookPixel": "" }
}')
ON CONFLICT (id) DO NOTHING;


-- =================================================================
-- 2. TABELLA PROMOZIONI (Punto 5)
-- Per gestire le promozioni a livello di piattaforma.
-- =================================================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    special_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    valid_days TEXT[] NOT NULL, -- Es: '{"monday", "tuesday"}'
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- =================================================================
-- 3. TABELLE TICKET DI SUPPORTO (Punto 12)
-- =================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aperto', -- Aperto, In Lavorazione, Risposto, Chiuso
    priority TEXT DEFAULT 'Normale', -- Bassa, Normale, Alta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Chi ha risposto (admin o utente)
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Policy di accesso per i ticket
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tickets" ON support_tickets
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own replies" ON ticket_replies
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all tickets and replies" ON support_tickets
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can access all tickets and replies" ON ticket_replies
FOR ALL USING (public.is_admin());


-- =================================================================
-- 4. TABELLA NOTIFICHE (Punto 11)
-- Per il sistema di notifiche admin -> utenti/operatori
-- =================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_group TEXT, -- 'all', 'users', 'operators'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own notifications" ON notifications
FOR SELECT USING (auth.uid() = recipient_user_id);
CREATE POLICY "Admins can create notifications" ON notifications
FOR INSERT WITH CHECK (public.is_admin());


-- =================================================================
-- 5. TABELLA BLOG / POSTS (Punto 10)
-- Assicura che la tabella esista con tutte le colonne necessarie.
-- =================================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
    featured_image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    seo_title TEXT,
    seo_description TEXT
);

-- Policy per il blog
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON posts
FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "Admins can manage all posts" ON posts
FOR ALL USING (public.is_admin());


-- =================================================================
-- 6. FIX RELAZIONE FATTURE (Punto 7)
-- Aggiunge la Foreign Key corretta se non esiste.
-- =================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invoices_operator_id_fkey'
    ) THEN
        ALTER TABLE public.invoices 
        ADD CONSTRAINT invoices_operator_id_fkey 
        FOREIGN KEY (operator_id) 
        REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF;
END;
$$;


-- =================================================================
-- 7. FUNZIONE RPC PER STATISTICHE CRUSCOTTO REALI (Punto 1)
-- Sostituisce la vecchia funzione con una che calcola dati reali.
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM auth.users) as total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'Attivo') as total_operators,
        (SELECT COALESCE(sum(amount), 0) FROM public.wallet_transactions WHERE type = 'recharge') as total_revenue,
        (SELECT count(*) FROM public.consultations WHERE status = 'completed') as total_consultations;
END;
$$;

-- Concedi l'esecuzione agli admin
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
