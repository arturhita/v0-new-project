-- =============================================
-- PARTE 1: PULIZIA COMPLETA (per evitare errori)
-- =============================================
-- Rimuove il trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Rimuove le funzioni esistenti se presenti
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Rimuove le tabelle in ordine inverso di dipendenza
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.consultations;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.profiles;

-- Rimuove i tipi ENUM personalizzati
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.consultation_status;
DROP TYPE IF EXISTS public.transaction_type;
DROP TYPE IF EXISTS public.transaction_status;
DROP TYPE IF EXISTS public.application_status;


-- =============================================
-- PARTE 2: CREAZIONE TIPI E TABELLE
-- =============================================
-- Creazione dei tipi ENUM per consistenza dei dati
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.service_type AS ENUM ('chat', 'call', 'written');
CREATE TYPE public.consultation_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'payment', 'payout', 'refund');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Tabella PROFILES: Contiene dati per tutti gli utenti (clienti, operatori, admin)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  bio TEXT,
  specializations TEXT[],
  phone_number TEXT,
  wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_visible BOOLEAN DEFAULT false, -- Visibilità del profilo operatore
  application_status application_status DEFAULT 'pending',
  commission_rate NUMERIC(5, 2), -- Es. 15.00 per 15%
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Central table for user profile data, linked to auth.users.';

-- Tabella SERVICES: Definisce i servizi offerti da ogni operatore
CREATE TABLE public.services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type service_type NOT NULL,
  price_per_minute NUMERIC(10, 2), -- Per chat e chiamate
  price_per_consultation NUMERIC(10, 2), -- Per consulti scritti
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(operator_id, type)
);
COMMENT ON TABLE public.services IS 'Services offered by operators, with pricing.';

-- Tabella REVIEWS: Recensioni lasciate dai clienti per gli operatori
CREATE TABLE public.reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Client reviews for operators.';

-- Tabella CONSULTATIONS: Traccia ogni sessione di consulenza
CREATE TABLE public.consultations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES public.services(id),
  status consultation_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  final_cost NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.consultations IS 'Tracks each consultation session.';

-- Tabella TRANSACTIONS: Log di tutti i movimenti finanziari
CREATE TABLE public.transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultation_id BIGINT REFERENCES public.consultations(id),
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.transactions IS 'Logs all financial movements in the platform.';


-- =============================================
-- PARTE 3: FUNZIONI E TRIGGERS
-- =============================================
-- Funzione per aggiornare il timestamp 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare 'updated_at' sulla tabella profiles
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Funzione per creare un profilo quando un nuovo utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'role')::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che collega la funzione a auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================
-- PARTE 4: ROW LEVEL SECURITY (RLS)
-- =============================================
-- Abilita RLS su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy per PROFILES
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles." ON public.profiles FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy per SERVICES
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'operator' AND operator_id = auth.uid());
CREATE POLICY "Admins have full access to services." ON public.services FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy per REVIEWS
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their consultations." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy per CONSULTATIONS
CREATE POLICY "Users can view their own consultations." ON public.consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Admins can view all consultations." ON public.consultations FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy per TRANSACTIONS
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions." ON public.transactions FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- =============================================
-- PARTE 5: STORAGE
-- =============================================
-- Inserisce il bucket per gli avatar se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy per leggere le immagini
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy per caricare/aggiornare le immagini
CREATE POLICY "Anyone can upload an avatar." ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update their own avatar." ON storage.objects
FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');
