-- ================================================================================================
--  SCHEMA & DATA REBUILD SCRIPT
--  Descrizione: Questo script resetta completamente il database, crea lo schema
--  necessario per la piattaforma e popola i dati iniziali per due operatori.
--  Esecuzione: Eseguire questo script una sola volta per inizializzare l'ambiente.
-- ================================================================================================

-- ================================================================================================
--  FASE 1: PULIZIA E RESET DELLO SCHEMA
-- ================================================================================================
-- Abilita l'estensione per UUID se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disabilita la sicurezza a livello di riga temporaneamente per la pulizia
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operator_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;

-- Rimuove le tabelle esistenti in ordine inverso di dipendenza
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.operator_details;
DROP TABLE IF EXISTS public.profiles;

-- Rimuove la funzione e il trigger esistenti per evitare conflitti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- ================================================================================================
--  FASE 2: CREAZIONE DELLE TABELLE
-- ================================================================================================

-- Tabella dei profili utente, collegata a auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE, -- Denormalizzato per convenienza
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'client', -- Ruoli: 'client', 'operator', 'admin'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores public-facing profile information for all users.';

-- Tabella con dettagli specifici per gli operatori
CREATE TABLE public.operator_details (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_name TEXT UNIQUE NOT NULL,
    bio TEXT,
    specialties TEXT[],
    status TEXT NOT NULL DEFAULT 'pending', -- Stati: 'pending', 'approved', 'rejected', 'suspended'
    commission_rate NUMERIC(5, 2) DEFAULT 15.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.operator_details IS 'Stores detailed information specific to operators.';

-- Tabella dei servizi offerti dagli operatori
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES public.operator_details(user_id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- Tipi: 'chat', 'call', 'email'
    price NUMERIC(10, 2) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(operator_id, service_type)
);
COMMENT ON TABLE public.services IS 'Defines the services and pricing for each operator.';

-- Tabella dei portafogli (wallet) per ogni utente
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.wallets IS 'Manages the credit balance for each user.';

-- Tabella delle transazioni
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- Tipi: 'deposit', 'withdrawal', 'consultation_fee', 'refund'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.transactions IS 'Logs all financial transactions for wallets.';

-- Tabella delle recensioni
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    operator_id UUID NOT NULL REFERENCES public.operator_details(user_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Stores client reviews for operators.';

-- ================================================================================================
--  FASE 3: CREAZIONE DI FUNZIONI E TRIGGER
-- ================================================================================================

-- Funzione per creare automaticamente un profilo e un wallet per un nuovo utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Crea il profilo
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Crea il wallet
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$;

-- Trigger che chiama la funzione dopo la creazione di un utente in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile and wallet upon new user registration.';

-- ================================================================================================
--  FASE 4: ABILITAZIONE DELLA SICUREZZA A LIVELLO DI RIGA (RLS)
-- ================================================================================================

-- Abilita RLS per tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy di base: gli utenti possono vedere tutti i profili, ma modificare solo il proprio
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policy per i wallet: gli utenti possono vedere e gestire solo il proprio wallet
CREATE POLICY "Allow individual access to wallet" ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- Policy per i dettagli operatore: visibili a tutti, modificabili solo da admin (da implementare)
CREATE POLICY "Allow public read access on operator details" ON public.operator_details FOR SELECT USING (true);

-- Policy per i servizi: visibili a tutti
CREATE POLICY "Allow public read access on services" ON public.services FOR SELECT USING (true);

-- ================================================================================================
--  FASE 5: SEEDING DEI DATI INIZIALI (OPERATORI DI PROVA)
-- ================================================================================================
DO $$
DECLARE
    luna_id UUID;
    sol_id UUID;
BEGIN
    -- Crea l'utente "Luna Stellare" in auth.users
    -- La password è 'password123'
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at, confirmed_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'luna.stellare@example.com', crypt('password123', gen_salt('bf')), now(), '', NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"Luna Stellare"}', now(), now(), '', '', NULL, now()
    ) RETURNING id INTO luna_id;

    -- Crea l'utente "Sol Divino" in auth.users
    -- La password è 'password123'
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at, confirmed_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'sol.divino@example.com', crypt('password123', gen_salt('bf')), now(), '', NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"Sol Divino"}', now(), now(), '', '', NULL, now()
    ) RETURNING id INTO sol_id;

    -- Il trigger 'on_auth_user_created' ha già creato i profili e i wallet.
    -- Ora aggiorniamo i loro profili per assegnare il ruolo 'operator'.
    UPDATE public.profiles SET role = 'operator' WHERE id IN (luna_id, sol_id);

    -- Inserisci i dettagli per Luna Stellare
    INSERT INTO public.operator_details (user_id, stage_name, bio, specialties, status)
    VALUES (luna_id, 'Luna Stellare', 'Con anni di esperienza e una profonda connessione con il mondo spirituale, Luna ti guida attraverso le complessità della vita e dell''amore.', '{"Tarocchi", "Amore", "Lavoro"}', 'approved');

    -- Inserisci i servizi per Luna Stellare
    INSERT INTO public.services (operator_id, service_type, price, is_enabled)
    VALUES
        (luna_id, 'chat', 2.50, true),
        (luna_id, 'call', 3.50, true),
        (luna_id, 'email', 30.00, true);

    -- Inserisci i dettagli per Sol Divino
    INSERT INTO public.operator_details (user_id, stage_name, bio, specialties, status)
    VALUES (sol_id, 'Sol Divino', 'Cartomante e sensitivo, specializzato in percorsi di crescita personale e letture karmiche.', '{"Cartomanzia", "Astrologia Karmica", "Crescita Personale"}', 'approved');

    -- Inserisci i servizi per Sol Divino
    INSERT INTO public.services (operator_id, service_type, price, is_enabled)
    VALUES
        (sol_id, 'chat', 2.75, true),
        (sol_id, 'call', 4.00, false),
        (sol_id, 'email', 35.00, true);

END $$;

-- ================================================================================================
--  Fine dello script.
-- ================================================================================================
