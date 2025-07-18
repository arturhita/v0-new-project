-- #################################################
-- PASSO 1: RIPRISTINO IMMEDIATO DEGLI OPERATORI
-- Questo comando rende nuovamente visibili tutti gli operatori esistenti sul sito.
-- #################################################
UPDATE public.profiles
SET status = 'Attivo'
WHERE role = 'operator' AND (status IS NULL OR status = 'pending' OR status = 'active');


-- #################################################
-- PASSO 2: CORREZIONE E CONSOLIDAMENTO DELLO SCHEMA
-- Questo script è NON DISTRUTTIVO e corregge gli errori precedenti.
-- #################################################

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Funzione per la ricerca testuale senza accenti
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text AS
$func$
SELECT unaccent('unaccent', $1)
$func$  LANGUAGE sql IMMUTABLE;


-- TABELLA PROFILI (UTENTI E OPERATORI)
-- Assicura che la tabella esista e abbia tutte le colonne corrette senza perdere dati.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text DEFAULT 'client'::text,
    status text DEFAULT 'pending'::text, -- Es. 'Attivo', 'Sospeso', 'In Attesa'
    stage_name text,
    phone text,
    bio text,
    specialties text[],
    categories text[],
    services jsonb,
    availability jsonb,
    is_online boolean DEFAULT false,
    commission_rate numeric(5,2) DEFAULT 20.00,
    average_rating numeric(3,2) DEFAULT 0.00,
    reviews_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- Aggiungi colonne solo se non esistono
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'client'::text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stage_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS categories text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS services jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) DEFAULT 20.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger per aggiornare 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- TABELLE PER LE FUNZIONALITÀ ADMIN
CREATE TABLE IF NOT EXISTS public.operator_applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    bio text,
    specialties text[],
    categories text[],
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason text,
    submitted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    description text,
    discount_type text NOT NULL, -- 'percentage' or 'fixed'
    discount_value numeric(10, 2) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id bigserial PRIMARY KEY,
    operator_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, paid, overdue
    due_date date NOT NULL,
    paid_date date,
    description text,
    created_at timestamptz DEFAULT now()
);
-- Correzione relazione fatture (Punto 7)
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_operator_id_fkey,
  ADD CONSTRAINT invoices_operator_id_fkey
  FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    image_url text,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    status text DEFAULT 'draft', -- draft, published
    published_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id bigserial PRIMARY KEY,
    recipient_type text NOT NULL, -- 'all', 'clients', 'operators'
    title text NOT NULL,
    message text NOT NULL,
    sent_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'open', -- open, in_progress, closed
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- CORREZIONE ERRORE DI BATTITURA
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id bigserial PRIMARY KEY,
    ticket_id bigint NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id text PRIMARY KEY, -- es. 'companyDetails', 'legal'
    settings jsonb
);

-- FUNZIONI RPC REALI
CREATE OR REPLACE FUNCTION public.approve_operator(p_application_id uuid)
RETURNS void AS $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT user_id INTO v_user_id FROM public.operator_applications WHERE id = p_application_id AND status = 'pending';
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Application not found or not pending'; END IF;
    UPDATE public.profiles SET role = 'operator', status = 'Attivo' WHERE id = v_user_id;
    UPDATE public.operator_applications SET status = 'approved' WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, pending_approvals bigint, pending_reviews bigint, open_tickets bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM public.profiles WHERE role = 'client') AS total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'Attivo') AS total_operators,
        (SELECT COALESCE(sum(amount), 0) FROM public.invoices WHERE status = 'paid') AS total_revenue,
        (SELECT count(*) FROM public.operator_applications WHERE status = 'pending') AS pending_approvals,
        (SELECT count(*) FROM public.reviews WHERE status = 'pending') AS pending_reviews,
        (SELECT count(*) FROM public.support_tickets WHERE status = 'open') AS open_tickets;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_operator_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating numeric;
    review_count int;
BEGIN
    SELECT AVG(rating), COUNT(*) INTO avg_rating, review_count
    FROM public.reviews WHERE operator_id = NEW.operator_id AND status = 'approved';
    UPDATE public.profiles SET average_rating = COALESCE(avg_rating, 0), reviews_count = COALESCE(review_count, 0)
    WHERE id = NEW.operator_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_operator_rating();

-- Policy per lo storage delle immagini del blog
DROP POLICY IF EXISTS "Blog Images Select" ON storage.objects;
CREATE POLICY "Blog Images Select" ON storage.objects FOR SELECT USING (bucket_id = 'blog_images');
DROP POLICY IF EXISTS "Blog Images Insert" ON storage.objects;
CREATE POLICY "Blog Images Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog_images' AND auth.role() = 'authenticated');
