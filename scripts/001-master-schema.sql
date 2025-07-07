-- 🌑 MOONTHIR - MASTER SCHEMA V1.0 🌑
-- Questo script crea l'intera struttura del database da zero.
-- È progettato per essere eseguito su un database pulito.

-- 1. CREAZIONE TIPI ENUMERATIVI (per scelte predefinite)
CREATE TYPE public.user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.service_type AS ENUM ('chat', 'call', 'written');
CREATE TYPE public.consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'refunded');
CREATE TYPE public.transaction_type AS ENUM ('recharge', 'consultation_payment', 'payout', 'refund');

-- 2. CREAZIONE TABELLE

-- Tabella unica per tutti i profili, collegata all'autenticazione di Supabase
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Campi specifici per i clienti
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

    -- Campi specifici per gli operatori
    headline TEXT,
    bio TEXT,
    specializations TEXT[],
    is_online BOOLEAN NOT NULL DEFAULT false,
    online_status TEXT DEFAULT 'Offline',
    application_status application_status DEFAULT 'pending',
    is_visible BOOLEAN NOT NULL DEFAULT false,
    commission_rate NUMERIC(5, 2) DEFAULT 20.00,
    fiscal_code TEXT,
    vat_number TEXT,
    billing_address TEXT
);
COMMENT ON TABLE public.profiles IS 'Tabella centrale che contiene i dati di tutti gli utenti, estendendo auth.users.';

-- Tabella per i servizi offerti dagli operatori
CREATE TABLE public.services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2),
    price_per_consultation NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(operator_id, type)
);
COMMENT ON TABLE public.services IS 'Definisce i servizi e i prezzi per ogni operatore.';

-- Tabella per le recensioni
CREATE TABLE public.reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id BIGINT, -- Collegamento opzionale al consulto
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.reviews IS 'Recensioni dei clienti per i consulti effettuati.';

-- Tabella per i consulti (chiamate, chat, etc.)
CREATE TABLE public.consultations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id),
    status consultation_status NOT NULL DEFAULT 'requested',
    started_at TIMESTAMPTZ WITH TIME ZONE,
    ended_at TIMESTAMPTZ WITH TIME ZONE,
    duration_minutes INT,
    final_cost NUMERIC(10, 2),
    recording_url TEXT,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.consultations IS 'Registra ogni sessione di consulto tra cliente e operatore.';

-- Tabella per le transazioni finanziarie
CREATE TABLE public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    consultation_id BIGINT REFERENCES public.consultations(id),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.transactions IS 'Log di tutte le transazioni monetarie (ricariche, pagamenti, payout).';

-- 3. FUNZIONE E TRIGGER per creare un profilo utente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. ABILITAZIONE ROW LEVEL SECURITY (RLS) - FONDAMENTALE PER LA SICUREZZA
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. CREAZIONE DELLE POLITICHE DI SICUREZZA (RLS)
-- I profili sono visibili a tutti, ma ogni utente può modificare solo il proprio.
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- I servizi sono visibili a tutti, ma solo gli operatori possono gestire i propri.
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'operator' AND operator_id = auth.uid()
);

-- Le recensioni approvate sono visibili a tutti, ma solo i clienti possono crearle.
CREATE POLICY "Approved reviews are viewable by everyone." ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view their own reviews." ON public.reviews FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert reviews for their consultations." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Gli utenti possono vedere e gestire solo i propri consulti.
CREATE POLICY "Users can manage their own consultations." ON public.consultations FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- Gli utenti possono vedere solo le proprie transazioni.
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);
