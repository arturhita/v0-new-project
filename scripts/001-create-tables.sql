-- 🌑 MOONTHIR - SCHEMA V1.3 🌑
-- Crea solo la struttura delle tabelle, senza dati di esempio, per garantire un'esecuzione pulita.

-- 1. TIPI ENUM
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
    headline TEXT,
    bio TEXT,
    specializations TEXT[],
    is_online BOOLEAN DEFAULT false,
    application_status application_status DEFAULT 'pending',
    is_visible BOOLEAN DEFAULT false,
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

-- 6. POLICIES DI SICUREZZA
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Services are viewable by everyone." ON public.services;
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Operators can manage their own services." ON public.services;
CREATE POLICY "Operators can manage their own services." ON public.services FOR ALL USING ( auth.uid() = operator_id );

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING ( is_approved = true );

DROP POLICY IF EXISTS "Users can insert reviews for operators." ON public.reviews;
CREATE POLICY "Users can insert reviews for operators." ON public.reviews FOR INSERT WITH CHECK ( auth.uid() = client_id );

-- 7. FUNZIONE E TRIGGER PER CREARE PROFILI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
