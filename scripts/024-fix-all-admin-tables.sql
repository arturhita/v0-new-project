-- Questo script è idempotente e sicuro. Può essere eseguito più volte.
-- Aggiunge tabelle e colonne solo se non esistono, senza cancellare dati.

-- 1. Tabella per le impostazioni della piattaforma
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id smallint PRIMARY KEY DEFAULT 1,
    settings jsonb,
    company_details jsonb,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT platform_settings_singleton CHECK (id = 1)
);

-- Aggiunge colonne se non esistono
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS settings jsonb;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS company_details jsonb;
ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Inserisce i dati di default solo se la riga non esiste
INSERT INTO public.platform_settings(id, settings, company_details)
VALUES (1, '{"call_deduction_rate": 0.15, "base_commission_rate": 20.0}', '{"name": "La Tua Azienda", "address": "Via Roma 1, 00100 Roma", "vat_number": "IT12345678901"}')
ON CONFLICT (id) DO NOTHING;


-- 2. Tabella per i post del blog
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text,
    author_id uuid REFERENCES auth.users(id),
    category text,
    tags text[],
    status text DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


-- 3. Tabella per le richieste di aumento commissione
CREATE TABLE IF NOT EXISTS public.commission_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id uuid NOT NULL REFERENCES public.profiles(user_id),
    requested_rate numeric(5, 2) NOT NULL,
    reason text,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now()
);


-- 4. Tabella per le fatture (corretta)
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now()
);

-- Aggiunge colonne alla tabella fatture se non esistono
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES auth.users(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES public.profiles(user_id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount numeric(10, 2) NOT NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'; -- 'draft', 'sent', 'paid', 'overdue'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_details jsonb;


-- 5. Tabella per i messaggi interni
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    recipient_id uuid NOT NULL REFERENCES auth.users(id),
    subject text,
    body text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);


-- 6. Tabella per le newsletter
CREATE TABLE IF NOT EXISTS public.newsletters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    content text NOT NULL,
    sent_by uuid REFERENCES auth.users(id),
    status text DEFAULT 'draft', -- 'draft', 'sending', 'sent'
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);


-- Abilita Row Level Security (RLS) per tutte le tabelle se non già fatto
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Policy di esempio: solo gli admin possono gestire le impostazioni
DROP POLICY IF EXISTS "Allow admin full access on platform_settings" ON public.platform_settings;
CREATE POLICY "Allow admin full access on platform_settings"
ON public.platform_settings
FOR ALL
USING (get_my_claim('user_role') = 'admin'::jsonb)
WITH CHECK (get_my_claim('user_role') = 'admin'::jsonb);

-- Policy di esempio: gli utenti possono leggere i post pubblicati
DROP POLICY IF EXISTS "Allow public read access for published posts" ON public.posts;
CREATE POLICY "Allow public read access for published posts"
ON public.posts
FOR SELECT
USING (status = 'published');

-- Policy di esempio: gli admin possono gestire tutti i post
DROP POLICY IF EXISTS "Allow admin full access on posts" ON public.posts;
CREATE POLICY "Allow admin full access on posts"
ON public.posts
FOR ALL
USING (get_my_claim('user_role') = 'admin'::jsonb)
WITH CHECK (get_my_claim('user_role') = 'admin'::jsonb);

-- Aggiungere qui altre policy per le altre tabelle secondo necessità...

-- Fine dello script
