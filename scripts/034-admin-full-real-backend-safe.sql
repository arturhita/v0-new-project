-- Questo script è NON DISTRUTTIVO. Utilizza "IF NOT EXISTS" per evitare errori e perdite di dati.
-- È sicuro da eseguire più volte.

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Funzione per la ricerca testuale senza accenti
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text AS
$func$
SELECT unaccent('unaccent', $1)
$func$  LANGUAGE sql IMMUTABLE;


-- #################################################
-- TABELLA PROFILI (UTENTI E OPERATORI) - Assicuriamoci che esista e abbia le colonne giuste
-- #################################################
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text DEFAULT 'client'::text,
    status text DEFAULT 'pending'::text,
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
-- Aggiungi colonne se non esistono, senza cancellare dati
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


-- #################################################
-- TABELLE PER LE FUNZIONALITÀ ADMIN
-- #################################################

-- Tabella per le candidature degli operatori (Punto 2)
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

-- Tabella per le promozioni (Punto 5)
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    special_price numeric(10, 2) NOT NULL,
    original_price numeric(10, 2) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    valid_days text[], -- E.g., ['monday', 'tuesday']
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Tabella per le fatture (Punto 7)
CREATE TABLE IF NOT EXISTS public.invoices (
    id bigserial PRIMARY KEY,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, paid, overdue
    due_date date NOT NULL,
    paid_date date,
    description text,
    created_at timestamptz DEFAULT now()
);
-- Aggiungi la relazione se non esiste
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_operator_id_fkey,
  ADD CONSTRAINT invoices_operator_id_fkey
  FOREIGN KEY (operator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- Tabella per le recensioni (Punto 9)
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamptz DEFAULT now()
);

-- Tabella per il blog (Punto 10)
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
-- Abilita RLS per il bucket di storage del blog
CREATE POLICY "Blog Images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'blog_images');
CREATE POLICY "Anyone can upload a blog image." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog_images');


-- Tabella per le notifiche (Punto 11)
CREATE TABLE IF NOT EXISTS public.notifications (
    id bigserial PRIMARY KEY,
    recipient_type text NOT NULL, -- 'all', 'users', 'operators'
    title text NOT NULL,
    message text NOT NULL,
    sent_at timestamptz DEFAULT now()
);

-- Tabella per i ticket di supporto (Punto 12)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'open', -- open, in_progress, closed
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id bigserial PRIMARY KEY,
    ticket_id bigint NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamtptz DEFAULT now()
);

-- Tabella per le impostazioni della piattaforma (Punti 13, 14, 15)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id text PRIMARY KEY DEFAULT 'singleton',
    settings jsonb
);
-- Inserisci una riga di default se non esiste
INSERT INTO public.platform_settings (id, settings)
VALUES ('singleton', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- #################################################
-- FUNZIONI RPC PER LOGICA COMPLESSA
-- #################################################

-- Funzione per approvare una candidatura (Punto 2)
CREATE OR REPLACE FUNCTION public.approve_operator(p_application_id uuid)
RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_full_name text;
    v_phone text;
    v_bio text;
    v_specialties text[];
    v_categories text[];
BEGIN
    -- 1. Trova la candidatura e l'utente associato
    SELECT user_id, email, full_name, phone, bio, specialties, categories
    INTO v_user_id, v_email, v_full_name, v_phone, v_bio, v_specialties, v_categories
    FROM public.operator_applications
    WHERE id = p_application_id AND status = 'pending';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Application not found or not pending';
    END IF;

    -- 2. Aggiorna il profilo dell'utente per renderlo un operatore attivo
    UPDATE public.profiles
    SET
        role = 'operator',
        status = 'active',
        full_name = v_full_name,
        stage_name = v_full_name, -- Default stage name
        phone = v_phone,
        bio = v_bio,
        specialties = v_specialties,
        categories = v_categories,
        updated_at = now()
    WHERE id = v_user_id;

    -- 3. Aggiorna lo stato della candidatura
    UPDATE public.operator_applications
    SET status = 'approved'
    WHERE id = p_application_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Funzione per le statistiche del cruscotto (Punti 1, 8)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, pending_approvals bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM public.profiles WHERE role = 'client') AS total_users,
        (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'active') AS total_operators,
        (SELECT COALESCE(sum(amount), 0) FROM public.invoices WHERE status = 'paid') AS total_revenue,
        (SELECT count(*) FROM public.operator_applications WHERE status = 'pending') AS pending_approvals;
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare le recensioni (Punto 9)
CREATE OR REPLACE FUNCTION public.update_operator_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating numeric;
    review_count int;
BEGIN
    SELECT
        AVG(rating),
        COUNT(*)
    INTO
        avg_rating,
        review_count
    FROM public.reviews
    WHERE operator_id = NEW.operator_id AND status = 'approved';

    UPDATE public.profiles
    SET
        average_rating = COALESCE(avg_rating, 0),
        reviews_count = COALESCE(review_count, 0)
    WHERE id = NEW.operator_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_operator_rating();

-- Abilita RLS e crea policy di base (importante per la sicurezza)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews." ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ... Aggiungere altre policy RLS per le nuove tabelle secondo necessità ...

-- Fine dello script
