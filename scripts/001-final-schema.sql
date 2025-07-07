-- Abilita l'estensione pgcrypto se non è già abilitata
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Funzione per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enum per i ruoli utente
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');

-- Enum per lo stato dell'operatore
CREATE TYPE public.operator_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Enum per lo stato della disponibilità
CREATE TYPE public.availability_status AS ENUM ('available', 'unavailable', 'on_break');

-- Enum per lo stato della consultazione
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected');

-- Enum per il tipo di consultazione
CREATE TYPE public.consultation_type AS ENUM ('chat', 'call', 'video', 'written');

-- Enum per lo stato del ticket di supporto
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'closed');

-- Enum per lo stato della transazione
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Enum per il tipo di transazione
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'commission');

-- Enum per lo stato della richiesta di commissione
CREATE TYPE public.commission_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Enum per lo stato della richiesta di candidatura
CREATE TYPE public.application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');


-- Tabella PROFILES
-- Memorizza i dati pubblici degli utenti, collegati a auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Funzione per creare un profilo quando un nuovo utente si registra in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role public.user_role;
BEGIN
  -- Default to 'client' if role is not specified or invalid in metadata
  BEGIN
    user_role := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'client';
  END;

  INSERT INTO public.profiles (id, name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    user_role,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che chiama handle_new_user dopo la creazione di un utente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Tabella OPERATOR_DETAILS
-- Dettagli specifici per gli operatori
CREATE TABLE public.operator_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT,
    specializations TEXT[],
    experience_years INT,
    status public.operator_status NOT NULL DEFAULT 'pending',
    availability_status public.availability_status NOT NULL DEFAULT 'unavailable',
    rating NUMERIC(3, 2) DEFAULT 0.00,
    per_minute_rate NUMERIC(10, 2),
    phone_number TEXT,
    tax_info JSONB,
    total_earnings NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own details." ON public.operator_details FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin can manage all operator details." ON public.operator_details FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Public can view approved operator details." ON public.operator_details FOR SELECT USING (status = 'approved');
CREATE TRIGGER on_operator_details_updated
  BEFORE UPDATE ON public.operator_details
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella SERVICES
-- Servizi offerti dagli operatori
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operator_details(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT,
    type public.consultation_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = operator_id AND auth.uid() = profiles.id));
CREATE POLICY "Public can view services." ON public.services FOR SELECT USING (true);
CREATE TRIGGER on_services_updated
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella AVAILABILITY
-- Orari di disponibilità degli operatori
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operator_details(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own availability." ON public.availability FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = operator_id AND auth.uid() = profiles.id));
CREATE POLICY "Public can view availability." ON public.availability FOR SELECT USING (true);


-- Tabella CONSULTATIONS
-- Traccia tutte le consultazioni
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.operator_details(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    status public.consultation_status NOT NULL DEFAULT 'requested',
    type public.consultation_type NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    price_per_minute NUMERIC(10, 2),
    total_cost NUMERIC(10, 2),
    recording_url TEXT,
    chat_history JSONB,
    written_consultation_details JSONB, -- Per domande, risposte, ecc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own consultations." ON public.consultations FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Admin can view all consultations." ON public.consultations FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE TRIGGER on_consultations_updated
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella REVIEWS
-- Recensioni lasciate dai clienti
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID UNIQUE NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.operator_details(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can create reviews for their consultations." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Public can view approved reviews." ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Admin can manage all reviews." ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));


-- Tabella TRANSACTIONS
-- Tutte le transazioni finanziarie
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type public.transaction_type NOT NULL,
    status public.transaction_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all transactions." ON public.transactions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));


-- Tabella WALLETS
-- Portafoglio virtuale per i clienti
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet." ON public.wallets FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all wallets." ON public.wallets FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE TRIGGER on_wallets_updated
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella NOTIFICATIONS
-- Notifiche per gli utenti
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id);


-- Tabella SUPPORT_TICKETS
-- Ticket di supporto
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status public.ticket_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tickets." ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all tickets." ON public.support_tickets FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE TRIGGER on_support_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella TICKET_MESSAGES
-- Messaggi all'interno di un ticket
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage messages on their own tickets." ON public.ticket_messages FOR ALL USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Admin can manage all ticket messages." ON public.ticket_messages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));


-- Tabella BLOG_POSTS
-- Articoli del blog
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    tags TEXT[],
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published blog posts." ON public.blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admin and operators can manage blog posts." ON public.blog_posts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'operator')));
CREATE TRIGGER on_blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella SITE_SETTINGS
-- Impostazioni globali del sito
CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage site settings." ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Public can read certain settings." ON public.site_settings FOR SELECT USING (key IN ('site_name', 'contact_email', 'terms_url', 'privacy_url'));
CREATE TRIGGER on_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Tabella COMMISSION_REQUESTS
-- Richieste di commissione dagli operatori
CREATE TABLE public.commission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operator_details(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status public.commission_request_status NOT NULL DEFAULT 'pending',
    details JSONB, -- e.g., bank info
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can manage their own commission requests." ON public.commission_requests FOR ALL USING (auth.uid() = operator_id);
CREATE POLICY "Admin can manage all commission requests." ON public.commission_requests FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));


-- Tabella OPERATOR_APPLICATIONS
-- Candidature per diventare operatore
CREATE TABLE public.operator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    motivation TEXT,
    experience TEXT,
    specializations TEXT[],
    status public.application_status NOT NULL DEFAULT 'pending',
    notes TEXT, -- Note per l'admin
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create and view their own application." ON public.operator_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all applications." ON public.operator_applications FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE TRIGGER on_operator_applications_updated
  BEFORE UPDATE ON public.operator_applications
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Ripristino permessi per ruoli interni di Supabase
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;

-- Permessi specifici per lo schema auth
GRANT USAGE ON SCHEMA auth TO postgres, service_role, authenticated, anon;
GRANT SELECT ON auth.users, auth.sessions, auth.identities TO authenticated;
