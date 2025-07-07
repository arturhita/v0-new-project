-- 🌑 MOONTHIR - MASTER SCHEMA V3.0 🌑
-- Questo script è progettato per una pulizia completa e una ricostruzione del database.
-- Risolve problemi di stato dovuti a definizioni precedenti.
-- ATTENZIONE: Questo script CANCELLERÀ le tabelle esistenti prima di ricrearle.

-- 1. PULIZIA: Rimozione di tabelle e tipi in ordine inverso di dipendenza
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.transaction_type;
DROP TYPE IF EXISTS public.consultation_status;
DROP TYPE IF EXISTS public.service_type;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.user_role;


-- 2. CREAZIONE: Tipi enumerativi
CREATE TYPE user_role AS ENUM ('client', 'operator', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE service_type AS ENUM ('chat', 'call', 'written');
CREATE TYPE consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'refunded');
CREATE TYPE transaction_type AS ENUM ('recharge', 'consultation_fee', 'payout', 'refund');


-- 3. CREAZIONE: Tabelle

-- TABELLA PROFILI (Unica per tutti gli utenti)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
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
COMMENT ON TABLE public.profiles IS 'Tabella unica per tutti i profili utente (clienti, operatori, admin).';

-- TABELLA SERVIZI OFFERTI DAGLI OPERATORI
CREATE TABLE public.services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2),
    price_per_consultation NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(operator_id, type)
);
COMMENT ON TABLE public.services IS 'Servizi (e loro prezzi) offerti da ciascun operatore.';

-- TABELLA RECENSIONI
CREATE TABLE public.reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Recensioni lasciate dai clienti per gli operatori.';

-- TABELLA CONSULTI
CREATE TABLE public.consultations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id),
    status consultation_status NOT NULL DEFAULT 'requested',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT,
    final_cost NUMERIC(10, 2),
    recording_url TEXT,
    transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.consultations IS 'Registra ogni sessione di consulto tra cliente e operatore.';

-- TABELLA TRANSAZIONI
CREATE TABLE public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    consultation_id BIGINT REFERENCES public.consultations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.transactions IS 'Log di tutte le transazioni monetarie (ricariche, pagamenti, payout).';


-- 4. FUNZIONE E TRIGGER per la sincronizzazione con auth.users
CREATE FUNCTION public.handle_new_user()
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


-- 5. ABILITAZIONE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- 6. POLICIES DI SICUREZZA (RLS)
-- PROFILES
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- SERVICES
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'operator' AND operator_id = auth.uid()
);

-- REVIEWS
CREATE POLICY "Approved reviews are viewable by everyone." ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Clients can insert reviews." ON public.reviews FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND client_id = auth.uid()
);

-- CONSULTATIONS
CREATE POLICY "Users can view their own consultations." ON public.consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Users can create and modify their own consultations." ON public.consultations FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- TRANSACTIONS
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- FINE DELLO SCRIPT
