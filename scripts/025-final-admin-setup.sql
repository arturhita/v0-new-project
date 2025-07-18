-- =================================================================
-- SCRIPT DI CONFIGURAZIONE DEFINITIVO PER FUNZIONALITÀ ADMIN
-- Versione: 1.0
-- Questo script è sicuro, idempotente e non distruttivo.
-- Risolve l'errore "get_my_claim does not exist" e sistema tutte le tabelle.
-- =================================================================

-- PARTE 1: FUNZIONI HELPER PER AUTENTICAZIONE E SICUREZZA (RLS)
-- -----------------------------------------------------------------

-- Funzione per estrarre un "claim" (es. ruolo) dal JWT dell'utente autenticato.
-- Risolve l'errore "function get_my_claim does not exist".
CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb;
$$;

-- Funzione per verificare se l'utente ha il ruolo di 'admin'.
-- Semplifica la scrittura delle policy di sicurezza.
CREATE OR REPLACE FUNCTION public.is_claims_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT get_my_claim('user_role') = '"admin"';
$$;


-- PARTE 2: CREAZIONE E AGGIORNAMENTO SICURO DELLE TABELLE
-- -----------------------------------------------------------------

-- Tabella: platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (id smallint PRIMARY KEY DEFAULT 1);
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS settings jsonb;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS company_details jsonb;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
INSERT INTO public.platform_settings(id, settings, company_details)
VALUES (1, '{"call_deduction_rate": 0.15, "base_commission_rate": 20.0}', '{"name": "La Tua Azienda", "address": "Via Roma 1, 00100 Roma", "vat_number": "IT12345678901"}')
ON CONFLICT (id) DO NOTHING;

-- Tabella: posts (Blog)
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text,
    author_id uuid REFERENCES auth.users(id),
    category text,
    tags text[],
    status text DEFAULT 'draft',
    published_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella: commission_requests
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(user_id),
    requested_rate numeric(5, 2) NOT NULL,
    reason text,
    status text DEFAULT 'pending',
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Tabella: invoices
CREATE TABLE IF NOT EXISTS public.invoices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now());
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES auth.users(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES public.profiles(user_id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount numeric(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_details jsonb;

-- Tabella: internal_messages
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    recipient_id uuid NOT NULL REFERENCES auth.users(id),
    subject text,
    body text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Tabella: newsletters
CREATE TABLE IF NOT EXISTS public.newsletters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    content text NOT NULL,
    sent_by uuid REFERENCES auth.users(id),
    status text DEFAULT 'draft',
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);


-- PARTE 3: ATTIVAZIONE E CONFIGURAZIONE DELLA SICUREZZA (RLS)
-- -----------------------------------------------------------------

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Policy per platform_settings
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings FOR ALL USING (public.is_claims_admin());

-- Policy per posts
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
CREATE POLICY "Public can read published posts" ON public.posts FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;
CREATE POLICY "Admins can manage all posts" ON public.posts FOR ALL USING (public.is_claims_admin());

-- Policy per invoices
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (public.is_claims_admin());
DROP POLICY IF EXISTS "Users can see their own invoices" ON public.invoices;
CREATE POLICY "Users can see their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- Policy per internal_messages
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.internal_messages;
CREATE POLICY "Users can manage their own messages" ON public.internal_messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Admins can monitor messages" ON public.internal_messages;
CREATE POLICY "Admins can monitor messages" ON public.internal_messages FOR SELECT USING (public.is_claims_admin());

-- Fine dello script
