-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pulisce le vecchie funzioni e tabelle in modo sicuro
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.operator_applications CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =================================================================
-- TABELLA PROFILI (UTENTI, OPERATORI, ADMIN)
-- =================================================================
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    stage_name text UNIQUE,
    avatar_url text,
    phone text,
    bio text,
    role text NOT NULL DEFAULT 'client'::text,
    status text DEFAULT 'Attivo'::text, -- Attivo, Sospeso, In Attesa
    is_online boolean DEFAULT false,
    commission_rate numeric(5, 2),
    specialties text[],
    categories text[],
    availability jsonb,
    services jsonb,
    average_rating numeric(3, 2) DEFAULT 0.00,
    reviews_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA IMPOSTAZIONI PIATTAFORMA
-- =================================================================
CREATE TABLE public.platform_settings (
    id text PRIMARY KEY DEFAULT 'singleton',
    settings jsonb,
    company_details jsonb
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
-- Inserisci una riga di default se non esiste
INSERT INTO public.platform_settings (id, settings, company_details)
VALUES ('singleton', '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- =================================================================
-- TABELLA POST BLOG
-- =================================================================
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text,
    excerpt text,
    featured_image_url text,
    category text,
    tags text[],
    status text DEFAULT 'draft'::text, -- draft, published, scheduled
    published_at timestamp with time zone,
    seo_title text,
    seo_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA RECENSIONI
-- =================================================================
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating numeric(2, 1) NOT NULL,
    comment text,
    status text DEFAULT 'pending'::text, -- pending, approved, rejected
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA PROMOZIONI
-- =================================================================
CREATE TABLE public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    special_price numeric(10, 2) NOT NULL,
    original_price numeric(10, 2),
    discount_percentage numeric(5, 2),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    valid_days text[],
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA FATTURE
-- =================================================================
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount numeric(10, 2) NOT NULL,
    status text DEFAULT 'pending'::text, -- pending, paid, overdue
    due_date date,
    description text,
    generated_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA TICKET DI SUPPORTO
-- =================================================================
CREATE TABLE public.tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text NOT NULL,
    description text,
    status text DEFAULT 'Aperto'::text, -- Aperto, In Lavorazione, Risposto, Chiuso
    last_update timestamp with time zone DEFAULT now(),
    history jsonb[]
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- TABELLA NOTIFICHE
-- =================================================================
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null per tutti
    recipient_group text, -- 'all', 'users', 'operators'
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- FUNZIONI HELPER E TRIGGER
-- =================================================================

-- Funzione per creare un profilo quando un nuovo utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'client')::text,
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per handle_new_user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funzione per verificare se un utente è admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- POLICY DI SICUREZZA (RLS)
-- =================================================================

-- Profili: gli admin vedono tutto, gli utenti vedono il proprio
CREATE POLICY "Allow admin full access on profiles" ON public.profiles FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow user to view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow user to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow public read access to active operators" ON public.profiles FOR SELECT USING (role = 'operator' AND status = 'Attivo');

-- Impostazioni: solo admin
CREATE POLICY "Allow admin full access on platform_settings" ON public.platform_settings FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Blog: admin possono gestire, tutti possono leggere i post pubblicati
CREATE POLICY "Allow admin full access on posts" ON public.posts FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow public read access to published posts" ON public.posts FOR SELECT USING (status = 'published' AND published_at <= now());

-- Recensioni: admin gestiscono, utenti creano, tutti leggono quelle approvate
CREATE POLICY "Allow admin full access on reviews" ON public.reviews FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow users to create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Allow public read access to approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- Promozioni, Fatture, Ticket, Notifiche: solo admin
CREATE POLICY "Allow admin full access on promotions" ON public.promotions FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on invoices" ON public.invoices FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on tickets" ON public.tickets FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Allow admin full access on notifications" ON public.notifications FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- =================================================================
-- FUNZIONI RPC PER STATISTICHE
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(total_users bigint, total_operators bigint, total_revenue numeric, total_consultations bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.profiles WHERE role = 'client') AS total_users,
    (SELECT count(*) FROM public.profiles WHERE role = 'operator' AND status = 'Attivo') AS total_operators,
    (SELECT sum(amount) FROM public.invoices WHERE status = 'paid') AS total_revenue,
    (SELECT count(*) FROM public.reviews) AS total_consultations; -- Semplificazione, usare una tabella consulti in futuro
END;
$$ LANGUAGE plpgsql;
