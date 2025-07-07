-- 🌑 MOONTHIR - MASTER SCHEMA V1.2 🌑
-- Questo script imposta l'intera struttura del database necessaria per la piattaforma.
-- Versione 1.2: Corretti gli UUID di esempio con valori sintatticamente validi.
-- È progettato per essere eseguito una sola volta.

-- 1. TIPI ENUM SIMULATI
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'operator', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('chat', 'call', 'email');
    END IF;
END$$;


-- 2. TABELLA PROFILI
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT,
    avatar_url TEXT,
    -- Dati specifici per l'operatore
    headline TEXT,
    bio TEXT,
    specializations TEXT[],
    is_online BOOLEAN DEFAULT false,
    application_status application_status DEFAULT 'pending',
    is_visible BOOLEAN DEFAULT false,
    -- Dati specifici per il cliente
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';

-- 3. TABELLA SERVIZI
CREATE TABLE IF NOT EXISTS public.services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    price_per_minute NUMERIC(10, 2),
    price_per_consultation NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(operator_id, type),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.services IS 'Services offered by operators.';

-- 4. TABELLA RECENSIONI
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Reviews of operators by clients.';


-- 5. ABILITAZIONE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES DI SICUREZZA (RLS)

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- SERVICES
DROP POLICY IF EXISTS "Services are viewable by everyone." ON public.services;
CREATE POLICY "Services are viewable by everyone."
    ON public.services FOR SELECT
    USING ( true );

DROP POLICY IF EXISTS "Operators can manage their own services." ON public.services;
CREATE POLICY "Operators can manage their own services."
    ON public.services FOR ALL
    USING ( auth.uid() = operator_id );

-- REVIEWS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_approved'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN is_approved BOOLEAN DEFAULT true;
    END IF;
END $$;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone."
    ON public.reviews FOR SELECT
    USING ( is_approved = true );

DROP POLICY IF EXISTS "Users can insert reviews for operators." ON public.reviews;
CREATE POLICY "Users can insert reviews for operators."
    ON public.reviews FOR INSERT
    WITH CHECK ( auth.uid() = client_id );

DROP POLICY IF EXISTS "Users can update their own reviews." ON public.reviews;
CREATE POLICY "Users can update their own reviews."
    ON public.reviews FOR UPDATE
    USING ( auth.uid() = client_id );


-- 7. FUNZIONE PER GESTIRE LA CREAZIONE DI UN PROFILO UTENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 9. INSERIMENTO DATI DI ESEMPIO
DO $$
DECLARE
    -- ===================================================================================
    -- !! ATTENZIONE !!
    -- SOSTITUIRE QUESTI UUID CON GLI UUID REALI DEI VOSTRI UTENTI DI TEST.
    -- Li trovate in Supabase Studio -> Authentication -> Users -> Copia UUID.
    -- Ho usato degli UUID di esempio validi, ma dovete usare i vostri.
    -- ===================================================================================
    client_uuid UUID := '00000000-0000-0000-0000-000000000001'; -- Sostituire con UUID di un utente cliente
    operator1_uuid UUID := '00000000-0000-0000-0000-000000000002'; -- Sostituire con UUID di Luna Stellare
    operator2_uuid UUID := '00000000-0000-0000-0000-000000000003'; -- Sostituire con UUID di Maestro Cosmos
BEGIN
    INSERT INTO public.profiles (id, role, full_name, wallet_balance)
    VALUES (client_uuid, 'client', 'Giulia Rossi', 50.00)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, role, full_name, headline, bio, specializations, avatar_url, application_status, is_visible, is_online)
    VALUES (
        operator1_uuid, 'operator', 'Luna Stellare', 'Cartomante & Tarocchi',
        'Esperta in letture di tarocchi con 15 anni di esperienza, ti guiderà con chiarezza.',
        ARRAY['Tarocchi', 'Amore', 'Lavoro', 'Cartomanzia'], '/placeholder.svg?width=96&height=96',
        'approved', true, true
    ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role, full_name = EXCLUDED.full_name, headline = EXCLUDED.headline,
        bio = EXCLUDED.bio, specializations = EXCLUDED.specializations, application_status = EXCLUDED.application_status,
        is_visible = EXCLUDED.is_visible, is_online = EXCLUDED.is_online;

    INSERT INTO public.services (operator_id, type, price_per_minute)
    VALUES (operator1_uuid, 'chat', 2.50), (operator1_uuid, 'call', 2.50)
    ON CONFLICT (operator_id, type) DO NOTHING;

    INSERT INTO public.profiles (id, role, full_name, headline, bio, specializations, avatar_url, application_status, is_visible, is_online)
    VALUES (
        operator2_uuid, 'operator', 'Maestro Cosmos', 'Astrologo',
        'Astrologo professionista specializzato in carte natali e transiti planetari.',
        ARRAY['Oroscopi', 'Tema Natale', 'Transiti', 'Astrologia'], '/placeholder.svg?width=96&height=96',
        'approved', true, false
    ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role, full_name = EXCLUDED.full_name, headline = EXCLUDED.headline,
        bio = EXCLUDED.bio, specializations = EXCLUDED.specializations, application_status = EXCLUDED.application_status,
        is_visible = EXCLUDED.is_visible, is_online = EXCLUDED.is_online;

    INSERT INTO public.services (operator_id, type, price_per_minute, price_per_consultation)
    VALUES (operator2_uuid, 'chat', 3.20), (operator2_uuid, 'call', 3.20), (operator2_uuid, 'email', 35.00)
    ON CONFLICT (operator_id, type) DO NOTHING;

    INSERT INTO public.reviews (client_id, operator_id, rating, comment)
    VALUES
        (client_uuid, operator1_uuid, 5, 'Luna è incredibile! Le sue letture sono sempre accurate e piene di speranza.'),
        (client_uuid, operator2_uuid, 5, 'Un vero professionista. L''analisi del mio tema natale è stata illuminante.')
    ON CONFLICT DO NOTHING;

END $$;
