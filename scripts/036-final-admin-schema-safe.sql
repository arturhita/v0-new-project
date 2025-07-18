-- Questo script è SICURO e NON DISTRUTTIVO.
-- Utilizza "IF NOT EXISTS" e "CREATE OR REPLACE" per evitare errori e perdite di dati.

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Correzione del tipo di stato per i profili
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE public.profile_status AS ENUM ('pending', 'Attivo', 'Sospeso', 'In Attesa');
    END IF;
END$$;

-- Aggiorna la tabella PROFILES in modo non distruttivo
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS full_name text,
    ADD COLUMN IF NOT EXISTS stage_name text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS bio text,
    ADD COLUMN IF NOT EXISTS specialties text[],
    ADD COLUMN IF NOT EXISTS categories text[],
    ADD COLUMN IF NOT EXISTS services jsonb,
    ADD COLUMN IF NOT EXISTS availability jsonb,
    ADD COLUMN IF NOT EXISTS commission_rate numeric(5, 2) DEFAULT 15.00,
    ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS average_rating numeric(3, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;

-- Aggiunge la colonna status se non esiste, usando il nuovo tipo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status public.profile_status DEFAULT 'pending';
    END IF;
END$$;

-- Tabella per le candidature degli operatori
CREATE TABLE IF NOT EXISTS public.operator_applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    surname text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    bio text,
    categories text[],
    specialties text[],
    status text DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella per le recensioni
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    status text DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamptz DEFAULT now()
);

-- Tabella per le promozioni
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    description text,
    discount_type text NOT NULL, -- 'percentage' or 'fixed'
    discount_value numeric NOT NULL,
    start_date timestamptz,
    end_date timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le fatture (con la relazione corretta)
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id uuid NOT NULL REFERENCES public.profiles(id),
    amount numeric NOT NULL,
    status text NOT NULL, -- 'paid', 'unpaid'
    due_date date,
    invoice_period_start date,
    invoice_period_end date,
    created_at timestamptz DEFAULT now()
);

-- Tabella per i post del blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    content text,
    category text,
    image_url text,
    status text DEFAULT 'draft', -- 'draft', 'published'
    published_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le notifiche
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type text, -- 'all', 'clients', 'operators'
    title text NOT NULL,
    message text NOT NULL,
    sent_at timestamptz DEFAULT now()
);

-- Tabella per i ticket di supporto
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open', -- 'open', 'closed'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabella per le impostazioni della piattaforma (key-value)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id text PRIMARY KEY,
    settings jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Bucket per le immagini del blog
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog_images', 'blog_images', true)
ON CONFLICT (id) DO NOTHING;

-- Funzioni RPC per il backend
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, pending_approvals bigint, pending_reviews bigint, open_tickets bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM public.profiles WHERE role = 'client') AS total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator') AS total_operators,
        (SELECT sum(amount) FROM public.invoices WHERE status = 'paid') AS total_revenue,
        (SELECT count(*) FROM public.operator_applications WHERE status = 'pending') AS pending_approvals,
        (SELECT count(*) FROM public.reviews WHERE status = 'pending') AS pending_reviews,
        (SELECT count(*) FROM public.support_tickets WHERE status = 'open') AS open_tickets;
END;
$$ LANGUAGE plpgsql;

-- Funzione per approvare un operatore
CREATE OR REPLACE FUNCTION public.approve_operator(p_application_id uuid)
RETURNS void AS $$
DECLARE
    app_data public.operator_applications;
BEGIN
    -- Get application data
    SELECT * INTO app_data FROM public.operator_applications WHERE id = p_application_id;

    -- Update profile status
    UPDATE public.profiles
    SET status = 'Attivo'
    WHERE id = app_data.user_id;

    -- Update application status
    UPDATE public.operator_applications
    SET status = 'approved'
    WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- **IMPORTANTE**: Ripristina lo stato degli operatori esistenti ad 'Attivo'
-- Questo comando è sicuro e risolve il problema degli operatori "scomparsi".
UPDATE public.profiles
SET status = 'Attivo'
WHERE role = 'operator' AND status IS DISTINCT FROM 'Attivo';
