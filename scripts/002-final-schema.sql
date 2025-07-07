-- 🌑 MOONTHIR - SCHEMA DEFINITIVO V2.0 🌑
-- Questo script unifica e corregge la struttura del database.
-- Sostituisce tutti gli script precedenti e deve essere eseguito su un database pulito.
-- Per pulire il database, eseguire prima lo script '000-cleanup.sql' se necessario.

-- 1. TIPI ENUMERATIVI (se non esistono già)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('chat', 'call', 'written');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_status') THEN
        CREATE TYPE consultation_status AS ENUM ('requested', 'accepted', 'in_progress', 'completed', 'canceled', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('recharge', 'consultation_fee', 'payout', 'refund');
    END IF;
END$$;


-- 2. TABELLA PROFILI (Unica per tutti gli utenti)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Dati specifici per il CLIENTE
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

    -- Dati specifici per l'OPERATORE
    headline TEXT, -- Titolo breve, es. "Cartomante Esperta"
    bio TEXT,
    specializations TEXT[], -- Es. {'tarocchi', 'astrologia', 'amore'}
    is_online BOOLEAN NOT NULL DEFAULT false,
    online_status TEXT DEFAULT 'Offline', -- 'Online', 'Offline', 'In Pausa'
    application_status application_status DEFAULT 'pending',
    is_visible BOOLEAN NOT NULL DEFAULT false, -- Visibile pubblicamente solo se approvato e abilitato
    commission_rate NUMERIC(5, 2) DEFAULT 20.00, -- Percentuale di commissione
    -- Dati fiscali operatore
    fiscal_code TEXT,
    vat_number TEXT,
    billing_address TEXT
);
COMMENT ON TABLE public.profiles IS 'Tabella unica per tutti i profili utente (clienti, operatori, admin).';


-- 3. TABELLA SERVIZI OFFERTI DAGLI OPERATORI
CREATE TABLE IF NOT EXISTS public.services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2), -- Per chat e chiamate
    price_per_consultation NUMERIC(10, 2), -- Per consulti scritti
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(operator_id, type)
);
COMMENT ON TABLE public.services IS 'Servizi (e loro prezzi) offerti da ciascun operatore.';


-- 4. TABELLA RECENSIONI
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_id BIGINT, -- Opzionale, per collegare la recensione a un consulto specifico
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false, -- L'admin deve approvare le recensioni
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Recensioni lasciate dai clienti per gli operatori.';


-- 5. TABELLA CONSULTI (Chat, Chiamate, Scritti)
CREATE TABLE IF NOT EXISTS public.consultations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id),
    status consultation_status NOT NULL DEFAULT 'requested',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT, -- Durata totale in minuti
    final_cost NUMERIC(10, 2),
    recording_url TEXT, -- Per le chiamate
    transcript TEXT, -- Per le chat
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.consultations IS 'Registra ogni sessione di consulto tra cliente e operatore.';


-- 6. TABELLA TRANSAZIONI (Wallet)
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    consultation_id BIGINT REFERENCES public.consultations(id), -- Collega la transazione a un consulto
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.transactions IS 'Log di tutte le transazioni monetarie (ricariche, pagamenti, payout).';


-- 7. FUNZIONE PER GESTIRE LA CREAZIONE DI UN NUOVO UTENTE IN AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce un nuovo profilo quando un utente si registra in auth.users
  -- Il ruolo viene letto dai metadati, altrimenti è 'client' di default.
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER SULLA TABELLA AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 9. ABILITAZIONE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- 10. POLICIES DI SICUREZZA (RLS)

-- PROFILES
CREATE POLICY "I profili sono visibili a tutti" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gli utenti possono aggiornare il proprio profilo" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- L'inserimento è gestito dal trigger, quindi non serve una policy di insert.

-- SERVICES
CREATE POLICY "I servizi sono visibili a tutti" ON public.services FOR SELECT USING (true);
CREATE POLICY "Gli operatori possono gestire i propri servizi" ON public.services FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'operator' AND operator_id = auth.uid()
);

-- REVIEWS
CREATE POLICY "Le recensioni approvate sono visibili a tutti" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "I clienti possono inserire recensioni" ON public.reviews FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client' AND client_id = auth.uid()
);

-- CONSULTATIONS
CREATE POLICY "Utenti possono vedere i propri consulti" ON public.consultations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = operator_id);
CREATE POLICY "Utenti possono creare e modificare i propri consulti" ON public.consultations FOR ALL USING (auth.uid() = client_id OR auth.uid() = operator_id);

-- TRANSACTIONS
CREATE POLICY "Utenti possono vedere le proprie transazioni" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- FINE DELLO SCRIPT
